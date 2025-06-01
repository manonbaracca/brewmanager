import React from 'react'
import { Link } from 'react-router-dom'
import Base from '@/components/Base'

export default function Logout() {
  return (
    <Base title="Cerrar Sesión">
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-sm" style={{ borderRadius: 10, overflow: 'hidden' }}>
              <div
                className="card-header text-center"
                style={{
                  backgroundColor: '#8B4513',
                  color: '#FAF0E6',
                  fontWeight: 'bold',
                  fontSize: '1.25rem',
                }}
              >
                Cerrar Sesión
              </div>
              <div className="card-body text-center" style={{ backgroundColor: '#F5DEB3' }}>
                <h4 className="mb-3" style={{ color: '#5A2E1B' }}>
                  Has cerrado sesión exitosamente
                </h4>
                <hr />
                <div
                  className="alert"
                  style={{ backgroundColor: '#FFF5EE', color: '#5A2E1B', border: 'none' }}
                >
                  Gracias por usar BrewManager.
                </div>
                <Link
                  to="/login"
                  className="btn btn-lg"
                  style={{
                    backgroundColor: '#5A2E1B',
                    color: '#FFF',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '5px',
                  }}
                >
                  Iniciar Sesión
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Base>
  )
}
