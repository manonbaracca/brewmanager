import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function NavBar() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await axios.get('/api/csrf/', { withCredentials: true }) 
        const { data } = await axios.get('/api/user/', { withCredentials: true })
        if (!cancelled) setUser(data?.is_authenticated ? data : null)
      } catch {
        if (!cancelled) setUser(null)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const handleLogout = async () => {
    try {
      await axios.get('/api/csrf/', { withCredentials: true })
      await axios.post('/api/logout/', new URLSearchParams(), {
        withCredentials: true,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
    } finally {
      setUser(null)
      navigate('/logout', { replace: true })
    }
  }

  const dashboardPath =
    user?.is_superuser ? '/dashboard'
      : String(user?.role || '').toLowerCase() === 'logistica'
      ? '/logistics'
      : '/staff-index'

  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: '#5A2E1B' }}>
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/">Brew Manager</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupported">
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarSupported">
          {user ? (
            <>
              <ul className="navbar-nav me-auto">
                <li className="nav-item">
                  <Link className="nav-link" to={dashboardPath}>Dashboard</Link>
                </li>
              </ul>
              <ul className="navbar-nav ms-auto align-items-center">
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">{user.username}</Link>
                </li>
                <li className="nav-item">
                  <button className="btn btn-link nav-link p-0" onClick={handleLogout} style={{ textDecoration: 'none' }}>
                    Cerrar Sesión
                  </button>
                </li>
              </ul>
            </>
          ) : (
            <ul className="navbar-nav ms-auto align-items-center">
              <li className="nav-item"><Link className="nav-link" to="/register">Registrarse</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/login">Iniciar Sesión</Link></li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  )
}
