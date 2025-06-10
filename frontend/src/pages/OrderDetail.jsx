// src/pages/OrderDetail.jsx
import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import Base from '@/components/Base'

export default function OrderDetail() {
  const { id } = useParams()
  const [pedido, setPedido] = useState(null)
  const [user, setUser]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    // Llamamos /api/user/ y /api/pedidos/:id/ en paralelo
    Promise.all([
      axios.get('/api/user/',      { withCredentials: true }),
      axios.get(`/api/pedidos/${id}/`, { withCredentials: true })
    ])
      .then(([userRes, pedidoRes]) => {
        setUser(userRes.data)
        setPedido(pedidoRes.data)
      })
      .catch(() => {
        setError('Error al cargar datos.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <Base title="Detalles del Pedido">
        <div className="container my-5 text-center">
          <p>Cargando…</p>
        </div>
      </Base>
    )
  }

  if (error) {
    return (
      <Base title="Detalles del Pedido">
        <div className="container my-4">
          <div className="alert alert-danger text-center">{error}</div>
        </div>
      </Base>
    )
  }

  // Si user.is_superuser → volvemos a /pedidos, si no → /staff-index
  const backPath = user?.is_superuser ? '/pedidos' : '/staff-index'

  return (
    <Base title="Detalles del Pedido">
      <div className="container my-4">
        <div className="card shadow-sm rounded-2">
          <div
            className="card-header text-white"
            style={{ backgroundColor: '#8B4513' }}
          >
            Detalles del Pedido
          </div>
          <div className="card-body">
            <p><strong>ID Pedido:</strong> {pedido.numero_pedido}</p>
            <p><strong>Usuario:</strong> {pedido.usuario}</p>
            <p>
              <strong>Fecha:</strong>{' '}
              {new Date(pedido.fecha).toLocaleDateString('es-ES')}
            </p>
            <hr />
            <h5>Productos:</h5>
            <table className="table table-striped">
              <thead
                className="text-white"
                style={{ backgroundColor: '#A0522D' }}
              >
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {pedido.detalles.map(d => (
                  <tr key={d.id}>
                    <td>{d.producto.nombre}</td>
                    <td>{d.producto.categoria.nombre}</td>
                    <td>{d.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-center mt-4">
              <Link
                to={backPath}
                className="btn text-white fw-semibold"
                style={{
                  backgroundColor: '#8B4513',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '0.25rem'
                }}
              >
                Volver
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Base>
  )
}
