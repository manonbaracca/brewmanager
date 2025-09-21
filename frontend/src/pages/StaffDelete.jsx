import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import Base from '@/components/Base'
import api, { initCsrf } from '@/lib/api'

export default function StaffDelete() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(true)
  const [deleting, setDeleting] = useState(false)

  const successMessage = location.state?.successMessage || ''

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const { data } = await api.get(`/api/staff/${id}/`)
        if (alive) setUsername(data.username)
      } catch {
        if (alive) setError('No se pudo cargar la información del usuario.')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    setError('')
    try {
      // Asegura cookie + header CSRF antes de un método no seguro
      await initCsrf()
      await api.delete(`/api/staff/${id}/`, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      })
      navigate('/staff', {
        state: { successMessage: `Usuario "${username}" eliminado exitosamente.` }
      })
    } catch (err) {
      const detail =
        err?.response?.data?.detail ||
        (err?.response?.status === 403
          ? 'CSRF inválido o sesión expirada. Actualiza la página e intenta de nuevo.'
          : null)
      setError(detail || 'Error al eliminar el usuario.')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <Base title="Eliminar Usuario">
        <div className="container my-5"><p>Cargando datos…</p></div>
      </Base>
    )
  }

  return (
    <Base title="Confirmar Eliminación">
      <div className="container my-4">
        {error && (
          <div className="alert alert-danger alert-dismissible fade show">
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')} />
          </div>
        )}
        <div className="row">
          <div className="col-md-6 offset-md-3">
            <div className="card shadow-sm border-0">
              <div
                className="card-header text-center text-white"
                style={{ backgroundColor: '#5A2E1B', fontWeight: 'bold' }}
              >
                Confirmar Eliminación
              </div>
              <div className="card-body" style={{ backgroundColor: '#F5DEB3' }}>
                <div className="alert alert-danger text-center">
                  <h5>
                    <i className="fas fa-exclamation-triangle"></i>{' '}
                    ¿Estás seguro que deseas eliminar al usuario <strong>{username}</strong>?
                  </h5>
                </div>
                <div className="d-flex justify-content-between mt-4">
                  <Link
                    to="/staff"
                    className="btn"
                    style={{
                      backgroundColor: '#8B4513',
                      color:           '#FFF',
                      padding:         '0.5rem 1rem',
                      borderRadius:    '5px',
                      fontWeight:      600,
                    }}
                  >
                    Cancelar
                  </Link>
                  <button
                    className="btn"
                    disabled={deleting}
                    onClick={handleDelete}
                    style={{
                      backgroundColor: '#8B0000',
                      color:           '#FFF',
                      padding:         '0.5rem 1rem',
                      borderRadius:    '5px',
                      fontWeight:      600,
                    }}
                  >
                    {deleting ? 'Eliminando…' : 'Eliminar'}
                  </button>
                </div>
                {successMessage ? (
                  <div className="visually-hidden">{successMessage}</div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Base>
  )
}
