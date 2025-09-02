import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useLocation } from 'react-router-dom'
import Base from '@/components/Base'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const location = useLocation()
  const [flash, setFlash] = useState('')

  useEffect(() => {
    axios.get('/api/profile/')
      .then(res => setProfile(res.data))
      .catch(err => console.error(err))

    if (location.state?.successMessage) {
      setFlash(location.state.successMessage)
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  if (!profile) {
    return (
      <Base title="Detalle del Usuario">
        <div className="container my-5">
          <p>Cargando información...</p>
        </div>
      </Base>
    )
  }

  const { username, email, telefono, direccion, is_superuser, role } = profile
  const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : '—'

  return (
    <Base title="Detalle del Usuario">
      <div className="container my-5">
        {flash && (
          <div className="alert alert-success alert-dismissible fade show">
            {flash}
            <button type="button" className="btn-close" onClick={() => setFlash('')} />
          </div>
        )}

        {is_superuser && (
          <div className="row mb-4">
            <div className="col text-center">
              <Link
                to="/ajustes"
                className="btn"
                style={{
                  backgroundColor: '#8B4513',
                  color: '#FFF',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '5px',
                  fontWeight: 600,
                }}
              >
                Ajustes
              </Link>
            </div>
          </div>
        )}

        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow-sm border-0" style={{ borderRadius: '10px', overflow: 'hidden' }}>
              <div
                className="card-header text-center"
                style={{
                  backgroundColor: '#8B4513',
                  color: '#FAF0E6',
                  fontWeight: 700,
                  fontSize: '1.3rem',
                }}
              >
                Detalle del Usuario
              </div>

              <div className="card-body" style={{ backgroundColor: '#F5DEB3', color: '#5A2E1B', padding: '2rem' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="mb-0" style={{ fontWeight: 600 }}>
                    Información del Perfil
                  </h4>
                  <Link
                    to="/profile/update"
                    className="btn btn-sm"
                    style={{ backgroundColor: '#5A2E1B', color: '#FFF', fontWeight: 500 }}
                  >
                    <i className="fas fa-edit" /> Editar
                  </Link>
                </div>
                <hr style={{ borderColor: '#8B4513' }} />

                <table className="table table-borderless mb-0 w-100" style={{ background: 'transparent' }}>
                  <tbody>
                    <tr>
                      <th scope="row" style={{ width: '30%', fontWeight: 600 }}>Nombre:</th>
                      <td>{username}</td>
                    </tr>

                    <tr>
                      <th scope="row" style={{ fontWeight: 600 }}>Email:</th>
                      <td>{email}</td>
                    </tr>

                    <tr>
                      <th scope="row" style={{ fontWeight: 600 }}>Teléfono:</th>
                      <td>{telefono || '—'}</td>
                    </tr>

                    <tr>
                      <th scope="row" style={{ fontWeight: 600 }}>Dirección:</th>
                      <td>{direccion || '—'}</td>
                    </tr>

                    <tr>
                      <th scope="row" style={{ fontWeight: 600 }}>Rol:</th>
                      <td>{roleLabel}</td>
                    </tr>
                  </tbody>
                </table>

              </div>
            </div>
          </div>
        </div>
      </div>
    </Base>
  )
}
