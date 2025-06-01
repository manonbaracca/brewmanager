import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import axios from 'axios'
import Base from '@/components/Base'

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
    axios.get(`/api/staff/${id}/`, { withCredentials: true })
      .then(({ data }) => {
        setUsername(data.username)
      })
      .catch(() => {
        setError('No se pudo cargar la información del usuario.')
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = () => {
    setDeleting(true)
    axios.delete(`/api/staff/${id}/`, { withCredentials: true })
      .then(() => {
        navigate('/staff', {
          state: { successMessage: `Usuario "${username}" eliminado exitosamente.` }
        })
      })
      .catch(() => {
        setError('Error al eliminar el usuario.')
        setDeleting(false)
      })
  }

  if (loading) {
    return (
      <Base title="Eliminar Usuario">
        <div className="container my-5">
          <p>Cargando datos…</p>
        </div>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </Base>
  )
}
