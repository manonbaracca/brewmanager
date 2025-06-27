from django.db import models
from django.contrib.auth.models import User
from phonenumber_field.modelfields import PhoneNumberField

class Profile(models.Model):
    ROLE_CHOICES = [
        ('cliente',   'Cliente'),
        ('logistica', 'Logística'),
        ('admin',     'Administrador'),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
    )
    direccion = models.CharField(max_length=100, null=True, blank=True)
    telefono  = PhoneNumberField(blank=True, null=True)
    role      = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='cliente',
    )

    def __str__(self):
        return f'{self.user.username} ({self.get_role_display()})'
