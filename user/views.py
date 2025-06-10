from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .forms import CrearUserForm, ProfileUpdateForm, UserUpdateForm
from django.contrib import messages
from django.contrib.auth import logout, login
from django.contrib.auth.decorators import login_required
from dashboard.models import Producto, Categoria, PedidoDetalle
from .forms import CategoriaForm
from django.contrib.auth.views import LoginView
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from .serializers import StaffSerializer

@ensure_csrf_cookie
def register_api(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'Método no permitido'}, status=405)
    form = CrearUserForm(request.POST)
    if form.is_valid():
        user = form.save()
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
        token, _ = Token.objects.get_or_create(user=user)
        return JsonResponse({'username': user.username, 'token': token.key})
    return JsonResponse({'errors': form.errors}, status=400)


@login_required
def logout_api(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'Método no permitido'}, status=405)
    Token.objects.filter(user=request.user).delete()
    logout(request)
    return JsonResponse({'detail': 'Desconectado'})

@login_required
def profile_api(request):
    return JsonResponse({
        'id':       request.user.id,        
        'username': request.user.username,
        'email':    request.user.email,
        'telefono': str(request.user.profile.telefono) if request.user.profile.telefono else '',
        'direccion': request.user.profile.direccion or '',
        'is_superuser': request.user.is_superuser,
    })



@ensure_csrf_cookie
@login_required
def profile_update_api(request):
    if request.method != 'POST':
        return JsonResponse({'detail': 'Método no permitido'}, status=405)

    user_form    = UserUpdateForm(request.POST, instance=request.user)
    profile_form = ProfileUpdateForm(request.POST, instance=request.user.profile)

    p = request.user.profile
    if user_form.is_valid() and profile_form.is_valid():
        user_form.save()
        profile_form.save()
        return JsonResponse({
            'username':      request.user.username,
            'email':         request.user.email,
            'telefono':      str(p.telefono) if p.telefono else '',
            'direccion':     p.direccion or '',
            'is_superuser':  request.user.is_superuser,
        })
    errors = {}
    errors.update(user_form.errors)
    errors.update(profile_form.errors)
    return JsonResponse(errors, status=400)

def custom_logout(request):
    list(messages.get_messages(request))
    logout(request)
    messages.success(request, "Has cerrado sesión exitosamente.")
    return redirect('user-login') 



@login_required
def ajustes(request):
    return render(request, 'user/ajustes.html')

@login_required
def ajustes_categorias(request):
    categorias = Categoria.objects.all()
    return render(request, 'user/ajustes_categorias.html', {'categorias': categorias})

@login_required
def agregar_categoria(request):
    if request.method == 'POST':
        nueva_categoria = request.POST.get('nueva_categoria')
        if Categoria.objects.filter(nombre=nueva_categoria).exists():
            messages.error(request, 'La categoría ya existe.')
        else:
            Categoria.objects.create(nombre=nueva_categoria)
            messages.success(request, f'Categoría "{nueva_categoria}" agregada exitosamente.')
        return redirect('ajustes-categorias')



@login_required
def editar_categoria(request, categoria_id):
    categoria = get_object_or_404(Categoria, id=categoria_id)
    if request.method == 'POST':
        nuevo_nombre = request.POST.get('nueva_categoria')
        if Categoria.objects.filter(nombre=nuevo_nombre).exclude(id=categoria.id).exists():
            messages.error(request, 'Ya existe una categoría con ese nombre.')
        else:
            categoria.nombre = nuevo_nombre
            categoria.save()
            messages.success(request, f'Categoría actualizada a "{nuevo_nombre}".')
        return redirect('ajustes-categorias')

@login_required
def eliminar_categoria(request, pk):
    categoria = get_object_or_404(Categoria, id=pk)

    productos_asociados = Producto.objects.filter(categoria=categoria)
    if productos_asociados.exists():
        messages.error(request, f"No puedes eliminar la categoría '{categoria.nombre}' porque tiene productos asociados.")
        return redirect('ajustes-categorias')

    pedidos_asociados = PedidoDetalle.objects.filter(producto__categoria=categoria)
    if pedidos_asociados.exists():
        messages.error(request, f"No puedes eliminar la categoría '{categoria.nombre}' porque hay pedidos asociados.")
        return redirect('ajustes-categorias')

    categoria.delete()
    messages.success(request, f"La categoría '{categoria.nombre}' se eliminó correctamente.")
    return redirect('ajustes-categorias')


@api_view(['GET'])
@permission_classes([IsAdminUser])
def staff_list_api(request):

    qs = User.objects.filter(is_superuser=False)
    data = StaffSerializer(qs, many=True).data
    return Response(data)


@api_view(['GET','DELETE'])
@permission_classes([IsAdminUser])
def staff_detail_api(request, pk):
    user = get_object_or_404(User, pk=pk, is_superuser=False)
    if request.method == 'GET':
        return Response(StaffSerializer(user).data)
    else:  
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)