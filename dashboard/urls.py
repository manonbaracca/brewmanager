from django.urls import path
from . import views
from user.views import custom_logout

urlpatterns = [
    path('dashboard/', views.index, name='dashboard-index'), 
    path('staff/', views.staff, name='dashboard-staff'), 
    path('staff/detalles/<int:pk>/', views.staff_detalles, name='dashboard-staff-detalles'), 
    path('producto/', views.producto, name='dashboard-producto'), 
    path('producto/update/<int:pk>/', views.producto_update, name='dashboard-producto-update'),
    path('producto/delete/<int:pk>/', views.producto_delete, name='dashboard-producto-delete'),
    path('pedidos/', views.listado_pedidos, name='dashboard-pedido'),  
    path('hacer-pedido/', views.hacer_pedido, name='dashboard-hacer-pedido'),  
    path('logout/', custom_logout, name='user-logout'),  

]

