from django.db import models
from django.contrib.auth.models import User

CATEGORY = (
    ('Libreria', 'Libreria'),
    ('Electronicos', 'Electronicos'),
    ('Alimentos', 'Alimentos'),
)

class Producto(models.Model):
    nombre = models.CharField(max_length=100, null=True)
    categoria = models.CharField(max_length=20, choices=CATEGORY, null=True)
    cantidad = models.PositiveIntegerField(null=True)

    def __str__(self):
        return f'{self.nombre}-{self.cantidad}'
    

class Pedido (models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, null=True)
    usuario = models.ForeignKey(User, models.CASCADE, null=True)
    pedido_cantidad = models.PositiveIntegerField (null=True)
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.producto} pedido por {self.usuario.username}'