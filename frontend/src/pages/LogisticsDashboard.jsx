import React, { useEffect, useMemo, useState } from 'react'
import Base from '@/components/Base'
import api from '@/lib/api'  

const STATUS_LABELS = {
  pendiente:   'Pendiente',
  en_proceso:  'En proceso',
  en_camino:   'En camino',
  entregado:   'Entregado',
  cancelado:   'Cancelado',
}
const STATUS_BG = {
  pendiente:   '#6c757d',
  en_proceso:  '#0d6efd',
  en_camino:   '#17a2b8',
  entregado:   '#198754',
  cancelado:   '#6c757d',
}
const normalizeStatus = (s) => {
  const key = String(s || '').toLowerCase()
  const map = {
    pending: 'pendiente',
    processing: 'en_proceso',
    in_transit: 'en_camino',
    delivered: 'entregado',
    cancelled: 'cancelado',
  }
  return map[key] || key
}
const isAccepted = (s) => {
  const k = normalizeStatus(s)
  return k === 'en_proceso' || k === 'en_camino' || k === 'entregado'
}
function matchByDate(isoString, filtro) {
  if (!isoString || filtro === 'Todos') return true
  const d = new Date(isoString)
  const hoyISO = new Date().toISOString().slice(0, 10)
  if (filtro === 'Hoy') return isoString.startsWith(hoyISO)
  const now = new Date()
  if (filtro === 'Este mes') {
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }
  if (filtro === 'Este año') return d.getFullYear() === now.getFullYear()
  return true
}

export default function LogisticsDashboard() {
  const [me, setMe] = useState(null)
  const [orders, setOrders] = useState([])
  const [filtroFecha, setFiltroFecha] = useState('Todos')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchAll = () => {
    setLoading(true)
    Promise.all([
      api.get('/api/profile/'),
      api.get('/api/pedidos/'),
    ])
      .then(([meRes, oRes]) => {
        setMe(meRes.data || null)
        setOrders(Array.isArray(oRes.data) ? oRes.data : [])
      })
      .catch(() => setError('No se pudieron cargar datos.'))
      .finally(() => setLoading(false))
  }
  useEffect(fetchAll, [])

  const patchOrder = async (id, patch) => {
    try {
      const { data: updated } = await api.patch(`/api/pedidos/${id}/`, patch)
      setOrders(cur => cur.map(o => (o.id === id ? { ...o, ...updated } : o)))
    } catch {
      setError('Error al actualizar pedido.')
    }
  }

  const aceptarPedido = async (o) => {
    await patchOrder(o.id, { status: 'en_proceso' })
  }

  const cambiarEstado = async (o, next) => {
    if (next === 'en_camino') {
      const val = window.prompt('¿Tiempo estimado de entrega (en días)?', '')
      const patch = { status: 'en_camino' }
      if (val && !isNaN(Number(val))) {
        patch.delivery_days = Math.max(1, Number(val))
      }
      await patchOrder(o.id, patch)
      return
    }
    await patchOrder(o.id, { status: next })
  }

  const pendientes = useMemo(
    () => orders.filter(o => normalizeStatus(o.status) === 'pendiente'),
    [orders]
  )
  const enCurso = useMemo(
    () => orders.filter(o => {
      const s = normalizeStatus(o.status)
      return s === 'en_proceso' || s === 'en_camino'
    }),
    [orders]
  )
  const aceptadosFiltrados = useMemo(
    () => orders.filter(o => isAccepted(o.status) && matchByDate(o.fecha, filtroFecha)),
    [orders, filtroFecha]
  )
  const entregadosFiltrados = useMemo(
    () => orders.filter(o => normalizeStatus(o.status) === 'entregado' && matchByDate(o.fecha, filtroFecha)),
    [orders, filtroFecha]
  )

  const renderBadge = (status) => {
    const key = normalizeStatus(status)
    return (
      <span className="badge" style={{ backgroundColor: STATUS_BG[key] || '#6c757d' }}>
        {STATUS_LABELS[key] || key}
      </span>
    )
  }
  const renderEntregaEstimada = (o) => {
    if (!o.entrega_estimada) return null
    try {
      return (
        <small className="text-muted d-block">
          Entrega estimada: {new Date(o.entrega_estimada).toLocaleDateString('es-ES')}
        </small>
      )
    } catch {
      return null
    }
  }

  if (loading) {
    return (
      <Base title="Dashboard Logística">
        <div className="container my-5 text-center"><p>Cargando…</p></div>
      </Base>
    )
  }

  return (
    <Base title="Dashboard Logística">
      <div className="container my-4">
        {error && (
          <div className="alert alert-danger alert-dismissible fade show">
            {error}
            <button className="btn-close" onClick={() => setError('')} />
          </div>
        )}

        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body d-flex flex-wrap align-items-center justify-content-between" style={{ gap: 12 }}>
            <div className="d-flex align-items-center" style={{ gap: 8 }}>
              <label className="fw-bold mb-0">Periodo:</label>
              <select
                className="form-select"
                style={{ maxWidth: 220 }}
                value={filtroFecha}
                onChange={e => setFiltroFecha(e.target.value)}
              >
                {['Todos', 'Hoy', 'Este mes', 'Este año'].map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="d-flex flex-wrap" style={{ gap: 12 }}>
              <div className="card shadow-sm" style={{ minWidth: 160 }}>
                <div className="card-body text-center">
                  <div className="fw-semibold text-muted">Disponibles</div>
                  <div className="fs-4">{pendientes.length}</div>
                </div>
              </div>
              <div className="card shadow-sm" style={{ minWidth: 160 }}>
                <div className="card-body text-center">
                  <div className="fw-semibold text-muted">En curso</div>
                  <div className="fs-4">{enCurso.length}</div>
                </div>
              </div>
              <div className="card shadow-sm" style={{ minWidth: 160 }}>
                <div className="card-body text-center">
                  <div className="fw-semibold text-muted">Aceptados </div>
                  <div className="fs-4">{aceptadosFiltrados.length}</div>
                </div>
              </div>
              <div className="card shadow-sm" style={{ minWidth: 160 }}>
                <div className="card-body text-center">
                  <div className="fw-semibold text-muted">Entregados </div>
                  <div className="fs-4">{entregadosFiltrados.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header text-white" style={{ backgroundColor: '#5A2E1B' }}>
            Pedidos disponibles (Pendiente)
          </div>
          <div className="card-body p-0">
            <table className="table mb-0">
              <thead className="text-white text-center" style={{ backgroundColor: '#8B4513' }}>
                <tr>
                  <th>N° Pedido</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Repartidor</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {pendientes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">No hay pedidos pendientes.</td>
                  </tr>
                ) : pendientes.map(o => (
                  <tr key={o.id} className="text-center">
                    <td>{o.numero_pedido}</td>
                    <td>{o.usuario?.username ?? '—'}</td>
                    <td>{o.fecha ? new Date(o.fecha).toLocaleDateString('es-ES') : '—'}</td>
                    <td>
                      <em className="text-muted">
                        {me?.username ? `Se asignará a ${me.username}` : '—'}
                      </em>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm text-white"
                        style={{ backgroundColor: '#198754' }}
                        onClick={() => aceptarPedido(o)}
                      >
                        Aceptar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>


        <div className="card shadow-sm border-0">
          <div className="card-header text-white" style={{ backgroundColor: '#5A2E1B' }}>
            Pedidos en curso (En proceso / En camino)
          </div>
          <div className="card-body p-0">
            <table className="table mb-0">
              <thead className="text-white text-center" style={{ backgroundColor: '#8B4513' }}>
                <tr>
                  <th>N° Pedido</th>
                  <th>Cliente</th>
                  <th>Estado</th>
                  <th>Repartidor</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {enCurso.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">No hay pedidos en curso.</td>
                  </tr>
                ) : enCurso.map(o => {
                  const status = normalizeStatus(o.status)
                  return (
                    <tr key={o.id} className="text-center">
                      <td>{o.numero_pedido}</td>
                      <td>{o.usuario?.username ?? '—'}</td>
                      <td>
                        {renderBadge(o.status)}
                        {renderEntregaEstimada(o)}
                      </td>
                      <td>
                        {o.assigned_to ? `${o.assigned_to.name} (${o.assigned_to.country})` : '—'}
                      </td>
                      <td className="d-flex justify-content-center" style={{ gap: 6 }}>
                        {status === 'en_proceso' && (
                          <button
                            className="btn btn-sm text-white"
                            style={{ backgroundColor: '#17a2b8' }}
                            onClick={() => cambiarEstado(o, 'en_camino')}
                          >
                            En camino
                          </button>
                        )}
                        {(status === 'en_proceso' || status === 'en_camino') && (
                          <button
                            className="btn btn-sm text-white"
                            style={{ backgroundColor: '#198754' }}
                            onClick={() => cambiarEstado(o, 'entregado')}
                          >
                            Entregado
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>


        <div className="card shadow-sm border-0 mt-4">
          <div className="card-header text-white" style={{ backgroundColor: '#5A2E1B' }}>
            Historial de pedidos aceptados ({filtroFecha})
          </div>
          <div className="card-body p-0">
            <table className="table mb-0">
              <thead className="text-white text-center" style={{ backgroundColor: '#8B4513' }}>
                <tr>
                  <th>N° Pedido</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Repartidor</th>
                </tr>
              </thead>
              <tbody>
                {aceptadosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                      No hay pedidos aceptados en el periodo seleccionado.
                    </td>
                  </tr>
                ) : aceptadosFiltrados.map(o => (
                  <tr key={o.id} className="text-center">
                    <td>{o.numero_pedido}</td>
                    <td>{o.usuario?.username ?? '—'}</td>
                    <td>{o.fecha ? new Date(o.fecha).toLocaleDateString('es-ES') : '—'}</td>
                    <td>{renderBadge(o.status)}</td>
                    <td>{o.assigned_to ? `${o.assigned_to.name} (${o.assigned_to.country})` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </Base>
  )
}
