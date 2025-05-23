from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from phonenumber_field.formfields import PhoneNumberField
from .models import Profile

class CrearUserForm(UserCreationForm):
    email = forms.EmailField()

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']


class UserUpdateForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['username', 'email']


class ProfileUpdateForm(forms.ModelForm):
    telefono = PhoneNumberField(label='Teléfono', required=False)

    class Meta:
        model = Profile
        fields = ['telefono', 'direccion']
        widgets = {
            'direccion': forms.TextInput(attrs={'class': 'form-control'})
        }


class CategoriaForm(forms.Form):
    categoria = forms.CharField(label='Nueva Categoría', max_length=100, required=True)
