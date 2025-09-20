
import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
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

export default function StaffIndex() {
  const [user, setUser]       = useState(null)
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [banner, setBanner]   = useState(null)

  const location = useLocation()

  useEffect(() => {
    const msg = location.state?.successMessage
    if (msg) {
      setBanner({ type: 'success', msg })
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const { data } = await api.get('/api/profile/')
        if (alive) setUser(data)
      } catch {
        if (alive) setError('No se pudo cargar su perfil.')
      }
    })()
    return () => { alive = false }
  }, [])

  useEffect(() => {
    if (!user) return
    let alive = true
    setLoading(true)
    ;(async () => {
      try {
        const { data } = await api.get('/api/pedidos/', { params: { usuario_id: user.id } })
        if (alive) setPedidos(Array.isArray(data) ? data : [])
      } catch {
        if (alive) setError('No se pudieron cargar los pedidos.')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [user])

  const renderStatusBadge = (statusRaw) => {
    const status = String(statusRaw || '').toLowerCase()
    const label  = STATUS_LABELS[status] || status
    const bg     = STATUS_BG[status] || '#6c757d'
    return <span className="badge" style={{ backgroundColor: bg }}>{label}</span>
  }


  const isCancelBlocked = s => ['en_proceso','en_camino','entregado'].includes(String(s||'').toLowerCase())
  
  const handleBlockedCancel = (s) => {
    const label = STATUS_LABELS[String(s||'').toLowerCase()] || s
    setBanner({ type: 'warning', msg: `No podés cancelar un pedido en estado "${label}".` })
  }



  if (loading) {
    return (
      <Base title="Mis Pedidos">
        <div className="container my-5 text-center"><p>Cargando…</p></div>
      </Base>
    )
  }

  return (
    <Base title="Mis Pedidos">
      <div className="container">
        {banner && (
          <div className={`alert alert-${banner.type} alert-dismissible fade show mt-3`}>
            {banner.msg}
            <button className="btn-close" onClick={() => setBanner(null)} />
          </div>
        )}
        {error && (
          <div className="alert alert-warning mt-3">
            {error}
          </div>
        )}

        <div className="row mt-4">
          <div className="col-12 text-center">
            <Link
              to="/hacer-pedido"
              className="btn btn-lg text-white"
              style={{ backgroundColor: '#8B4513' }}
            >
              Hacer Pedido
            </Link>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div
                className="card-header text-white"
                style={{ backgroundColor: '#8B4513' }}
              >
                Historial de Pedidos
              </div>
              <div className="card-body">
                {pedidos.length > 0 ? (
                  <table className="table bg-white">
                    <thead
                      className="text-white"
                      style={{ backgroundColor: '#8B4513' }}
                    >
                      <tr>
                        <th>ID Pedido</th>
                        <th>Productos</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedidos.map(pedido => (
                        <tr key={pedido.id}>
                          <td>{pedido.numero_pedido}</td>
                          <td>
                            {pedido.detalles && pedido.detalles.length > 0 ? (
                              pedido.detalles.map(detalle => {
                                const prod = detalle.producto || {}
                                const cat  = prod.categoria || {}
                                return (
                                  <React.Fragment key={detalle.id}>
                                    {prod.nombre || '—'} ({cat.nombre || '—'}) – x{detalle.cantidad}
                                    <br/>
                                  </React.Fragment>
                                )
                              })
                            ) : (
                              <span className="text-muted">Sin detalles</span>
                            )}
                          </td>
                          <td>{new Date(pedido.fecha).toLocaleDateString('es-ES')}</td>
                          <td>{renderStatusBadge(pedido.status)}</td>
                          <td>
                            <Link
                              to={`/pedidos/${pedido.id}`}
                              className="btn btn-sm text-white me-2"
                              style={{ backgroundColor: '#8B4513' }}
                            >
                              Ver
                            </Link>

                            {isCancelBlocked(pedido.status) ? (
                              <button
                                type="button"
                                className="btn btn-sm text-white"
                                style={{ backgroundColor: '#6c757d', cursor: 'not-allowed' }}
                                onClick={() => handleBlockedCancel(pedido.status)}
                              >
                                Cancelar
                              </button>
                            ) : (
                              <Link
                                to={`/pedidos/delete/${pedido.id}`}
                                className="btn btn-sm text-white"
                                style={{ backgroundColor: '#8B0000' }}
                              >
                                Cancelar
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center text-muted">
                    No hay pedidos registrados.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Base>
  )
}
