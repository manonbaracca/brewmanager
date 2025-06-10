from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .api_views import CategoriaViewSet, ProductoViewSet, PedidoViewSet
from user.views import (
    ajustes, ajustes_categorias, agregar_categoria,
    editar_categoria, eliminar_categoria
)

router = DefaultRouter()
router.register(r'categorias', CategoriaViewSet, basename='api-categorias')
router.register(r'productos',  ProductoViewSet,  basename='api-productos')
router.register(r'pedidos',     PedidoViewSet,     basename='api-pedidos')

urlpatterns = [
    path('api/', include(router.urls)),

    path('dashboard/',               views.index,           name='dashboard-index'),
    path('staff/',                   views.staff,           name='dashboard-staff'),
    path('staff/detalles/<int:pk>/', views.staff_detalles,  name='dashboard-staff-detalles'),
    path('staff/delete/<int:pk>/',   views.staff_delete,    name='dashboard-staff-delete'),
    path('producto/',                views.producto,        name='dashboard-producto'),
    path('producto/update/<int:pk>/',views.producto_update, name='dashboard-producto-update'),
    path('producto/delete/<int:pk>/',views.producto_delete, name='dashboard-producto-delete'),
    path('pedidos/',                 views.listado_pedidos, name='dashboard-pedido'),
    path('hacer-pedido/',            views.hacer_pedido,    name='dashboard-hacer-pedido'),
    path('ajustes/',                  ajustes,              name='ajustes'),
    path('ajustes/categorias/',       ajustes_categorias,   name='ajustes-categorias'),
    path('ajustes/categorias/agregar/',  agregar_categoria, name='agregar-categoria'),
    path('ajustes/categorias/editar/<int:categoria_id>/', editar_categoria, name='editar-categoria'),
    path('ajustes/categoria/eliminar/<int:pk>/', eliminar_categoria, name='eliminar-categoria'),
    path('ver-logs/',                views.ver_logs,       name='ver-logs'),
]
