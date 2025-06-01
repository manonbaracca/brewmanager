import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import Base from '@/components/Base'

export default function OrderDetail() {
  const { id } = useParams()
  const [pedido, setPedido] = useState(null)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`/api/pedidos/${id}/`, { withCredentials: true })
      .then(({ data }) => setPedido(data))
      .catch(() => setError('No se pudo cargar la información del pedido.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <Base title="Detalles del Pedido">
        <p className="text-center my-5">Cargando…</p>
      </Base>
    )
  }

  if (error) {
    return (
      <Base title="Detalles del Pedido">
        <div className="alert alert-danger my-4 text-center">{error}</div>
      </Base>
    )
  }

  return (
    <Base title="Detalles del Pedido">
      <div className="container my-4">
        <div className="card shadow">
          <div className="card-header text-white" style={{ backgroundColor: '#2E8B57' }}>
            Detalles del Pedido
          </div>
          <div className="card-body">
            <p><strong>ID Pedido:</strong> {pedido.numero_pedido}</p>
            <p><strong>Usuario:</strong> {pedido.usuario.username}</p>
            <p><strong>Fecha:</strong> {new Date(pedido.fecha).toLocaleDateString()}</p>
            <hr/>
            <h5>Productos:</h5>
            <table className="table">
              <thead>
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
                to="/pedidos"
                className="btn btn-secondary"
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
