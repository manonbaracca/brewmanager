from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.forms import UserCreationForm
from .forms import CrearUserForm, ProfileUpdateForm, UserUpdateForm
from django.contrib import messages
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from dashboard.models import Producto, Categoria, PedidoDetalle
from .forms import CategoriaForm
from django.contrib.auth.views import LoginView



def register (request):
    if request.method == 'POST':
        form =CrearUserForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            messages.success (request, f'Cuenta creada para {username}. Inicie Sesion')
            return redirect ('user-login')
    else: 
        form =CrearUserForm()

    context ={
        'form': form
    }

    return render(request, 'user/register.html', context)

def profile (request):
    return render (request, 'user/profile.html')

def profile_update(request):
    if request.method == 'POST':
        user_form = UserUpdateForm (request.POST, instance=request.user)
        profile_form =ProfileUpdateForm(request.POST, instance=request.user.profile)
        if user_form.is_valid() and profile_form.is_valid():
            user_form.save()
            profile_form.save()
            return redirect('user-profile')
    else:
        user_form = UserUpdateForm (instance=request.user)
        profile_form =ProfileUpdateForm(instance=request.user.profile)
        
    context={
        'user_form': user_form,
        'profile_form': profile_form,
    }
    return render (request, 'user/profile_update.html', context)

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

class CustomLoginView(LoginView):
    template_name = 'user/login.html'

    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect('dashboard-index')
        return super().dispatch(request, *args, **kwargs)