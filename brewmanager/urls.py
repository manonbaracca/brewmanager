from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from django.views.generic import TemplateView  
from user import urls as user_urls

from dashboard.api_views import (
    CategoriaViewSet,
    ProductoViewSet,
    PedidoViewSet,
    AuditLogViewSet      
)

router = DefaultRouter()
router.register(r'categorias',    CategoriaViewSet,   basename='api-categorias')
router.register(r'productos',     ProductoViewSet,    basename='api-productos')
router.register(r'pedidos',       PedidoViewSet,      basename='api-pedidos')
router.register(r'audit-logs',    AuditLogViewSet,    basename='api-audit-logs')  # <-- registra aquí

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('user.urls')),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
    path('api-token-auth/', obtain_auth_token, name='api-token-auth'),
    path('', include('dashboard.urls')),

]

urlpatterns += [
    re_path(
        r'^(?!api/|admin/|static/|media/).*$',
        TemplateView.as_view(template_name='index.html'),
        name='spa'
    ),
]
