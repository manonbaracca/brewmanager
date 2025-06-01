import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import axios from 'axios'
import Base from '@/components/Base'
import TopNav from '@/components/TopNav'

export default function Staff() {
  const location = useLocation()
  const [flash, setFlash] = useState(location.state?.successMessage || '')
  const [staff, setStaff] = useState([])
  const [sinStock, setSinStock] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get('/api/staff/', { withCredentials: true }),
      axios.get('/api/productos/?cantidad=0', { withCredentials: true }),
    ])
      .then(([staffRes, sinStockRes]) => {
        setStaff(staffRes.data)
        setSinStock(sinStockRes.data)
      })
      .catch(() => {
        setError('No se pudo cargar la información.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <Base title="Usuarios">
        <div className="container my-5"><p>Cargando usuarios…</p></div>
      </Base>
    )
  }

  return (
    <Base title="Gestión de Usuarios">
      <TopNav
        productosSinStock={sinStock}
        trabajadoresCount={staff.length}
        productCount={0}
        pedidosCount={0}
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

        <div className="card shadow-sm border-0">
          <div className="card-header text-white text-center" style={{ backgroundColor: '#5A2E1B', fontWeight: 'bold' }}>
            Gestión de Usuarios
          </div>
          <div className="card-body p-0">
            <table className="table table-hover mb-0">
              <thead className="text-white text-center" style={{ backgroundColor: '#8B4513' }}>
                <tr>
                  <th>Nombre</th><th>Email</th><th>Teléfono</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {staff.length === 0
                  ? (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-4">
                        No hay usuarios registrados.
                      </td>
                    </tr>
                  )
                  : staff.map(u => (
                    <tr key={u.id} className="text-center">
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>{u.telefono || '—'}</td>
                      <td>
                        <Link to={`/staff/${u.id}`} className="btn btn-sm me-2" style={{ backgroundColor: '#A0522D', color: '#FFF' }}>
                          Ver
                        </Link>
                        <Link to={`/staff/delete/${u.id}`} className="btn btn-sm" style={{ backgroundColor: '#8B0000', color: '#FFF' }}>
                          Eliminar
                        </Link>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Base>
  )
}
