from datetime import timedelta
from django.utils import timezone

from rest_framework import viewsets, permissions, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser, SAFE_METHODS
from rest_framework.response import Response

from .models import Categoria, Producto, Pedido, AuditLog, Repartidor
from .serializers import (
    CategoriaSerializer, ProductoSerializer, PedidoSerializer,
    AuditLogSerializer, RepartidorSerializer
)


def get_role(user):
    role = getattr(getattr(user, 'profile', None), 'role', None)
    return (role or '').lower()


class CanManagePedido(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        role = get_role(request.user)

        if request.method in SAFE_METHODS:
            return True
        if request.method == 'POST':
            return role == 'cliente'
        if request.method in ('PUT', 'PATCH'):
            return request.user.is_superuser or role == 'logistica'
        if request.method == 'DELETE':
            return request.user.is_superuser or role == 'cliente'
        return False

    def has_object_permission(self, request, view, obj):
        role = get_role(request.user)
        if request.method in SAFE_METHODS:
            if request.user.is_superuser or role == 'logistica':
                return True
            return obj.usuario_id == request.user.id
        if request.method == 'POST':
            return True
        if request.method in ('PUT', 'PATCH'):
            return request.user.is_superuser or role == 'logistica'
        if request.method == 'DELETE':
            if request.user.is_superuser:
                return True
            return (
                role == 'cliente'
                and obj.usuario_id == request.user.id
                and obj.status == 'pendiente'
            )
        return False


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsAuthenticated]


class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.select_related('categoria').all()
    serializer_class = ProductoSerializer
    permission_classes = [IsAuthenticated]

def _get_or_create_repartidor_for(user):

    name = user.username or user.email or "Logística"
    rep, _ = Repartidor.objects.get_or_create(name=name, defaults={"country": "—"})
    return rep


class PedidoViewSet(viewsets.ModelViewSet):
    serializer_class = PedidoSerializer
    permission_classes = [IsAuthenticated, CanManagePedido]

    def _auto_advance_status(self):
        today = timezone.localdate()
        (Pedido.objects
               .filter(status='en_camino',
                       entrega_estimada__isnull=False,
                       entrega_estimada__lte=today)
               .update(status='entregado'))

    def get_queryset(self):
        self._auto_advance_status()

        qs = (
            Pedido.objects
                  .select_related('usuario', 'assigned_to')
                  .prefetch_related('detalles__producto')
                  .order_by('-fecha')
        )
        user = self.request.user
        role = get_role(user)
        if not (user.is_superuser or role == 'logistica'):
            qs = qs.filter(usuario=user)

        usuario_id = self.request.query_params.get('usuario_id')
        if usuario_id:
            qs = qs.filter(usuario_id=usuario_id)

        return qs

    def perform_create(self, serializer):
        serializer.validated_data.pop('status', None)
        serializer.save(usuario=self.request.user, status='pendiente')

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data.copy()

        target_status = data.get('status')

        if target_status in ('en_proceso', 'en_camino'):
            rep = _get_or_create_repartidor_for(request.user)
            data.setdefault('assigned_to_id', str(rep.id))

        delivery_days = data.get('delivery_days') or data.get('dias')
        if delivery_days not in (None, ''):
            try:
                days = int(delivery_days)
                entrega = timezone.localdate() + timedelta(days=days)
                data['entrega_estimada'] = entrega.isoformat()
            except ValueError:
                pass  

        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        from rest_framework.response import Response 
        from rest_framework import status

        pedido = self.get_object()
        role = get_role(request.user)

        if not request.user.is_superuser:
            if not (role == 'cliente'
                    and pedido.usuario_id == request.user.id
                    and pedido.status == 'pendiente'):
                return Response(
                    {'detail': 'Solo podés cancelar tus pedidos pendientes.'},
                    status=status.HTTP_403_FORBIDDEN
                )

        for detalle in pedido.detalles.all():
            producto = detalle.producto
            producto.cantidad += detalle.cantidad
            producto.save()

        return super().destroy(request, *args, **kwargs)


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.select_related('user').all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        qs = super().get_queryset()
        user_id = self.request.query_params.get('user_id')
        fecha = self.request.query_params.get('date')
        if user_id:
            qs = qs.filter(user_id=user_id)
        if fecha:
            qs = qs.filter(timestamp__date=fecha)
        return qs


class RepartidorViewSet(viewsets.ModelViewSet):
    queryset = Repartidor.objects.all()
    serializer_class = RepartidorSerializer
    permission_classes = [IsAuthenticated]
