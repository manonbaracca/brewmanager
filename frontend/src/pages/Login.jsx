import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import Base from '@/components/Base'

export default function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [alerts, setAlerts] = useState([])
  const navigate = useNavigate()

  const handleChange = e => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setAlerts([])

    const payload = new URLSearchParams({
      username: credentials.username,
      password: credentials.password,
    })

    try {
      await axios.post(
        '/api/login/',
        payload,                                
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          withCredentials: true
        }
      )
      navigate('/dashboard')
    } catch {
      setAlerts([{ type: 'danger', msg: 'Usuario o contraseña incorrectos.' }])
    }
  }


  return (
    <Base title="Iniciar Sesión">
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        padding: '1rem',
        boxSizing: 'border-box'
      }}>
        <div className="card shadow-sm border-0 w-100" style={{ maxWidth: '500px' }}>
          <div className="card-header text-center" style={{ backgroundColor: '#5A2E1B' }}>
            <h3 className="text-white mb-0">Iniciar Sesión</h3>
          </div>
          <div className="card-body bg-white p-4">
            {alerts.map((a, i) => (
              <div key={i} className={`alert alert-${a.type} alert-dismissible fade show`} role="alert">
                {a.msg}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setAlerts(cur => cur.filter((_, idx) => idx !== i))}
                />
              </div>
            ))}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">Usuario</label>
                <input
                  id="username"
                  name="username"
                  className="form-control"
                  value={credentials.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Contraseña</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form-control"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn w-100 text-white fw-bold mt-3"
                style={{ backgroundColor: '#8B4513' }}
              >
                Iniciar Sesión
              </button>
            </form>
          </div>
          <div className="card-footer text-center" style={{ backgroundColor: '#FFFFFF' }}>
            <small>
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-decoration-none" style={{ color: '#5A2E1B' }}>
                Regístrate
              </Link>
            </small>
          </div>
        </div>
      </div>
    </Base>
  )
}
