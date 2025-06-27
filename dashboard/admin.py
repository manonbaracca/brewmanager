from django.contrib import admin
from .models import Producto, Pedido, Repartidor

admin.site.site_header = 'Stockify Dashboard'

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('nombre','categoria','cantidad')
    list_filter  = ('categoria',)

@admin.register(Repartidor)
class RepartidorAdmin(admin.ModelAdmin):
    list_display = ('name','country')

@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = ('numero_pedido','usuario','status','assigned_to')
    list_filter  = ('status','assigned_to__country')
