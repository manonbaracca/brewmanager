import React, { useState } from 'react'
import axios from 'axios'
import Base from '@/components/Base'

export default function ForgotPassword() {
  const [value, setValue] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.get('/api/csrf/', { withCredentials: true })
      await axios.post('/api/password-reset/request/', { email: value }, { withCredentials: true })
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Base title="Recuperar contraseña">
      <div className="container my-5" style={{ maxWidth: 500 }}>
        <div className="card shadow-sm border-0">
          <div className="card-header text-white text-center" style={{ backgroundColor: '#5A2E1B' }}>
            Recuperar contraseña
          </div>
          <div className="card-body">
            {sent ? (
              <div className="alert alert-success">
                Si el email existe, te enviamos un enlace para restablecer tu contraseña.
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <label className="form-label">Email</label>
                <input className="form-control" value={value} onChange={e => setValue(e.target.value)} required type="email" />
                <button className="btn mt-3 text-white" style={{ backgroundColor: '#8B4513' }} disabled={loading}>
                  {loading ? 'Enviando…' : 'Enviar enlace'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </Base>
  )
}
