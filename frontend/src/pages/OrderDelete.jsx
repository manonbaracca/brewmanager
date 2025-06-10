import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Base from '@/components/Base'

export default function OrderDelete() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pedido, setPedido] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get(`/api/pedidos/${id}/`, { withCredentials: true })
      .then(({ data }) => setPedido(data))
      .catch(() => setError('No se pudo cargar el pedido.'))
  }, [id])

  useEffect(() => {
    axios.get('/api/user/', { withCredentials: true })
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const destino = () => user?.is_superuser ? '/pedidos' : '/staff-index'

  const handleDelete = () => {
    axios.delete(`/api/pedidos/${id}/`, { withCredentials: true })
      .then(() => {
        navigate(destino(), {
          state: { successMessage: 'Pedido eliminado exitosamente.' }
        })
      })
      .catch(() => setError('Error al eliminar el pedido.'))
  }

  if (loading) {
    return (
      <Base title="Eliminar Pedido">
        <div className="container my-5 text-center">
          <p>Cargando…</p>
        </div>
      </Base>
    )
  }

  return (
    <Base title="Confirmar Eliminación">
      <div className="container my-4">
        {error && (
          <div className="alert alert-danger text-center">{error}</div>
        )}
        {pedido && (
          <div className="card shadow-sm rounded-2">
            <div
              className="card-header text-white"
              style={{ backgroundColor: '#8B4513' }}
            >
              ⚠️ Eliminar Pedido
            </div>
            <div className="card-body text-center">
              <h5>
                ¿Estás seguro que deseas eliminar el pedido{' '}
                <strong>{pedido.numero_pedido}</strong>?
              </h5>
              <div className="mt-4">
                <button
                  className="btn me-3 text-white"
                  style={{ backgroundColor: '#8B0000' }}
                  onClick={handleDelete}
                >
                  Sí, eliminar
                </button>
                <button
                  className="btn"
                  style={{ backgroundColor: '#A0522D', color: '#FFF' }}
                  onClick={() => navigate(destino())}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Base>
  )
}
