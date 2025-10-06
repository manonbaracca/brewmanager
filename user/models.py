from datetime import timedelta

from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone
from phonenumber_field.modelfields import PhoneNumberField


class Profile(models.Model):
    ROLE_CHOICES = [
        ('cliente', 'Cliente'),
        ('logistica', 'Logística'),
        ('admin', 'Administrador'),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
    )
    direccion = models.CharField(max_length=100, null=True, blank=True)
    telefono = PhoneNumberField(blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='cliente')

    def __str__(self):
        return f'{self.user.username} ({self.get_role_display()})'


class OTPCode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='otps')
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    attempts = models.PositiveIntegerField(default=0)
    used = models.BooleanField(default=False)

    @classmethod
    def create_for_user(cls, user, minutes_valid=10):
        import secrets

        code = f"{secrets.randbelow(1_000_000):06d}"
        expires = timezone.now() + timedelta(minutes=minutes_valid)
        return cls.objects.create(user=user, code=code, expires_at=expires)

    def is_valid(self):
        return (not self.used) and timezone.now() <= self.expires_at and self.attempts < 5

    def __str__(self):
        return f"OTP {self.code} for {self.user.username}"
