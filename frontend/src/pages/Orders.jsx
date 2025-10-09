import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Base from '@/components/Base'
import TopNav from '@/components/TopNav'
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

function normalizeStatus(s) {
  if (!s) return 'pendiente'
  let key = String(s).toLowerCase().trim().replace(/[-\s]+/g, '_')
  const map = {
    pending: 'pendiente',
    processing: 'en_proceso',
    in_transit: 'en_camino',
    delivered: 'entregado',
    cancelled: 'cancelado',
    enproceso: 'en_proceso',
    'en-proceso': 'en_proceso',
    'en_camino': 'en_camino',
  }
  const norm = map[key] || key
  return STATUS_LABELS[norm] ? norm : 'pendiente'
}
function canDeleteByStatus(status) {
  const k = normalizeStatus(status)
  return k === 'pendiente' 
}
function StatusBadge({ value }) {
  const k = normalizeStatus(value)
  return <span className="badge" style={{ backgroundColor: STATUS_BG[k] }}>{STATUS_LABELS[k]}</span>
}
function ymd(d) {
  const dt = d instanceof Date ? d : new Date(d)
  if (isNaN(dt)) return null
  const y = dt.getFullYear()
  const m = String(dt.getMonth() + 1).padStart(2, '0')
  const day = String(dt.getDate()).padStart(2, '0')
  return { y, m, d: day, str: `${y}-${m}-${day}` }
}
function matchByPeriodo(fecha, periodo) {
  if (!fecha || periodo === 'Todos') return true
  const f = ymd(fecha); if (!f) return false
  const n = ymd(new Date())
  if (periodo === 'Hoy')       return f.str === n.str
  if (periodo === 'Este mes')  return f.y === n.y && f.m === n.m
  if (periodo === 'Este año')  return f.y === n.y
  return true
}

export default function Orders() {
  const location = useLocation()
  const [pedidos, setPedidos] = useState([])
  const [sinStock, setSinStock] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [trabajadoresCount, setTrabajadoresCount] = useState(0)
  const [productCount, setProductCount] = useState(0)
  const [pedidosCount, setPedidosCount] = useState(0)
  const [error, setError] = useState('')
  const [flash, setFlash] = useState(location.state?.successMessage || '')
  const [loading, setLoading] = useState(true)

  const [filtroFecha, setFiltroFecha] = useState('Todos')
  const [filtroUsuario, setFiltroUsuario] = useState('Todos')

  useEffect(() => {
    if (location.state?.successMessage) window.history.replaceState({}, document.title)
  }, [location.state])

  useEffect(() => {
    let alive = true
    setLoading(true)
    Promise.all([api.get('/api/staff/'), api.get('/api/pedidos/'), api.get('/api/productos/')])
      .then(([staffRes, pedRes, prodRes]) => {
        if (!alive) return
        const allStaff = Array.isArray(staffRes.data) ? staffRes.data : []
        setTrabajadoresCount(
          allStaff.filter(
            u => String(u.role || '').toLowerCase() !== 'admin' &&
                 String(u.username || '').toLowerCase() !== 'admin'
          ).length
        )
        const onlyClients = allStaff
          .filter(u => String(u.role || '').toLowerCase() === 'cliente')
          .filter(u => !(u.is_superuser === true) && String(u.username || '').toLowerCase() !== 'admin')
          .sort((a, b) => String(a.username).localeCompare(String(b.username), 'es', { sensitivity: 'base' }))
        setUsuarios(onlyClients)

        const allPedidos = Array.isArray(pedRes.data) ? pedRes.data : []
        setPedidos(allPedidos)
        setPedidosCount(allPedidos.length)

        const allProducts = Array.isArray(prodRes.data) ? prodRes.data : []
        setProductCount(allProducts.length)
        setSinStock(allProducts.filter(p => p.cantidad === 0))
      })
      .catch(() => setError('No se pudieron cargar los datos de pedidos.'))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [])

  const pedidosFiltrados = useMemo(() => {
    let res = Array.isArray(pedidos) ? [...pedidos] : []
    res = res.filter(p => matchByPeriodo(p.fecha, filtroFecha))
    if (filtroUsuario !== 'Todos') res = res.filter(p => String(p?.usuario?.id) === String(filtroUsuario))
    res.sort((a, b) => (new Date(b.fecha).getTime() || 0) - (new Date(a.fecha).getTime() || 0))
    return res
  }, [pedidos, filtroFecha, filtroUsuario])

  if (loading) {
    return (
      <Base title="Pedidos">
        <div className="container my-5 text-center"><p>Cargando pedidos…</p></div>
      </Base>
    )
  }

  return (
    <Base title="Pedidos">
      <TopNav
        productosSinStock={sinStock}
        trabajadoresCount={trabajadoresCount}
        productCount={productCount}
        pedidosCount={pedidosCount}
      />
      <div className="container my-4">
        {flash && (
          <div className="alert alert-success alert-dismissible fade show">
            {flash}
            <button className="btn-close" onClick={() => setFlash('')} />
          </div>
        )}
        {error && (
          <div className="alert alert-warning alert-dismissible fade show">
            {error}
            <button className="btn-close" onClick={() => setError('')} />
          </div>
        )}

        <div className="card shadow-sm mb-4">
          <div className="card-body p-3 d-flex flex-wrap align-items-center justify-content-center" style={{ backgroundColor: '#A0522D', gap: 20 }}>
            <select className="form-select" style={{ maxWidth: 200 }} value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)}>
              {['Todos', 'Hoy', 'Este mes', 'Este año'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <select className="form-select" style={{ maxWidth: 260 }} value={filtroUsuario} onChange={e => setFiltroUsuario(e.target.value)}>
              <option value="Todos">Todos los clientes</option>
              {usuarios.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
            </select>
          </div>
        </div>

        {pedidosFiltrados.length > 0 ? (
          <table className="table table-striped mb-0">
            <thead className="text-white text-center" style={{ backgroundColor: '#5A2E1B' }}>
              <tr><th>Número Pedido</th><th>Pedido por</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map(p => (
                <tr key={p.id} className="text-center">
                  <td>{p.numero_pedido}</td>
                  <td>{p.usuario?.username ?? '—'}</td>
                  <td>{p.fecha ? new Date(p.fecha).toLocaleDateString('es-ES') : '—'}</td>
                  <td><StatusBadge value={p.status} /></td>
                  <td>
                    <Link
                      to={`/pedidos/${p.id}`}
                      className="btn btn-sm me-2"
                      style={{ backgroundColor: '#A0522D', color: '#FFF' }}
                    >
                      Ver
                    </Link>

                    {canDeleteByStatus(p.status) ? (
                      <Link
                        to={`/pedidos/delete/${p.id}`}
                        className="btn btn-sm"
                        style={{ backgroundColor: '#8B0000', color: '#FFF' }}
                      >
                        Eliminar
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{
                          backgroundColor: '#8B0000',
                          color: '#FFF',
                          opacity: 0.5,
                          cursor: 'not-allowed',
                          pointerEvents: 'none',
                        }}
                        title="Solo se puede cancelar un pedido pendiente"
                        disabled
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="alert alert-warning text-center mt-3">No hay pedidos con los filtros seleccionados.</div>
        )}
      </div>
    </Base>
  )
}
