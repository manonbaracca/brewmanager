from datetime import timedelta
from django.utils import timezone
from .utils import log_action, send_async_email
from django.conf import settings
from rest_framework import viewsets, permissions, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser, SAFE_METHODS
from rest_framework.response import Response

from .models import Categoria, Producto, Pedido, AuditLog, Repartidor
from .serializers import (
    CategoriaSerializer, ProductoSerializer, PedidoSerializer,
    AuditLogSerializer, RepartidorSerializer
)


def get_role(user):
    role = getattr(getattr(user, 'profile', None), 'role', None)
    return (role or '').lower()


class CanManagePedido(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        role = get_role(request.user)

        if request.method in SAFE_METHODS:
            return True
        if request.method == 'POST':
            return role == 'cliente'
        if request.method in ('PUT', 'PATCH'):
            return request.user.is_superuser or role == 'logistica'
        if request.method == 'DELETE':
            return request.user.is_superuser or role == 'cliente'
        return False

    def has_object_permission(self, request, view, obj):
        role = get_role(request.user)
        if request.method in SAFE_METHODS:
            if request.user.is_superuser or role == 'logistica':
                return True
            return obj.usuario_id == request.user.id
        if request.method == 'POST':
            return True
        if request.method in ('PUT', 'PATCH'):
            return request.user.is_superuser or role == 'logistica'
        if request.method == 'DELETE':
            if request.user.is_superuser:
                return True
            return (
                role == 'cliente'
                and obj.usuario_id == request.user.id
                and obj.status == 'pendiente'
            )
        return False


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsAuthenticated]


class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.select_related('categoria').all()
    serializer_class = ProductoSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        producto = serializer.save()
        try:
            log_action(
                self.request.user,
                'prod_add',
                f'Creó producto "{producto.nombre}" (cat: {producto.categoria.nombre}, stock: {producto.cantidad})'
            )
        except Exception:
            pass

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        old = {
            'nombre': instance.nombre,
            'cantidad': instance.cantidad,
            'categoria': getattr(instance.categoria, 'nombre', '—'),
            'categoria_id': getattr(instance.categoria, 'id', None),
        }

        response = super().update(request, *args, **kwargs)

        try:
            instance.refresh_from_db()
            new = {
                'nombre': instance.nombre,
                'cantidad': instance.cantidad,
                'categoria': getattr(instance.categoria, 'nombre', '—'),
                'categoria_id': getattr(instance.categoria, 'id', None),
            }

            diffs = []
            if old['nombre'] != new['nombre']:
                diffs.append(f'nombre: "{old["nombre"]}" → "{new["nombre"]}"')
            if old['cantidad'] != new['cantidad']:
                diffs.append(f'stock: {old["cantidad"]} → {new["cantidad"]}')
            if old['categoria_id'] != new['categoria_id']:
                diffs.append(f'categoría: "{old["categoria"]}" → "{new["categoria"]}"')

            if diffs:
                log_action(
                    request.user,
                    'prod_edit',
                    f'Editó producto "{new["nombre"]}" ({"; ".join(diffs)})'
                )
        except Exception:
            pass

        return response


    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        nombre = instance.nombre
        categoria = getattr(instance.categoria, 'nombre', '—')
        cantidad = instance.cantidad

        resp = super().destroy(request, *args, **kwargs)

        if resp.status_code == status.HTTP_204_NO_CONTENT:
            try:
                log_action(
                    request.user,
                    'prod_del',
                    f'Eliminó producto "{nombre}" (cat: {categoria}, stock: {cantidad})'
                )
            except Exception:
                pass

        return resp

def _get_or_create_repartidor_for(user):

    name = user.username or user.email or "Logística"
    rep, _ = Repartidor.objects.get_or_create(name=name, defaults={"country": "—"})
    return rep


class PedidoViewSet(viewsets.ModelViewSet):
    serializer_class = PedidoSerializer
    permission_classes = [IsAuthenticated, CanManagePedido]

    def _auto_advance_status(self):
        today = timezone.localdate()
        (Pedido.objects
               .filter(status='en_camino',
                       entrega_estimada__isnull=False,
                       entrega_estimada__lte=today)
               .update(status='entregado'))

    def get_queryset(self):
        self._auto_advance_status()

        qs = (
            Pedido.objects
                  .select_related('usuario', 'assigned_to')
                  .prefetch_related('detalles__producto')
                  .order_by('-fecha')
        )
        user = self.request.user
        role = get_role(user)
        if not (user.is_superuser or role == 'logistica'):
            qs = qs.filter(usuario=user)

        usuario_id = self.request.query_params.get('usuario_id')
        if usuario_id:
            qs = qs.filter(usuario_id=usuario_id)

        return qs

    def perform_create(self, serializer):
        serializer.validated_data.pop('status', None)
        pedido = serializer.save(usuario=self.request.user, status='pendiente')
        try:
            items = pedido.detalles.count()
        except Exception:
            items = 0
        log_action(
            self.request.user,
            'order_add',
            f'Creó pedido {pedido.numero_pedido} (items: {items})'
        )
        try:
            user = self.request.user
            to_email = (user.email or '').strip()
            if to_email:
                frontend = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000').rstrip('/')
                detail_url = f"{frontend}/pedidos/{pedido.id}"

                lineas = []
                for det in pedido.detalles.select_related('producto__categoria').all():
                    prod = det.producto
                    cat  = getattr(prod.categoria, 'nombre', '—')
                    lineas.append(f"  - {prod.nombre} (Cat: {cat}) x {det.cantidad}")

                fecha_str = timezone.localtime(pedido.fecha).strftime('%d/%m/%Y %H:%M')
                cuerpo = (
                    f"Hola {user.username},\n\n"
                    f"¡Gracias por tu pedido!\n\n"
                    f"Número de pedido: {pedido.numero_pedido}\n"
                    f"Fecha: {fecha_str}\n"
                    f"Estado: Pendiente\n\n"
                    f"Productos:\n" + ("\n".join(lineas) if lineas else "  (sin ítems)") + "\n\n"
                    f"Podés ver el detalle acá:\n{detail_url}\n\n"
                    f"Saludos,\nBrewManager"
                )

                send_async_email(
                    subject="Confirmación de pedido - BrewManager",
                    message=cuerpo,
                    to_email=to_email,
                )
        except Exception:
            pass

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        old_status      = instance.status
        old_assigned_id = instance.assigned_to_id
        old_eta         = instance.entrega_estimada

        data = request.data.copy() 
        target_status = data.get('status')

        if target_status in ('en_proceso', 'en_camino'):
            rep = _get_or_create_repartidor_for(request.user)
            data.setdefault('assigned_to_id', str(rep.id))

        delivery_days = data.get('delivery_days') or data.get('dias')
        if delivery_days not in (None, ''):
            try:
                days = int(delivery_days)
                entrega = timezone.localdate() + timedelta(days=days)
                data['entrega_estimada'] = entrega.isoformat()
            except ValueError:
                pass  
        try:
            user = pedido.usuario
            to_email = (user.email or '').strip()
            if to_email:
                frontend = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000').rstrip('/')
                detail_url = f"{frontend}/pedidos/{pedido.id}"

                if pedido.status == 'en_camino':
                    subj = "Tu pedido está en camino - BrewManager"
                    eta_txt = (pedido.entrega_estimada and pedido.entrega_estimada.strftime('%d/%m/%Y')) or '—'
                    body = (
                        f"Hola {user.username},\n\n"
                        f"Tu pedido {pedido.numero_pedido} está EN CAMINO.\n"
                        f"Entrega estimada: {eta_txt}\n\n"
                        f"Podés ver el detalle acá:\n{detail_url}\n\n"
                        f"Saludos,\nBrewManager"
                    )
                    send_async_email(subj, body, to_email)
                    log_action(request.user, 'order_edit', f'Notificó por mail: {pedido.numero_pedido} en_camino')

                if pedido.status == 'entregado':
                    subj = "Tu pedido fue entregado - BrewManager"
                    body = (
                        f"Hola {user.username},\n\n"
                        f"¡Tu pedido {pedido.numero_pedido} fue ENTREGADO!\n\n"
                        f"Detalle del pedido:\n{detail_url}\n\n"
                        f"Gracias por comprar en BrewManager."
                    )
                    send_async_email(subj, body, to_email)
                    log_action(request.user, 'order_edit', f'Notificó por mail: {pedido.numero_pedido} entregado')
        except Exception:
            pass

        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        pedido = serializer.instance
        
        changed_bits = []
        if old_status != pedido.status:
            changed_bits.append(f"estado: {old_status} → {pedido.status}")
        if old_assigned_id != pedido.assigned_to_id:
            changed_bits.append(
                f"repartidor: {old_assigned_id or '-'} → {pedido.assigned_to_id or '-'}"
            )
        if old_eta != pedido.entrega_estimada:
            changed_bits.append(
                f"ETA: {old_eta or '-'} → {pedido.entrega_estimada or '-'}"
            )

        if changed_bits:
            log_action(
                request.user,
                'order_edit',
                f"Editó {pedido.numero_pedido} ({'; '.join(changed_bits)})"
            )

        if old_status == 'pendiente' and pedido.status in ('en_proceso', 'en_camino'):
            log_action(
                request.user,
                'order_edit', 
                (f"Aceptó {pedido.numero_pedido}; nuevo estado {pedido.status}; "
                 f"repartidor {pedido.assigned_to or '-'}; "
                 f"ETA {pedido.entrega_estimada or '-'}")
            )


        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        pedido = self.get_object()
        role = get_role(request.user)

        if not request.user.is_superuser:
            if not (role == 'cliente'
                    and pedido.usuario_id == request.user.id
                    and pedido.status == 'pendiente'):
                return Response(
                    {'detail': 'Solo podés cancelar tus pedidos pendientes.'},
                    status=status.HTTP_403_FORBIDDEN
                )

        for detalle in pedido.detalles.all():
            producto = detalle.producto
            producto.cantidad += detalle.cantidad
            producto.save()

        numero = pedido.numero_pedido
        usuario = pedido.usuario.username

        resp = super().destroy(request, *args, **kwargs)

        if resp.status_code == status.HTTP_204_NO_CONTENT:
            log_action(
                request.user,
                'order_del',
                f'Eliminó pedido {numero} del usuario {usuario}'
            )

        return resp


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.select_related('user').all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        qs = super().get_queryset()

        user_id = self.request.query_params.get('user_id')
        exact_date = self.request.query_params.get('date')

        date_from = self.request.query_params.get('date_from')
        date_to   = self.request.query_params.get('date_to')
        role      = (self.request.query_params.get('role') or '').strip().lower()
        q         = (self.request.query_params.get('q') or '').strip()

        if user_id:
            qs = qs.filter(user_id=user_id)

        if exact_date:
            qs = qs.filter(timestamp__date=exact_date)

        if date_from:
            qs = qs.filter(timestamp__date__gte=date_from)
        if date_to:
            qs = qs.filter(timestamp__date__lte=date_to)

        if role:
            if role == 'admin':
                qs = qs.filter(user__is_superuser=True)
            else:
                qs = qs.filter(user__profile__role=role)

        if q:
            qs = qs.filter(user__username__icontains=q)

        return qs

class RepartidorViewSet(viewsets.ModelViewSet):
    queryset = Repartidor.objects.all()
    serializer_class = RepartidorSerializer
    permission_classes = [IsAuthenticated]
