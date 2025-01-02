from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from .forms import CrearUserForm, ProfileUpdateForm, UserUpdateForm
from django.contrib import messages
from django.contrib.auth import logout
from django.shortcuts import redirect

# Create your views here.
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