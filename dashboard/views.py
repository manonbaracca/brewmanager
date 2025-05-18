
from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, JsonResponse
from .models import Producto, Pedido, PedidoDetalle, Categoria
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from .forms import ProductoForm, PedidoForm
from django.contrib import messages
from collections import defaultdict
from datetime import date
from django.db.models import Q
from django.core.paginator import Paginator
import uuid
import json
import os
import logging
from django.conf import settings


logger = logging.getLogger('app_logger')

def home(request):
    return render(request, 'dashboard/home.html')

@login_required
def index(request):
    pedidos = Pedido.objects.prefetch_related("detalles__producto").all()
    productos = Producto.objects.all()
    trabajadores_count = User.objects.filter(is_superuser=False).count()
    pedidos_count = Pedido.objects.all().count()
    product_count = Producto.objects.all().count()
    productos_sin_stock = Producto.objects.filter(cantidad=0)
    pedidos_usuario = Pedido.objects.filter(usuario=request.user).prefetch_related('detalles')

    logger.info(f"Vista 'index' cargada. Total de pedidos: {len(pedidos)}. Total de productos: {len(productos)}.")
    
    productos_pedidos = defaultdict(int)
    for pedido in pedidos:
        for detalle in pedido.detalles.all():
            productos_pedidos[detalle.producto.nombre] += detalle.cantidad

    productos_labels = list(productos_pedidos.keys())
    productos_cantidades = list(productos_pedidos.values())

    context = {
        "pedidos": pedidos,
        "productos": productos,
        "pedidos": pedidos_usuario,
        "productos_labels": productos_labels,
        "productos_cantidades": productos_cantidades,
        'trabajadores_count': trabajadores_count,
        'pedidos_count': pedidos_count,
        'product_count': product_count,
        'productos_sin_stock': productos_sin_stock,
    }
    return render(request, "dashboard/index.html", context)


@login_required
def staff(request):
    trabajadores = User.objects.filter(is_superuser=False)
    trabajadores_count = trabajadores.count() 
    pedidos_count = Pedido.objects.all().count()
    product_count = Producto.objects.all().count()
    productos_sin_stock = Producto.objects.filter(cantidad=0)

    context = {
        'trabajadores': trabajadores,
        'trabajadores_count': trabajadores_count,
        'pedidos_count': pedidos_count,
        'product_count': product_count,
        'productos_sin_stock': productos_sin_stock,
    }
    return render(request, 'dashboard/staff.html', context)


@login_required
def staff_detalles(request, pk):
    trabajadores_count = User.objects.filter(is_superuser=False).count()
    pedidos_count = Pedido.objects.all().count()
    product_count = Producto.objects.all().count()
    trabajadores = User.objects.get(id=pk)
    productos_sin_stock = Producto.objects.filter(cantidad=0)

    context = {
        'trabajadores': trabajadores,
        'trabajadores_count': trabajadores_count,
        'pedidos_count': pedidos_count,
        'product_count': product_count,
        'productos_sin_stock': productos_sin_stock,
    }
    return render(request, 'dashboard/staff_detalles.html', context)


@login_required
def producto(request):
    trabajadores_count = User.objects.filter(is_superuser=False).count()
    pedidos_count = Pedido.objects.all().count()
    product_count = Producto.objects.all().count()
    productos_sin_stock = Producto.objects.filter(cantidad=0)
    categoria_id = request.GET.get('categoria', 'Todos') 

 
    if categoria_id != 'Todos':
        items = Producto.objects.filter(categoria_id=categoria_id) 
    else:
        items = Producto.objects.all()
    categoria_id = request.GET.get('categoria', 'Todos') 
    if request.method == 'POST':
        form = ProductoForm(request.POST)
        if form.is_valid():
            nombre = form.cleaned_data['nombre']
            if Producto.objects.filter(nombre=nombre).exists():  
                messages.error(request, 'Ya existe un producto con ese nombre.')
            else:
                form.save()
                logger.info(f"Nuevo producto agregado: {nombre}.")

                messages.success(request, 'Producto agregado exitosamente.')
                return redirect('dashboard-producto')
    else:
        form = ProductoForm()

    categorias_disponibles = Categoria.objects.all()  

    context = {
        'items': items,
        'form': form,
        'trabajadores_count': trabajadores_count,
        'pedidos_count': pedidos_count,
        'product_count': product_count,
        'productos_sin_stock': productos_sin_stock,
        'categorias_disponibles': categorias_disponibles,
        'categoria_seleccionada': categoria_id,
    }
    return render(request, 'dashboard/producto.html', context)

@login_required
def producto_delete(request, pk):
    item = Producto.objects.get(id=pk)
    if request.method =='POST':
        item.delete()
        return redirect('dashboard-producto')
    return render(request, 'dashboard/producto_delete.html')

@login_required
def producto_update(request, pk):
    item = Producto.objects.get(id=pk)

    if request.method =='POST':
        form = ProductoForm(request.POST, instance=item)
        if form.is_valid():
            form.save()
            return redirect ('dashboard-producto')
    else:
        form = ProductoForm(instance=item)
    context={
        'form': form,
    }
    return render(request, 'dashboard/producto_update.html', context)



@login_required
def listado_pedidos(request):
    pedidos = Pedido.objects.all().prefetch_related("detalles__producto").order_by("-fecha")
    trabajadores_count = User.objects.filter(is_superuser=False).count()
    pedidos_count = pedidos.count()
    product_count = Producto.objects.all().count()
    productos_sin_stock = Producto.objects.filter(cantidad=0)
    fecha_filtro = request.GET.get('fecha')
    usuario_filtro = request.GET.get('usuario')


    if fecha_filtro == "Hoy":
        pedidos = pedidos.filter(fecha__date=date.today())
    elif fecha_filtro == "Este mes":
        pedidos = pedidos.filter(fecha__year=date.today().year, fecha__month=date.today().month)
    elif fecha_filtro == "Este año":
        pedidos = pedidos.filter(fecha__year=date.today().year)


    if usuario_filtro and usuario_filtro != "Todos":
        pedidos = pedidos.filter(usuario_id=usuario_filtro)


    context = {
        "pedidos": pedidos,
        'trabajadores_count': trabajadores_count,
        'pedidos_count': pedidos_count,
        'product_count': product_count,
        'productos_sin_stock': productos_sin_stock,
        "usuarios": User.objects.all(),
        "fecha_filtro": fecha_filtro,
        "usuario_filtro": usuario_filtro,
    }
    return render(request, "dashboard/pedido.html", context)


@login_required
def hacer_pedido(request):
    productos = Producto.objects.all()
    categorias = Categoria.objects.all()
    categoria_seleccionada = request.POST.get("categoria", "Todos")

    if categoria_seleccionada != "Todos":
        productos = productos.filter(categoria_id=categoria_seleccionada)

    if "carrito" not in request.session:
        request.session["carrito"] = []
    carrito = request.session["carrito"]

    if request.method == "POST":
        if "agregar-carrito" in request.POST:
            producto_id = int(request.POST["producto_id"])
            cantidad = int(request.POST["cantidad"])

            producto = Producto.objects.get(id=producto_id)
            if cantidad > producto.cantidad:
                messages.error(request, f"No hay suficiente stock para {producto.nombre}. Disponible: {producto.cantidad}.")
                return redirect("dashboard-hacer-pedido")
            
            for item in carrito:
                if item["id"] == producto_id:
                    if item["cantidad"] + cantidad > producto.cantidad:
                        messages.error(request, f"No puedes agregar más de {producto.cantidad} unidades de {producto.nombre}.")
                        return redirect("dashboard-hacer-pedido")
                    item["cantidad"] += cantidad
                    break
            else:
                carrito.append({"id": producto_id, "nombre": producto.nombre, "cantidad": cantidad})

            request.session["carrito"] = carrito
            messages.success(request, f"{cantidad} unidades de {producto.nombre} añadidas al carrito.")
            return redirect("dashboard-hacer-pedido")

        elif "eliminar_item_id" in request.POST:
            eliminar_item_id = int(request.POST["eliminar_item_id"])
            carrito = [item for item in carrito if item["id"] != eliminar_item_id]
            request.session["carrito"] = carrito
            messages.success(request, "Producto eliminado del carrito.")
            return redirect("dashboard-hacer-pedido")

        elif "realizar-pedido" in request.POST:
            if not carrito:
                messages.error(request, "El carrito está vacío.")
                return redirect("dashboard-hacer-pedido")

            pedido = Pedido.objects.create(usuario=request.user)
            logger.info(f"Pedido realizado por {request.user.username}. ID del pedido: {pedido.id}.")  

            for item in carrito:
                producto = Producto.objects.get(id=item["id"])
                if item["cantidad"] > producto.cantidad:
                    messages.error(request, f"Stock insuficiente para {producto.nombre}. Disponible: {producto.cantidad}.")
                    return redirect("dashboard-hacer-pedido")
                PedidoDetalle.objects.create(pedido=pedido, producto=producto, cantidad=item["cantidad"])
                producto.cantidad -= item["cantidad"]
                producto.save()

            request.session["carrito"] = []
            messages.success(request, "Pedido realizado con éxito.")
            logger.info(f"Pedido realizado con éxito. ID del pedido: {pedido.id}.")

            return redirect("dashboard-index")

    context = {
        "productos": productos,
        "categorias": categorias,
        "categoria_seleccionada": categoria_seleccionada,
        "carrito": carrito,
    }
    return render(request, "dashboard/hacer_pedido.html", context)


@login_required
def staff_delete(request, pk):
    trabajador = get_object_or_404(User, pk=pk)

    if request.method == "POST":
        trabajador.delete()
        messages.success(request, f"El usuario {trabajador.username} fue eliminado exitosamente.")
        return redirect('dashboard-staff')

    context = {
        "trabajador": trabajador
    }
    return render(request, "dashboard/staff_delete.html", context)


@login_required
def pedido_detalles(request, pk):
    pedido = get_object_or_404(Pedido, id=pk)
    return render(request, "dashboard/pedido_detalles.html", {"pedido": pedido})


@login_required
def pedido_delete(request, pk):
    pedido = get_object_or_404(Pedido, id=pk)

    if request.method == "POST":
        for detalle in pedido.detalles.all():
            producto = detalle.producto
            producto.cantidad += detalle.cantidad
            producto.save()

        pedido.delete()
        messages.success(request, "El pedido ha sido eliminado exitosamente.")
        if request.user.is_superuser:
            return redirect("dashboard-pedido")
        else:
            return redirect("dashboard-index")

    return render(request, "dashboard/pedido_delete.html", {"pedido": pedido})

import logging


logger = logging.getLogger('app_logger')

from django.shortcuts import render
import os
from django.conf import settings

def ver_logs(request):
    logs_path = os.path.join(settings.BASE_DIR, 'logs', 'auditoria.log')
    if os.path.exists(logs_path):
        with open(logs_path, 'r') as file:
            logs = file.readlines()
    else:
        logs = []

    context = {
        'logs': logs
    }

    return render(request, 'dashboard/ver_logs.html', context)
