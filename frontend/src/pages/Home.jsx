import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import logo from '@/static/img/logo.png'

export default function Home() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/user/', { withCredentials: true })
      .then(({ data }) => {
        if (data?.is_authenticated) setUser(data)
        else setUser(null)
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const destinationFor = (u) => {
    if (!u) return '/login'
    if (u.is_superuser) return '/dashboard'
    const role = String(u.role || '').toLowerCase()
    if (role === 'logistica') return '/logistics'
    return '/staff-index'
  }

  const goToLoginOrDashboard = () => navigate(destinationFor(user))
  const goToRegisterOrDashboard = () => user ? navigate(destinationFor(user)) : navigate('/register')

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <p>Cargando…</p>
      </div>
    )
  }

  return (
    <div style={wrapperStyle}>
      <img src={logo} alt="Logo" style={logoStyle} />
      <h1 style={titleStyle}>Bienvenido</h1>
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <button onClick={goToLoginOrDashboard} style={btnStyle}>Iniciar Sesión</button>
        <button onClick={goToRegisterOrDashboard} style={btnStyle}>Registrarse</button>
      </div>
    </div>
  )
}

const wrapperStyle = { backgroundColor:'#C47A47', color:'#5A2E1B', width:'100vw', height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:'Arial, sans-serif', boxSizing:'border-box', padding:'1rem' }
const logoStyle = { width:300, maxWidth:'80vw', height:'auto', marginBottom:'2rem' }
const titleStyle = { fontSize:'2.5rem', marginBottom:'2rem', textAlign:'center' }
const btnStyle = { backgroundColor:'#5A2E1B', color:'#fff', padding:'0.75rem 1.5rem', border:'none', borderRadius:'5px', fontWeight:'bold', cursor:'pointer' }
