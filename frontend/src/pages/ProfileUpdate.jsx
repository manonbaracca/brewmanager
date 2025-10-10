import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Base from '@/components/Base'
import api, { initCsrf } from '@/lib/api'

export default function ProfileUpdate() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    telefono: '',
    direccion: '',
  })
  const [role, setRole] = useState('')
  const [isSuper, setIsSuper] = useState(false)
  const [alerts, setAlerts] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const { data } = await api.get('/api/profile/')
        if (!alive) return
        setFormData({
          username: data.username,
          email:    data.email,
          telefono: data.telefono ?? '',
          direccion:data.direccion ?? '',
        })
        setIsSuper(!!data.is_superuser)      
        setRole(data.is_superuser ? 'admin' : (data.role || '')) 

      } catch {
        if (alive) setAlerts([{ type: 'danger', msg: 'No se pudo cargar el perfil.' }])
      }
    })()
    return () => { alive = false }
  }, [])

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setAlerts([])
    try {
      await initCsrf()
      const payload = new URLSearchParams({
        telefono: formData.telefono || '',
        direccion: formData.direccion || ''
      })
      await api.post('/api/profile/update/', payload, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
      navigate('/profile', { state: { successMessage: 'Perfil actualizado exitosamente' } })
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const msgs = Object.values(data).flat()
        setAlerts(msgs.map((msg,i)=>({ type:'danger', msg })))
      } else {
        setAlerts([{ type:'danger', msg:'Error al guardar los cambios.' }])
      }
    }
  }

  const roleLabel = (isSuper ? 'Admin' : (role ? role.charAt(0).toUpperCase() + role.slice(1) : '—'))

  return (
    <Base title="Actualizar Información">
      <div className="container my-5">
        {alerts.map((a,i)=>(
          <div key={i} className={`alert alert-${a.type} alert-dismissible fade show`}>
            {a.msg}
            <button type="button" className="btn-close"
              onClick={()=>setAlerts(cur=>cur.filter((_,idx)=>idx!==i))} />
          </div>
        ))}

        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow-sm border-0" style={{ borderRadius: 10, overflow: 'hidden' }}>
              <div className="card-header text-center"
                   style={{ backgroundColor: '#8B4513', color: '#FAF0E6', fontWeight:700, fontSize: '1.3rem' }}>
                Actualizar Información
              </div>
              <div className="card-body" style={{ backgroundColor: '#F5DEB3', padding: '2rem', color: '#5A2E1B' }}>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">Usuario</label>
                    <input id="username" name="username" className="form-control"
                      value={formData.username} readOnly disabled />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input id="email" name="email" type="email" className="form-control"
                      value={formData.email} readOnly disabled />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="telefono" className="form-label">Teléfono</label>
                    <input id="telefono" name="telefono" className="form-control"
                      value={formData.telefono} onChange={handleChange} />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="direccion" className="form-label">Dirección</label>
                    <input id="direccion" name="direccion" className="form-control"
                      value={formData.direccion} onChange={handleChange} />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="rol" className="form-label">Rol</label>
                    <input id="rol" className="form-control" value={roleLabel} readOnly disabled />
                  </div>

                  <div className="text-center">
                    <button type="submit" className="btn"
                      style={{
                        backgroundColor: '#5A2E1B',
                        color: '#FFF',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '5px',
                        fontWeight: 600,
                      }}
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Base>
  )
}
