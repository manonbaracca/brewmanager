import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Base from '@/components/Base'

export default function OrderDelete() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pedido, setPedido] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get(`/api/pedidos/${id}/`, { withCredentials: true })
      .then(({ data }) => setPedido(data))
      .catch(() => setError('No se pudo cargar el pedido.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = () => {
    axios.delete(`/api/pedidos/${id}/`, { withCredentials: true })
      .then(() => {
        navigate('/pedidos', { state: { successMessage: 'Pedido eliminado exitosamente.' } })
      })
      .catch(() => setError('Error al eliminar el pedido.'))
  }

  if (loading) {
    return (
      <Base title="Eliminar Pedido">
        <p className="text-center my-5">Cargando…</p>
      </Base>
    )
  }

  return (
    <Base title="Confirmar Eliminación">
      <div className="container my-4">
        {error && <div className="alert alert-danger">{error}</div>}
        {pedido && (
          <div className="alert alert-danger text-center">
            <h5>
              <i className="fas fa-exclamation-triangle"></i>{' '}
              ¿Estás seguro que deseas eliminar el pedido <strong>{pedido.numero_pedido}</strong>?
            </h5>
            <div className="mt-4">
              <button className="btn btn-danger me-3" onClick={handleDelete}>
                Eliminar Pedido
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/pedidos')}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </Base>
  )
}
