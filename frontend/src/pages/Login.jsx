import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Base from '@/components/Base'
import api from '@/lib/api' 

export default function Login() {
  const [step, setStep] = useState(1)
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [otpId, setOtpId] = useState(null)
  const [otpCode, setOtpCode] = useState('')
  const [maskedEmail, setMaskedEmail] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const pushAlert = (msg, type = 'danger') =>
    setAlerts(cur => [...cur, { msg, type }])

  const handleChange = e => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value })
  }

  const handleSubmitStep1 = async e => {
    e.preventDefault()
    setAlerts([])
    setLoading(true)
    try {
      const payload = new URLSearchParams({
        username: credentials.username,
        password: credentials.password,
      })

      const { data, status } = await api.post('/api/login/', payload, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        validateStatus: () => true, 
      })

      if (status === 202 && data?.otp_required && data.otp_id) {
        setOtpId(data.otp_id)
        setMaskedEmail(data.masked_email || null)
        setStep(2)
      } else if (status === 400) {
        const errs = Object.values(data?.errors || {}).flat()
        if (errs.length) errs.forEach(m => pushAlert(String(m)))
        else pushAlert('Usuario o contraseña incorrectos.')
      } else {
        pushAlert('No se pudo iniciar sesión.')
      }
    } catch {
      pushAlert('No se pudo iniciar sesión.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitStep2 = async e => {
    e.preventDefault()
    setAlerts([])
    setLoading(true)
    try {
      const payload = new URLSearchParams({ otp_id: otpId, code: otpCode })

      const { data, status } = await api.post('/api/login/verify/', payload, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        validateStatus: () => true,
      })

      if (status >= 400) {
        pushAlert(data?.detail || 'Código incorrecto o vencido.')
        return
      }

      const { data: profile } = await api.get('/api/profile/')
      const nextPath = profile.is_superuser
        ? '/dashboard'
        : profile.role === 'logistica'
          ? '/logistics'
          : '/staff-index'
      navigate(nextPath)
    } catch {
      pushAlert('Código incorrecto o vencido.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Base title="Iniciar Sesión">
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', width:'100%', padding:'1rem', boxSizing:'border-box' }}>
        <div className="card shadow-sm border-0 w-100" style={{ maxWidth: 500 }}>
          <div className="card-header text-center" style={{ backgroundColor: '#5A2E1B' }}>
            <h3 className="text-white mb-0">Iniciar Sesión</h3>
          </div>

          <div className="card-body bg-white p-4">
            {alerts.map((a, i) => (
              <div key={i} className={`alert alert-${a.type} alert-dismissible fade show`} role="alert">
                {a.msg}
                <button type="button" className="btn-close" onClick={() => setAlerts(cur => cur.filter((_, idx) => idx !== i))} />
              </div>
            ))}

            {step === 1 ? (
              <form onSubmit={handleSubmitStep1}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Usuario</label>
                  <input
                    id="username"
                    name="username"
                    className="form-control"
                    value={credentials.username}
                    onChange={handleChange}
                    required
                    autoComplete="username"
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
                    autoComplete="current-password"
                  />
                </div>
                <button
                  type="submit"
                  className="btn w-100 text-white fw-bold mt-3"
                  style={{ backgroundColor: '#8B4513' }}
                  disabled={loading}
                >
                  {loading ? 'Enviando código…' : 'Continuar'}
                </button>
                <div className="mt-3 text-center">
                  <Link to="/forgot-password" className="text-decoration-none" style={{ color: '#5A2E1B' }}>
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmitStep2}>
                <div className="mb-2 text-muted">
                  Te enviamos un código a {maskedEmail ?? 'tu email registrado'}.
                </div>
                <div className="mb-3">
                  <label htmlFor="otp" className="form-label">Código de verificación</label>
                  <input
                    id="otp"
                    className="form-control"
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                    required
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="######"
                  />
                </div>
                <button
                  type="submit"
                  className="btn w-100 text-white fw-bold mt-3"
                  style={{ backgroundColor: '#8B4513' }}
                  disabled={loading}
                >
                  {loading ? 'Verificando…' : 'Ingresar'}
                </button>
              </form>
            )}
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
