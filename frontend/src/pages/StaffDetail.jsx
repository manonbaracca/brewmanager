import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import Base from '@/components/Base'

export default function StaffDetail() {
  const { id } = useParams()
  const [user, setUser]     = useState(null)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`/api/staff/${id}/`, { withCredentials: true })
      .then(({ data }) => {
        setUser(data)
      })
      .catch(() => {
        setError('No se pudo cargar la información del usuario.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <Base title="Información del Usuario">
        <div className="container my-5">
          <p>Cargando detalles...</p>
        </div>
      </Base>
    )
  }

  if (error) {
    return (
      <Base title="Información del Usuario">
        <div className="container my-5">
          <div className="alert alert-danger">{error}</div>
        </div>
      </Base>
    )
  }

  const { username, email, telefono, direccion } = user

  return (
    <Base title="Información del Usuario">
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow-sm border-0">
              <div
                className="card-header text-center text-white"
                style={{ backgroundColor: '#5A2E1B', fontWeight: 'bold' }}
              >
                Información del Usuario
              </div>
              <div className="card-body p-4" style={{ backgroundColor: '#F5DEB3' }}>
                <table className="table table-borderless mb-0">
                  <tbody>
                    <tr>
                      <th scope="row" className="text-muted" style={{ width: '30%' }}>
                        Usuario
                      </th>
                      <td>{username}</td>
                    </tr>
                    <tr>
                      <th scope="row" className="text-muted">
                        Email
                      </th>
                      <td>{email}</td>
                    </tr>
                    <tr>
                      <th scope="row" className="text-muted">
                        Teléfono
                      </th>
                      <td>{telefono || '—'}</td>
                    </tr>
                    <tr>
                      <th scope="row" className="text-muted">
                        Dirección
                      </th>
                      <td>{direccion || '—'}</td>
                    </tr>
                  </tbody>
                </table>
                <div className="text-center mt-4">
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
                    Volver
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Base>
  )
}
