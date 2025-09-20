import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Base from '@/components/Base'
import api from '@/lib/api'

const STATUS_LABELS = {
  pendiente:  'Pendiente',
  en_proceso: 'En proceso',
  en_camino:  'En camino',
  entregado:  'Entregado',
  cancelado:  'Cancelado',
}
const STATUS_BG = {
  pendiente:  '#6c757d',
  en_proceso: '#0d6efd',
  en_camino:  '#17a2b8',
  entregado:  '#198754',
  cancelado:  '#6c757d',
}

export default function OrderDetail() {
  const { id } = useParams()
  const [pedido, setPedido] = useState(null)
  const [user, setUser]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    let alive = true
    Promise.all([api.get('/api/user/'), api.get(`/api/pedidos/${id}/`)])
      .then(([userRes, pedidoRes]) => {
        if (!alive) return
        setUser(userRes.data)
        setPedido(pedidoRes.data)
      })
      .catch(() => alive && setError('Error al cargar datos.'))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [id])

  if (loading) {
    return (
      <Base title="Detalles del Pedido">
        <div className="container my-5 text-center"><p>Cargando…</p></div>
      </Base>
    )
  }

  if (error || !pedido) {
    return (
      <Base title="Detalles del Pedido">
        <div className="container my-4">
          <div className="alert alert-danger text-center">{error || 'Pedido no encontrado.'}</div>
        </div>
      </Base>
    )
  }

  const backPath = user?.is_superuser ? '/pedidos' : '/staff-index'
  const detalles = Array.isArray(pedido.detalles) ? pedido.detalles : []

  const statusKey = String(pedido.status || '').toLowerCase()
  const statusLabel = STATUS_LABELS[statusKey] || pedido.status || '—'
  const statusBg = STATUS_BG[statusKey] || '#6c757d'

  const assignedName = pedido.assigned_to?.name
    ? `${pedido.assigned_to.name}${pedido.assigned_to.country ? ` (${pedido.assigned_to.country})` : ''}`
    : 'Pendiente de asignar'

  return (
    <Base title="Detalles del Pedido">
      <div className="container my-4">
        <div className="card shadow-sm rounded-2">
          <div className="card-header text-white" style={{ backgroundColor: '#8B4513' }}>
            Detalles del Pedido
          </div>
          <div className="card-body">
            <p><strong>Número de Pedido:</strong> {pedido.numero_pedido}</p>
            <p><strong>Usuario:</strong> {pedido.usuario?.username ?? '—'}</p>
            <p><strong>Fecha:</strong> {pedido.fecha ? new Date(pedido.fecha).toLocaleDateString('es-ES') : '—'}</p>
            <p><strong>Estado:</strong> <span className="badge" style={{ backgroundColor: statusBg }}>{statusLabel}</span></p>
            <p><strong>Logística:</strong> {assignedName}</p>

            <hr />
            <h5>Productos:</h5>
            <table className="table table-striped">
              <thead className="text-white" style={{ backgroundColor: '#A0522D' }}>
                <tr><th>Producto</th><th>Categoría</th><th>Cantidad</th></tr>
              </thead>
              <tbody>
                {detalles.length === 0 ? (
                  <tr><td colSpan="3" className="text-center text-muted">Sin ítems.</td></tr>
                ) : detalles.map(d => (
                  <tr key={d.id}>
                    <td>{d.producto?.nombre ?? '—'}</td>
                    <td>{d.producto?.categoria?.nombre ?? '—'}</td>
                    <td>{d.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-center mt-4">
              <Link to={backPath} className="btn text-white fw-semibold" style={{ backgroundColor: '#8B4513', padding: '0.5rem 1.5rem', borderRadius: '0.25rem' }}>
                Volver
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Base>
  )
}
