from rest_framework import serializers
from .models import Categoria, Producto, Pedido, PedidoDetalle

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
        queryset=Producto.objects.all(),
        source='producto',
        write_only=True
    )

    class Meta:
        model = PedidoDetalle
        fields = ['id', 'producto', 'producto_id', 'cantidad']

class PedidoSerializer(serializers.ModelSerializer):
    usuario = serializers.StringRelatedField(read_only=True)
    detalles = PedidoDetalleSerializer(many=True)

    class Meta:
        model = Pedido
        fields = ['id', 'numero_pedido', 'usuario', 'fecha', 'detalles']
        read_only_fields = ['numero_pedido', 'fecha', 'usuario']
