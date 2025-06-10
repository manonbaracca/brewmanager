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
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const goToDashboard = () => {

    if (!user) {
      navigate('/login')
      return
    }

    const target = user.is_superuser ? '/dashboard' : '/staff-index'
    navigate(target)
  }

  const goToRegister = () => {
    if (!user) {
      navigate('/register')
      return
    }
    const target = user.is_superuser ? '/dashboard' : '/staff-index'
    navigate(target)
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <p>Cargando…</p>
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: '#C47A47',
      color: '#5A2E1B',
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
      padding: '1rem'
    }}>
      <img
        src={logo}
        alt="Logo"
        style={{
          width: 300,
          maxWidth: '80vw',
          height: 'auto',
          marginBottom: '2rem'
        }}
      />

      <h1 style={{
        fontSize: '2.5rem',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        Bienvenido
      </h1>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <button onClick={goToDashboard} style={linkStyle}>
          Iniciar Sesión
        </button>
        <button onClick={goToRegister} style={linkStyle}>
          Registrarse
        </button>
      </div>
    </div>
  )
}

const linkStyle = {
  backgroundColor: '#5A2E1B',
  color: '#fff',
  padding: '0.75rem 1.5rem',
  border: 'none',
  borderRadius: '5px',
  fontWeight: 'bold',
  cursor: 'pointer'
}
