import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Base from '@/components/Base'
import api, { initCsrf } from '@/lib/api'

export default function OrderDelete() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pedido, setPedido] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    api.get(`/api/pedidos/${id}/`).then(({ data }) => alive && setPedido(data)).catch(() => alive && setError('No se pudo cargar el pedido.'))
    api.get('/api/user/').then(res => alive && setUser(res.data)).catch(() => alive && setUser(null)).finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [id])

  const destino = () => (user?.is_superuser ? '/pedidos' : '/staff-index')

  const handleDelete = async () => {
    try {
      await initCsrf()
      await api.delete(`/api/pedidos/${id}/`)
      navigate(destino(), { state: { successMessage: 'Pedido eliminado exitosamente.' } })
    } catch {
      setError('Error al eliminar el pedido.')
    }
  }

  if (loading) {
    return (
      <Base title="Eliminar Pedido">
        <div className="container my-5 text-center"><p>Cargando…</p></div>
      </Base>
    )
  }

  return (
    <Base title="Confirmar Eliminación">
      <div className="container my-4">
        {error && <div className="alert alert-danger text-center">{error}</div>}
        {pedido && (
          <div className="card shadow-sm rounded-2">
            <div className="card-header text-white" style={{ backgroundColor: '#8B4513' }}>⚠️ Eliminar Pedido</div>
            <div className="card-body text-center">
              <h5>¿Estás seguro que deseas eliminar el pedido <strong>{pedido.numero_pedido}</strong>?</h5>
              <div className="mt-4">
                <button className="btn me-3 text-white" style={{ backgroundColor: '#8B0000' }} onClick={handleDelete}>Sí, eliminar</button>
                <button className="btn" style={{ backgroundColor: '#A0522D', color: '#FFF' }} onClick={() => navigate(destino())}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Base>
  )
}
