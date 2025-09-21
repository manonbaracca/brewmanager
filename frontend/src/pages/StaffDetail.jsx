import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Base from '@/components/Base'
import api from '@/lib/api'

export default function StaffDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [user, setUser]       = useState(null)
  const [role, setRole]       = useState('')
  const [error, setError]     = useState('')
  const [flash, setFlash]     = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const { data } = await api.get(`/api/staff/${id}/`)
        if (!alive) return
        setUser(data)
        setRole(data.role || '')
      } catch (e) {
        if (!alive) return
        setError('No se pudo cargar la información del usuario.')
        console.error('GET /api/staff/:id error:', e?.response?.data || e)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [id])

  const handleSubmit = async e => {
    e.preventDefault()
    setFlash('')
    setError('')
    try {
      await api.get('/api/csrf/')

      const { data } = await api.patch(`/api/staff/${id}/`, { role })

      setFlash('Rol actualizado correctamente.')
      setTimeout(
        () => navigate('/staff', { state: { successMessage: 'Rol actualizado.' } }),
        900
      )
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.error ||
        e?.response?.status === 403
          ? 'Permisos o CSRF inválido.'
          : 'Error al actualizar el rol.'
      setError(msg)
      console.error('PATCH /api/staff/:id error:', e?.response?.data || e)
    }
  }

  if (loading) {
    return (
      <Base title="Información del Usuario">
        <div className="container my-5 text-center">
          <p>Cargando detalles…</p>
        </div>
      </Base>
    )
  }

  return (
    <Base title="Información del Usuario">
      <div className="container my-5">
        {error && <div className="alert alert-danger">{error}</div>}
        {flash && <div className="alert alert-success">{flash}</div>}

        <div className="card shadow-sm">
          <div className="card-header text-white" style={{ backgroundColor: '#5A2E1B', fontWeight: 'bold' }}>
            Información del Usuario
          </div>
          <div className="card-body" style={{ backgroundColor: '#F5DEB3' }}>
            <form onSubmit={handleSubmit}>
              <div className="mb-3 row">
                <label className="col-sm-3 col-form-label text-muted">Usuario</label>
                <div className="col-sm-9">
                  <input type="text" readOnly className="form-control-plaintext" value={user?.username || ''} />
                </div>
              </div>

              <div className="mb-3 row">
                <label className="col-sm-3 col-form-label text-muted">Email</label>
                <div className="col-sm-9">
                  <input type="email" readOnly className="form-control-plaintext" value={user?.email || ''} />
                </div>
              </div>

              <div className="mb-4 row">
                <label htmlFor="role" className="col-sm-3 col-form-label text-muted">Rol</label>
                <div className="col-sm-9">
                  <select id="role" className="form-select" value={role} onChange={e => setRole(e.target.value)}>
                    <option value="cliente">Cliente</option>
                    <option value="logistica">Logística</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>

              <div className="text-center">
                <button type="submit" className="btn px-4 py-2 text-white" style={{ backgroundColor: '#8B4513' }}>
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Base>
  )
}
