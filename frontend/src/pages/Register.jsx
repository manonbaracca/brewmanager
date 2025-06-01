import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import Base from '@/components/Base'

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password1: '',
    password2: '',
  })
  const [alerts, setAlerts] = useState([])
  const navigate = useNavigate()

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setAlerts([])

    const payload = new URLSearchParams({
      username:  formData.username,
      email:     formData.email,
      password1: formData.password1,
      password2: formData.password2,
    })

    try {
      await axios.post(
        '/api/register/',
        payload,                               
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          withCredentials: true
        }
      )
      navigate('/login')
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const errs = Object.values(data).flat()
        setAlerts(errs.map((msg,i) => ({ type:'danger', msg })))
      } else {
        setAlerts([{ type:'danger', msg:'Error al crear la cuenta.' }])
      }
    }
  }

  return (
    <Base title="Crear Cuenta">
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
            <h3 className="text-white mb-0">Crear Cuenta</h3>
          </div>
          <div className="card-body bg-white p-4">
            {alerts.map((a, i) => (
              <div
                key={i}
                className={`alert alert-${a.type} alert-dismissible fade show`}
                role="alert"
              >
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
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password1" className="form-label">Contraseña</label>
                <input
                  id="password1"
                  name="password1"
                  type="password"
                  className="form-control"
                  value={formData.password1}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password2" className="form-label">Confirmar Contraseña</label>
                <input
                  id="password2"
                  name="password2"
                  type="password"
                  className="form-control"
                  value={formData.password2}
                  onChange={handleChange}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn w-100 text-white fw-bold mt-3"
                style={{ backgroundColor: '#8B4513' }}
              >
                Crear Cuenta
              </button>
            </form>
          </div>
          <div
            className="card-footer text-center"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            <small>
              ¿Ya tienes cuenta?{' '}
              <Link
                to="/login"
                className="text-decoration-none"
                style={{ color: '#5A2E1B' }}
              >
                Inicia sesión
              </Link>
            </small>
          </div>
        </div>
      </div>
    </Base>
  )
}
