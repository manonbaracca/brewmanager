from django.db import models
from django.contrib.auth.models import User
import uuid

CATEGORY_CHOICES = [
    ('Libreria', 'Libreria'),
    ('Electronicos', 'Electrónicos'),
    ('Alimentos', 'Alimentos'),
]

class Producto(models.Model):
    nombre = models.CharField(max_length=100, null=False, unique=True)  
    categoria = models.CharField(max_length=20, choices=CATEGORY_CHOICES, null=False)  
    cantidad = models.PositiveIntegerField(default=0) 
    def __str__(self):
        return f'{self.nombre} ({self.categoria}) - Stock: {self.cantidad}'

class Pedido(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    numero_pedido = models.CharField(
        max_length=20, unique=True, default="", editable=False
    )
    fecha = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.numero_pedido:
            self.numero_pedido = f"ORD-{str(uuid.uuid4())[:8]}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.numero_pedido} - {self.usuario.username} - {self.fecha.strftime("%Y-%m-%d")}'

class PedidoDetalle(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name="detalles")
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField()

    def __str__(self):
        return f'{self.pedido.numero_pedido} - {self.producto.nombre} x {self.cantidad}'


