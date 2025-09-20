import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Base from '@/components/Base'
import api, { initCsrf } from '@/lib/api'

export default function ResetPassword() {
  const { uid, token } = useParams()
  const [p1, setP1] = useState('')
  const [p2, setP2] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async e => {
    e.preventDefault()
    setError('')
    if (p1 !== p2) return setError('Las contraseñas no coinciden.')
    setLoading(true)
    try {
      await initCsrf()
      await api.post('/api/password-reset/confirm/', {
        uid, token, password1: p1, password2: p2
      })
      setDone(true)
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err?.response?.data?.detail || 'No se pudo actualizar la contraseña.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Base title="Restablecer contraseña">
      <div className="container my-5" style={{ maxWidth: 500 }}>
        <div className="card shadow-sm border-0">
          <div className="card-header text-white text-center" style={{ backgroundColor: '#5A2E1B' }}>
            Restablecer contraseña
          </div>
          <div className="card-body">
            {done ? (
              <div className="alert alert-success">Contraseña actualizada. Redirigiendo…</div>
            ) : (
              <form onSubmit={submit}>
                {error && <div className="alert alert-danger">{error}</div>}
                <label className="form-label">Nueva contraseña</label>
                <input className="form-control mb-3" type="password" value={p1} onChange={e => setP1(e.target.value)} required />
                <label className="form-label">Repetí la contraseña</label>
                <input className="form-control mb-3" type="password" value={p2} onChange={e => setP2(e.target.value)} required />
                <button className="btn text-white" style={{ backgroundColor: '#8B4513' }} disabled={loading}>
                  {loading ? 'Guardando…' : 'Guardar'}
                </button>
                <Link className="btn btn-link ms-2" to="/login">Volver</Link>
              </form>
            )}
          </div>
        </div>
      </div>
    </Base>
  )
}
