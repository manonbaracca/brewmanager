from django.contrib.auth.models import User
from rest_framework import serializers

class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password2': 'Las contraseñas no coinciden.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class StaffSerializer(serializers.ModelSerializer):
    telefono  = serializers.CharField(source='profile.telefono', default='', read_only=True)
    direccion = serializers.CharField(source='profile.direccion', default='', read_only=True)
    role      = serializers.CharField(source='profile.role', default='', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'telefono', 'direccion', 'role']
