from django.shortcuts import render, redirect
from django.http import HttpResponse
from .models import Producto
from django.contrib.auth.decorators import login_required
from .forms import ProductoForm

@login_required
def index (request):
    return render (request, 'dashboard/index.html')

@login_required
def staff (request):
    return render (request, 'dashboard/staff.html')

@login_required
def producto (request):
    items = Producto.objects.all()

    if request.method =='POST':
        form =ProductoForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect ('dashboard-producto')
    else:
        form =ProductoForm()    

    context={
        'items': items,
        'form': form,
    }
    return render (request, 'dashboard/producto.html', context)

def producto_delete(request, pk):
    item = Producto.objects.get(id=pk)
    if request.method =='POST':
        item.delete()
        return redirect('dashboard-producto')
    return render(request, 'dashboard/producto_delete.html')

@login_required
def pedido (request):
    return render (request, 'dashboard/pedido.html')