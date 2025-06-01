import React, { useEffect } from 'react'
import NavBar from './NavBar'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../index.css'

export default function Base({ children, title }) {
  useEffect(() => {
    document.title = title || 'Brew Manager'
  }, [title])

  return (
    <>
      <NavBar />
      <main style={{
        display: 'flex',
        flexDirection: 'column', 
        backgroundColor: '#F5F5F5',
        minHeight: 'calc(100vh - 56px)'
      }}>
        {children}
      </main>
    </>
  )
}
