import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Base  from '@/components/Base'

export default function LogisticsDashboard() {
  const [orders, setOrders]           = useState([])
  const [deliveryPeople, setDele]     = useState([])
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get('/api/pedidos/',        { withCredentials: true }),
      axios.get('/api/delivery-people/',{ withCredentials: true })
    ])
    .then(([oRes, dRes]) => {
      setOrders(oRes.data)
      setDele(dRes.data)
    })
    .catch(() => setError('No se pudieron cargar datos.'))
    .finally(() => setLoading(false))
  }, [])

  const updateOrder = async (id, patch) => {
    try {
      await axios.patch(
        `/api/pedidos/${id}/`,
        patch,
        { withCredentials: true }
      )
      setOrders(orders.map(o => o.id === id ? { ...o, ...patch } : o))
    } catch {
      setError('Error al actualizar pedido.')
    }
  }

  if (loading) return <Base title="Logística"><p>Cargando…</p></Base>

  return (
    <Base title="Dashboard Logística">
      {error && <div className="alert alert-danger">{error}</div>}
      <table className="table">
        <thead>
          <tr>
            <th>ID</th><th>Cliente</th>
            <th>Status</th><th>Repartidor</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <td>{o.numero_pedido}</td>
              <td>{o.usuario.username}</td>
              <td>
                <select
                  value={o.status}
                  onChange={e => updateOrder(o.id, { status: e.target.value })}
                  className="form-select form-select-sm"
                >
                  <option value="pending">Pendiente</option>
                  <option value="processing">En Proceso</option>
                  <option value="in_transit">En Camino</option>
                  <option value="delivered">Entregado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </td>
              <td>
                <select
                  value={o.assigned_to?.id || ''}
                  onChange={e => updateOrder(o.id, { assigned_to_id: e.target.value || null })}
                  className="form-select form-select-sm"
                >
                  <option value="">— Sin asignar —</option>
                  {deliveryPeople.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.country})
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Base>
  )
}
