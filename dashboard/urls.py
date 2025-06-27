from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .api_views import CategoriaViewSet, ProductoViewSet, PedidoViewSet, AuditLogViewSet, RepartidorViewSet


router = DefaultRouter()
router.register(r'categorias', CategoriaViewSet, basename='api-categorias')
router.register(r'productos',  ProductoViewSet,  basename='api-productos')
router.register(r'pedidos',     PedidoViewSet,     basename='api-pedidos')
router.register(r'audit-logs', AuditLogViewSet, basename='api-audit-logs')
router.register(r'repartidores', RepartidorViewSet, basename='api-repartidores')

urlpatterns = [

    path('', include(router.urls)),
]
