from django.db import models
from django.contrib.auth.models import User
import uuid

class Categoria(models.Model):
    nombre = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.nombre


class Producto(models.Model):
    nombre = models.CharField(max_length=100, null=False, unique=True)  
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)  
    cantidad = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f'{self.nombre} ({self.categoria}) - Stock: {self.cantidad}'


class Pedido(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    numero_pedido = models.CharField(
        max_length=20, unique=True, default="", editable=False
    )
    fecha = models.DateTimeField(auto_now_add=True)

    STATUS_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('en_proceso', 'En proceso'),
        ('en_camino', 'En camino'),
        ('entregado', 'Entregado'),
        ('cancelado', 'Cancelado'),
    ]
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pendiente',
    )
    assigned_to = models.ForeignKey(
        'Repartidor',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_orders',
    )
    entrega_estimada = models.DateField(null=True, blank=True) 
    
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

class AuditLog(models.Model):
    ACTIONS = [
        ('login',     'Inicio de sesión'),
        ('logout',    'Cierre de sesión'),
        ('user_add',  'Usuario creado'),
        ('user_del',  'Usuario eliminado'),
        ('prod_add',  'Producto creado'),
        ('prod_edit', 'Producto editado'),
        ('prod_del',  'Producto eliminado'),
        ('cat_add',   'Categoría creada'),
        ('cat_edit',  'Categoría editada'),
        ('cat_del',   'Categoría eliminada'),
        ('order_add', 'Pedido creado'),
        ('order_edit','Pedido editado'),
        ('order_del', 'Pedido eliminado'),
    ]

    user       = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action     = models.CharField(max_length=20, choices=ACTIONS)
    timestamp  = models.DateTimeField(auto_now_add=True)
    description= models.TextField(blank=True)

    class Meta:
        ordering = ['-timestamp']


class Repartidor(models.Model):
    name    = models.CharField(max_length=100)
    country = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.name} ({self.country})"

