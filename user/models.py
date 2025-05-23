
from django.db import models
from django.contrib.auth.models import User
from phonenumber_field.modelfields import PhoneNumberField

class Profile(models.Model):
    staff = models.OneToOneField(User, on_delete=models.CASCADE, null=True)
    direccion = models.CharField(max_length=100, null=True)
    telefono = PhoneNumberField(blank=True, null=True)

    def __str__(self):
        return f'{self.staff.username}-Profile'