from django.contrib import admin
from .models import Producto, Pedido

admin.site.site_header = 'Stockify Dashboard'

class ProductoAdmin (admin.ModelAdmin):
    list_display = ('nombre','categoria', 'cantidad')
    list_filter = ('categoria',)
# Register your models here.
admin.site.register (Producto, ProductoAdmin)
admin.site.register (Pedido)
