from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Categoria, Producto, Pedido
from .serializers import CategoriaSerializer, ProductoSerializer, PedidoSerializer

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
                  .select_related('usuario')               # 1. trae usuario
                  .prefetch_related('detalles__producto')  # ya lo tenías
                  .order_by('-fecha')
        )
        usuario_id = self.request.query_params.get('usuario_id')
        if usuario_id:
            qs = qs.filter(usuario_id=usuario_id)         # 2. filtra si se pide
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