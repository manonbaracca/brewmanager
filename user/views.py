from django.http             import JsonResponse
from django.contrib.auth     import login, logout
from django.contrib.auth.forms  import AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf  import ensure_csrf_cookie
from rest_framework.authtoken.models import Token
from rest_framework.decorators     import api_view, permission_classes
from rest_framework.permissions    import IsAdminUser
from rest_framework.response       import Response
from rest_framework                 import status
from django.shortcuts               import get_object_or_404
from django.contrib.auth.models     import User
from .models import Profile

from dashboard.utils        import log_action
from .forms                 import CrearUserForm, UserUpdateForm, ProfileUpdateForm
from .serializers           import StaffSerializer

@ensure_csrf_cookie
def register_api(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'Método no permitido'}, status=405)
    form = CrearUserForm(request.POST)
    if form.is_valid():
        user = form.save()
        log_action(request.user if request.user.is_authenticated else None,
                   'user_add',
                   f'Usuario creado: {user.username}')
        token, _ = Token.objects.get_or_create(user=user)
        return JsonResponse({'username': user.username, 'token': token.key}, status=201)
    return JsonResponse(form.errors, status=400)

@ensure_csrf_cookie
def login_api(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'Método no permitido'}, status=405)
    form = AuthenticationForm(request, data=request.POST)
    if form.is_valid():
        user = form.get_user()
        login(request, user)
        log_action(user, 'login')
        token, _ = Token.objects.get_or_create(user=user)
        return JsonResponse({'username': user.username, 'token': token.key})
    return JsonResponse({'errors': form.errors}, status=400)

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
    profile = request.user.profile
    return JsonResponse({
        'id':            request.user.id,
        'username':      request.user.username,
        'email':         request.user.email,
        'telefono':      str(profile.telefono) if profile.telefono else '',
        'direccion':     profile.direccion or '',
        'is_superuser':  request.user.is_superuser,
        'role':          profile.role,
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

    if request.method == 'GET':
        return Response(StaffSerializer(trabajador).data)

    if request.method == 'PATCH':
        new_role = request.data.get('role')
        if new_role not in dict(Profile.ROLE_CHOICES):
            return Response({'role': 'Rol inválido'}, status=400)
        trabajador.profile.role = new_role
        trabajador.profile.save()
        log_action(request.user, 'user_edit', f'Cambió rol de {trabajador.username} a {new_role}')
        return Response({'role': new_role}, status=200)

    log_action(request.user, 'user_del', f'Eliminó usuario {trabajador.username}')
    trabajador.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

    trabajador = get_object_or_404(User, pk=pk, is_superuser=False)
    if request.method == 'GET':
        return Response(StaffSerializer(trabajador).data)

    if request.method == 'PATCH':
        new_role = request.data.get('role')
        if new_role not in dict(Profile.ROLE_CHOICES):
            return Response({'role': 'Rol inválido'}, status=400)
        trabajador.profile.role = new_role
        trabajador.profile.save()
        log_action(request.user, 'user_edit', f'Cambió rol de {trabajador.username} a {new_role}')
        return Response({'role': new_role}, status=200)

    log_action(request.user, 'user_del', f'Eliminó usuario {trabajador.username}')
    trabajador.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)