from django import forms

from .models import Producto, Pedido

class ProductoForm (forms.ModelForm):
    class Meta:
        model = Producto
        fields = ['nombre', 'categoria', 'cantidad']

class PedidoForm(forms.Form):
    productos = forms.ModelMultipleChoiceField(
        queryset=Producto.objects.all(),
        widget=forms.CheckboxSelectMultiple,
        label="Productos"
    )
    cantidades = forms.CharField(
        widget=forms.TextInput(attrs={'placeholder': 'Cantidades separadas por comas'}),
        label="Cantidades"
    )

