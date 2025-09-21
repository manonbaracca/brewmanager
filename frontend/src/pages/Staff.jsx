import React, { useEffect, useState, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Base from '@/components/Base'
import TopNav from '@/components/TopNav'
import api from '@/lib/api'

const sortByUsername = (a, b) =>
  String(a.username).localeCompare(String(b.username), 'es', { sensitivity: 'base' })

export default function Staff() {
  const location = useLocation()
  const [flash, setFlash] = useState(location.state?.successMessage || '')
  const [staff, setStaff] = useState([])
  const [me, setMe] = useState(null)
  const [roles, setRoles] = useState([])
  const [roleFilter, setRoleFilter] = useState('all')
  const [sinStock, setSinStock] = useState([])
  const [productCount, setProductCount] = useState(0)
  const [pedidosCount, setPedidosCount] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const [meRes, staffRes, productosRes, pedidosRes] = await Promise.all([
          api.get('/api/user/'),
          api.get('/api/staff/'),
          api.get('/api/productos/'),
          api.get('/api/pedidos/'),
        ])

        if (!alive) return

        setMe(meRes.data)

        const staffList = Array.isArray(staffRes.data) ? staffRes.data : []
        setStaff(staffList)

        const uniqueRoles = Array.from(
          new Set(staffList.map(u => u.role).filter(r => r && String(r).trim() !== ''))
        ).sort((a, b) => String(a).localeCompare(String(b), 'es', { sensitivity: 'base' }))
        setRoles(uniqueRoles)

        const allProducts = productosRes.data
        setSinStock(Array.isArray(allProducts) ? allProducts.filter(p => p.cantidad === 0) : [])
        setProductCount(Array.isArray(allProducts) ? allProducts.length : 0)

        const allPedidos = pedidosRes.data
        setPedidosCount(Array.isArray(allPedidos) ? allPedidos.length : 0)
      } catch {
        if (alive) setError('No se pudo cargar la información.')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  const displayedStaff = useMemo(() => {
    let list = staff
    if (me?.id) list = list.filter(u => u.id !== me.id)
    if (roleFilter !== 'all') list = list.filter(u => u.role === roleFilter)
    return [...list].sort(sortByUsername)
  }, [staff, me, roleFilter])

  if (loading) {
    return (
      <Base title="Usuarios">
        <div className="container my-5">
          <p>Cargando usuarios…</p>
        </div>
      </Base>
    )
  }

  return (
    <Base title="Gestión de Usuarios">
      <TopNav
        productosSinStock={sinStock}
        trabajadoresCount={staff.filter(
          u => String(u.role || '').toLowerCase() !== 'admin' &&
               String(u.username || '').toLowerCase() !== 'admin'
        ).length}
        productCount={productCount}
        pedidosCount={pedidosCount}
      />

      <div className="container mt-4">
        {flash && (
          <div className="alert alert-success alert-dismissible fade show">
            {flash}
            <button type="button" className="btn-close" onClick={() => setFlash('')} />
          </div>
        )}
        {error && (
          <div className="alert alert-warning alert-dismissible fade show">
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')} />
          </div>
        )}

        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body d-flex align-items-center justify-content-center p-3" style={{ backgroundColor: '#A0522D', gap: '.5rem' }}>
            <label className="fw-bold text-white mb-0">Rol:</label>
            <select
              className="form-select"
              style={{ maxWidth: 300 }}
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="all">Todos los roles</option>
              {roles.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="card shadow-sm border-0">
          <div className="card-header text-white text-center" style={{ backgroundColor: '#5A2E1B', fontWeight: 'bold' }}>
            Gestión de Usuarios
          </div>
          <div className="card-body p-0">
            <table className="table table-hover mb-0">
              <thead className="text-white text-center" style={{ backgroundColor: '#8B4513' }}>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {displayedStaff.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                      {roleFilter === 'all' ? 'No hay usuarios para mostrar.' : 'No hay usuarios con ese rol.'}
                    </td>
                  </tr>
                ) : (
                  displayedStaff.map(u => (
                    <tr key={u.id} className="text-center">
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>{u.telefono || '—'}</td>
                      <td>{u.role}</td>
                      <td>
                        <Link to={`/staff/${u.id}`} className="btn btn-sm me-2" style={{ backgroundColor: '#A0522D', color: '#FFF' }}>
                          Ver / Editar
                        </Link>
                        <Link to={`/staff/delete/${u.id}`} className="btn btn-sm" style={{ backgroundColor: '#8B0000', color: '#FFF' }}>
                          Eliminar
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Base>
  )
}