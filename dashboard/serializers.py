from rest_framework import serializers
from django.contrib.auth.models import User
from .models import ( Categoria, Producto, Pedido, PedidoDetalle, AuditLog, Repartidor)

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


class RepartidorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Repartidor
        fields = ['id', 'name', 'country']


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
    usuario = UsuarioSerializer(read_only=True)
    detalles = PedidoDetalleSerializer(many=True)
    status = serializers.ChoiceField(choices=Pedido.STATUS_CHOICES, required=False)
    assigned_to = RepartidorSerializer(read_only=True)
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        source='assigned_to',
        queryset=Repartidor.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )
    entrega_estimada = serializers.DateField(required=False, allow_null=True)


    class Meta:
        model = Pedido
        fields = [
            'id',
            'numero_pedido',
            'usuario',
            'fecha',
            'status',
            'assigned_to',
            'assigned_to_id',
            'entrega_estimada',
            'detalles',
        ]
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

    def update(self, instance, validated_data):
        instance.status = validated_data.get('status', instance.status)
        instance.assigned_to = validated_data.get('assigned_to', instance.assigned_to)
        if 'entrega_estimada' in validated_data:
            instance.entrega_estimada = validated_data.get('entrega_estimada')


        instance.save()
        return instance


class AuditLogSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username', default='', read_only=True)

    class Meta:
        model = AuditLog
        fields = ['id', 'user', 'action', 'timestamp', 'description']
