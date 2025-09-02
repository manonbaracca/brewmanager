from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

from django.contrib.auth.models import User
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import send_mail
from django.conf import settings

from .forms import CrearUserForm


class RegisterAPIView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        form = CrearUserForm(request.data)
        if form.is_valid():
            form.save()
            return Response({'detail': 'Usuario creado'}, status=status.HTTP_201_CREATED)
        return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def current_user(request):
    u = request.user
    if not u.is_authenticated:
        return Response({
            'is_authenticated': False,
            'id': None,
            'username': None,
            'email': None,
            'is_superuser': False,
            'role': None,
        })
    profile = getattr(u, 'profile', None)
    return Response({
        'is_authenticated': True,
        'id': u.id,
        'username': u.username,
        'email': u.email,
        'is_superuser': u.is_superuser,
        'role': getattr(profile, 'role', None),
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request_api(request):
    email = (request.data.get('email') or '').strip()
    username = (request.data.get('username') or '').strip()

    user = User.objects.filter(email__iexact=email).first() if email else \
           User.objects.filter(username__iexact=username).first() if username else None

    if user:
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = PasswordResetTokenGenerator().make_token(user)
        frontend = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        link = f"{frontend}/reset-password/{uid}/{token}"

        subject = "Restablecer contraseña - BrewManager"
        message = (
            f"Hola {user.username},\n\n"
            f"Para restablecer tu contraseña, hacé click en este enlace:\n{link}\n\n"
            f"Si no solicitaste esto, ignorá este correo."
        )
        try:
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=True)
        except Exception:
            pass

    return Response({'detail': 'Si el email/usuario existe, enviamos un link de reseteo.'}, status=200)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm_api(request):
    uid = request.data.get('uid')
    token = request.data.get('token')
    p1 = request.data.get('password1', '')
    p2 = request.data.get('password2', '')

    if not (uid and token and p1 and p2):
        return Response({'detail': 'Faltan datos'}, status=400)
    if p1 != p2:
        return Response({'detail': 'Las contraseñas no coinciden'}, status=400)

    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
    except Exception:
        return Response({'detail': 'Enlace inválido'}, status=400)

    gen = PasswordResetTokenGenerator()
    if not gen.check_token(user, token):
        return Response({'detail': 'Token inválido o expirado'}, status=400)

    user.set_password(p1)
    user.save()
    return Response({'detail': 'Contraseña actualizada correctamente'}, status=200)
