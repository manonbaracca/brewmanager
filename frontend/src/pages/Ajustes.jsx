import React from 'react'
import { Link } from 'react-router-dom'
import Base from '@/components/Base'
import api from '@/lib/api'

export default function Ajustes() {
  return (
    <Base title="Ajustes">
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-sm border-0" style={{ borderRadius: '10px', overflow: 'hidden' }}>
              <div
                className="card-header text-center"
                style={{
                  backgroundColor: '#8B4513',
                  color: '#FAF0E6',
                  fontWeight: 'bold',
                  fontSize: '1.25rem',
                }}
              >
                Ajustes del Sistema
              </div>
              <div className="card-body" style={{ backgroundColor: '#F5DEB3' }}>
                <p className="mb-4" style={{ color: '#5A2E1B', fontSize: '1.1rem' }}>
                  Seleccione una opción para gestionar:
                </p>
                <div className="d-flex flex-column align-items-center gap-3">
                  <Link
                    to="/ajustes/categorias"
                    className="btn btn-lg"
                    style={{
                      backgroundColor: '#5A2E1B',
                      color: '#FFF',
                      padding: '0.75rem 1.5rem',
                      width: '100%',
                      borderRadius: '5px',
                    }}
                  >
                    Categorías
                  </Link>
                  <Link
                    to="/ver-logs"
                    className="btn btn-lg"
                    style={{
                      backgroundColor: '#A0522D',
                      color: '#FFF',
                      padding: '0.75rem 1.5rem',
                      width: '100%',
                      borderRadius: '5px',
                    }}
                  >
                    Logs
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
