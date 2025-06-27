from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import Categoria, Producto, Pedido, AuditLog, Repartidor
from .serializers import CategoriaSerializer, ProductoSerializer, PedidoSerializer, AuditLogSerializer, RepartidorSerializer

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsAuthenticated]

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.select_related('categoria').all()
    serializer_class = ProductoSerializer
    permission_classes = [IsAuthenticated]

class PedidoViewSet(viewsets.ModelViewSet):
    serializer_class = PedidoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = (
            Pedido.objects
                  .select_related('usuario')              
                  .prefetch_related('detalles__producto')
                  .order_by('-fecha')
        )
        usuario_id = self.request.query_params.get('usuario_id')
        if usuario_id:
            qs = qs.filter(usuario_id=usuario_id) 
        return qs      

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    def destroy(self, request, *args, **kwargs):
        pedido = self.get_object()
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
        fecha   = self.request.query_params.get('date')
        if user_id:
            qs = qs.filter(user_id=user_id)
        if fecha:
            qs = qs.filter(timestamp__date=fecha)
        return qs


class RepartidorViewSet(viewsets.ModelViewSet):
    queryset = Repartidor.objects.all()
    serializer_class = RepartidorSerializer
    permission_classes = [IsAuthenticated]