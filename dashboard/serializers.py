from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Categoria, Producto, Pedido, PedidoDetalle

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre']


class ProductoSerializer(serializers.ModelSerializer):
    categoria = CategoriaSerializer(read_only=True)
    categoria_id = serializers.PrimaryKeyRelatedField(
        queryset=Categoria.objects.all(),
        source='categoria',
        write_only=True
    )
    class Meta:
        model = Producto
        fields = ['id', 'nombre', 'categoria', 'categoria_id', 'cantidad']


class PedidoDetalleSerializer(serializers.ModelSerializer):
    producto = ProductoSerializer(read_only=True)
    producto_id = serializers.PrimaryKeyRelatedField(
        source='producto',
        queryset=Producto.objects.all(),
        write_only=True
    )

    class Meta:
        model = PedidoDetalle
        fields = ['id', 'producto', 'producto_id', 'cantidad']


class PedidoSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer(read_only=True)     # <-- aquí anidamos todo el user
    detalles = PedidoDetalleSerializer(many=True)

    class Meta:
        model = Pedido
        fields = ('id', 'numero_pedido', 'usuario', 'fecha', 'detalles')
        read_only_fields = ('id', 'numero_pedido', 'usuario', 'fecha')

    def create(self, validated_data):
        detalles_data = validated_data.pop('detalles')
        pedido = Pedido.objects.create(**validated_data)
        for det in detalles_data:
            producto = det['producto']
            cantidad = det['cantidad']
            if producto.cantidad < cantidad:
                raise serializers.ValidationError(
                    f"No hay suficiente stock de {producto.nombre} (quedan {producto.cantidad})."
                )
            PedidoDetalle.objects.create(
                pedido=pedido, producto=producto, cantidad=cantidad
            )
            producto.cantidad -= cantidad
            producto.save()
        return pedido
