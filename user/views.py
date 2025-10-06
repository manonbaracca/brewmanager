from django.http import JsonResponse
from django.contrib.auth import login, logout, get_user_model
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import ensure_csrf_cookie
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.conf import settings
from django.middleware.csrf import get_token

from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status

from .models import Profile, OTPCode
from .forms import CrearUserForm, UserUpdateForm, ProfileUpdateForm
from .serializers import StaffSerializer
from dashboard.utils import log_action

import logging
from threading import Thread
from django.core.mail import EmailMessage, get_connection
import socket, json
from django.http import JsonResponse

logger = logging.getLogger(__name__)


@ensure_csrf_cookie
def csrf_api(request):
    return JsonResponse({"detail": "CSRF cookie set", "csrfToken": get_token(request)})


@ensure_csrf_cookie
def register_api(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'Método no permitido'}, status=405)

    form = CrearUserForm(request.POST)
    if form.is_valid():
        user = form.save()
        log_action(request.user if request.user.is_authenticated else None,
                   'user_add', f'Usuario creado: {user.username}')
        token, _ = Token.objects.get_or_create(user=user)
        return JsonResponse({'username': user.username, 'token': token.key}, status=201)

    return JsonResponse(form.errors, status=400)

@ensure_csrf_cookie
def login_api(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'Método no permitido'}, status=405)

    form = AuthenticationForm(request, data=request.POST)
    if not form.is_valid():
        return JsonResponse({'errors': form.errors}, status=400)

    user = form.get_user()
    otp = OTPCode.create_for_user(user, minutes_valid=10)

    to_email = user.email or None
    if to_email:
        subject = "Tu código de verificación (OTP) - BrewManager"
        message = (
            f"Hola {user.username},\n\n"
            f"Tu código de verificación es: {otp.code}\n"
            f"Vence en 10 minutos.\n\n"
            f"Si no intentaste iniciar sesión, ignorá este correo."
        )
        try:
            Thread(
                target=_send_otp_async,
                args=(subject, message, to_email),
                daemon=True,
            ).start()
        except Exception:
            logger.exception("No se pudo encolar el envío de OTP")

    masked = None
    if to_email:
        name, _, domain = to_email.partition("@")
        masked = (name[:2] + "****@" + domain) if domain else None

    return JsonResponse({
        'otp_required': True,
        'otp_id': otp.id,
        'expires_at': otp.expires_at.isoformat(),
        'masked_email': masked,
    }, status=202)

def _send_otp_async(subject, message, to_email):
    try:
        conn = get_connection(timeout=getattr(settings, 'EMAIL_TIMEOUT', 15))
        EmailMessage(subject, message, settings.DEFAULT_FROM_EMAIL, [to_email], connection=conn).send()
    except Exception:
        logger.exception("Error enviando OTP por email")

@ensure_csrf_cookie
def verify_otp_api(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'Método no permitido'}, status=405)

    otp_id = request.POST.get('otp_id') or request.GET.get('otp_id')
    code = request.POST.get('code') or request.GET.get('code')
    if not otp_id or not code:
        return JsonResponse({'detail': 'Faltan datos'}, status=400)

    otp = get_object_or_404(OTPCode, id=otp_id)
    if not otp.is_valid():
        return JsonResponse({'detail': 'OTP inválido o expirado'}, status=400)

    otp.attempts += 1
    otp.save(update_fields=['attempts'])

    if code != otp.code:
        return JsonResponse({'detail': 'Código incorrecto'}, status=400)

    otp.used = True
    otp.save(update_fields=['used'])

    user = otp.user
    login(request, user)
    log_action(user, 'login')

    token, _ = Token.objects.get_or_create(user=user)
    profile = getattr(user, 'profile', None)
    return JsonResponse({
        'username': user.username,
        'token': token.key,
        'is_superuser': user.is_superuser,
        'role': getattr(profile, 'role', None),
    })


@login_required
def logout_api(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'Método no permitido'}, status=405)

    log_action(request.user, 'logout')
    Token.objects.filter(user=request.user).delete()
    logout(request)
    return JsonResponse({'detail': 'Desconectado'})


@login_required
def profile_api(request):
    p = request.user.profile
    return JsonResponse({
        'id': request.user.id,
        'username': request.user.username,
        'email': request.user.email,
        'telefono': str(p.telefono) if p.telefono else '',
        'direccion': p.direccion or '',
        'is_superuser': request.user.is_superuser,
        'role': p.role,
    })


@ensure_csrf_cookie
@login_required
def profile_update_api(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'Método no permitido'}, status=405)

    user_form = UserUpdateForm(request.POST, instance=request.user)
    profile_form = ProfileUpdateForm(request.POST, instance=request.user.profile)

    if user_form.is_valid() and profile_form.is_valid():
        user_form.save()
        profile_form.save()
        log_action(request.user, 'user_edit', 'Perfil actualizado')
        p = request.user.profile
        return JsonResponse({
            'username': request.user.username,
            'email': request.user.email,
            'telefono': str(p.telefono) if p.telefono else '',
            'direccion': p.direccion or '',
            'is_superuser': request.user.is_superuser,
        })

    errors = {}
    errors.update(user_form.errors)
    errors.update(profile_form.errors)
    return JsonResponse(errors, status=400)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def staff_list_api(request):
    qs = User.objects.all()
    data = StaffSerializer(qs, many=True).data
    return Response(data)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAdminUser])
def staff_detail_api(request, pk):
    trabajador = get_object_or_404(User, pk=pk, is_superuser=False)
    profile, _ = Profile.objects.get_or_create(user=trabajador, defaults={'role': 'cliente'})

    if request.method == 'GET':
        return Response(StaffSerializer(trabajador).data)

    if request.method == 'PATCH':
        new_role = (request.data.get('role') or '').strip().lower()
        valid_roles = {k for k, _ in Profile.ROLE_CHOICES}
        if new_role not in valid_roles:
            return Response({'role': 'Rol inválido'}, status=400)

        profile.role = new_role
        profile.save(update_fields=['role'])
        log_action(request.user, 'user_edit', f'Cambió rol de {trabajador.username} a {new_role}')
        return Response({'role': new_role}, status=200)

    log_action(request.user, 'user_del', f'Eliminó usuario {trabajador.username}')
    trabajador.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


def health_db(request):
    try:
        n = get_user_model().objects.count()
        return JsonResponse({"db": "ok", "users": n})
    except Exception as e:
        logger.exception("health_db failed")
        return JsonResponse({"db": "error", "error": str(e)}, status=500)


def health_smtp(request):
    host = "smtp.gmail.com"
    port = 587
    try:
        sock = socket.create_connection((host, port), timeout=5)
        sock.close()
        return JsonResponse({"smtp_connect": "ok", "host": host, "port": port})
    except Exception as e:
        return JsonResponse({"smtp_connect": "error", "host": host, "port": port, "error": str(e)}, status=503)