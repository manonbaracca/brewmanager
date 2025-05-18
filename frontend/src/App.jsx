import './App.css'

function App() {
  return (
    <div style={{ 
      backgroundColor: '#C47A47', 
      color: '#5A2E1B', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <img 
        src="/static/img/logo.png" 
        alt="Logo" 
        style={{ width: 400, marginBottom: 40 }} 
      />

      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Bienvenido </h1>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <a href="/login/" style={linkStyle}>Iniciar Sesión</a>
        <a href="/register/" style={linkStyle}>Registrarse</a>
      </div>
    </div>
  )
}

const linkStyle = {
  backgroundColor: '#5A2E1B',
  color: '#fff',
  padding: '0.75rem 1.5rem',
  textDecoration: 'none',
  borderRadius: '5px',
  fontWeight: 'bold'
}

export default App
