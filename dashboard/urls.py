from django.urls import path
from . import views


urlpatterns=[
    path('dashboard/', views.index, name='dashboard-index'), 
    path('staff/', views.staff, name='dashboard-staff'), 
    path('producto/', views.producto, name='dashboard-producto'), 
    path('producto/delete/<int:pk>/', views.producto_delete, name='dashboard-producto-delete'),
    path('pedido/', views.pedido, name='dashboard-pedido'), 
]




