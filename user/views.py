from django.http import JsonResponse
from django.contrib.auth import login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import ensure_csrf_cookie
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.core.mail import send_mail
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
logger = logging.getLogger(__name__)


@ensure_csrf_cookie
def csrf_api(request):
    return JsonResponse({
        "detail": "CSRF cookie set",
        "csrfToken": get_token(request),
    })
@ensure_csrf_cookie
def register_api(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'Método no permitido'}, status=405)

    form = CrearUserForm(request.POST)
    if form.is_valid():
        user = form.save()
        log_action(
            request.user if request.user.is_authenticated else None,
            'user_add',
            f'Usuario creado: {user.username}'
        )
        token, _ = Token.objects.get_or_create(user=user)
        return JsonResponse({'username': user.username, 'token': token.key}, status=201)

    return JsonResponse(form.errors, status=400)

@ensure_csrf_cookie
def login_api(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'Método no permitido'}, status=405)

    try:
        form = AuthenticationForm(request, data=request.POST)
        if not form.is_valid():
            return JsonResponse({'errors': form.errors}, status=400)

        user = form.get_user()

        otp = OTPCode.create_for_user(user, minutes_valid=10)

        to_email = user.email or None
        if to_email:
            try:
                send_mail(
                    "Tu código de verificación (OTP) - BrewManager",
                    f"Hola {user.username},\n\nTu código de verificación es: {otp.code}\nVence en 10 minutos.",
                    settings.DEFAULT_FROM_EMAIL,
                    [to_email],
                    fail_silently=True,
                )
            except Exception:
                logger.exception("Fallo enviando OTP por email")

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

    except Exception as e:
        logger.exception("Excepción en login_api")
        return JsonResponse({'detail': 'internal_error', 'error': str(e)}, status=500)

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
        'id':            request.user.id,
        'username':      request.user.username,
        'email':         request.user.email,
        'telefono':      str(p.telefono) if p.telefono else '',
        'direccion':     p.direccion or '',
        'is_superuser':  request.user.is_superuser,
        'role':          p.role,
    })


@ensure_csrf_cookie
@login_required
def profile_update_api(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'Método no permitido'}, status=405)

    user_form    = UserUpdateForm(request.POST, instance=request.user)
    profile_form = ProfileUpdateForm(request.POST, instance=request.user.profile)

    if user_form.is_valid() and profile_form.is_valid():
        user_form.save()
        profile_form.save()
        log_action(request.user, 'user_edit', 'Perfil actualizado')
        p = request.user.profile
        return JsonResponse({
            'username':     request.user.username,
            'email':        request.user.email,
            'telefono':     str(p.telefono) if p.telefono else '',
            'direccion':    p.direccion or '',
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