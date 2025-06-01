import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Base from '@/components/Base'
import TopNav from '@/components/TopNav'

export default function Orders() {
  const [pedidos, setPedidos] = useState([])
  const [sinStock, setSinStock] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [filtroFecha, setFiltroFecha] = useState('Todos')
  const [filtroUsuario, setFiltroUsuario] = useState('Todos')
  const [usuarios, setUsuarios] = useState([])

  useEffect(() => {
    axios.get('/api/staff/', { withCredentials: true })
      .then(res => setUsuarios(res.data))
      .catch(() => {})

    Promise.all([
      axios.get('/api/pedidos/', { withCredentials: true }),
      axios.get('/api/productos/?cantidad=0', { withCredentials: true }),
    ])
      .then(([pedRes, sinRes]) => {
        setPedidos(pedRes.data)
        setSinStock(sinRes.data)
      })
      .catch(() => setError('No se pudieron cargar los pedidos.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Base title="Pedidos">
        <div className="container my-5"><p>Cargando pedidos…</p></div>
      </Base>
    )
  }


  return (
    <Base title="Pedidos">
      <TopNav
        productosSinStock={sinStock}
        trabajadoresCount={0}
        productCount={0}
        pedidosCount={pedidos.length}
      />

      <div className="container my-4">
        {error && (
          <div className="alert alert-warning alert-dismissible fade show">
            {error}
            <button className="btn-close" onClick={() => setError('')} />
          </div>
        )}

        <div className="card shadow-sm mb-4">
          <div className="card-body p-3 d-flex flex-wrap align-items-center justify-content-center" style={{ backgroundColor: '#A0522D', gap: 20 }}>
            <select className="form-select" style={{ maxWidth: 200 }} value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)}>
              {['Todos','Hoy','Este mes','Este año'].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <select className="form-select" style={{ maxWidth: 200 }} value={filtroUsuario} onChange={e => setFiltroUsuario(e.target.value)}>
              <option value="Todos">Todos</option>
              {usuarios.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
            </select>
          </div>
        </div>

        {pedidos.length > 0 ? (
          <table className="table table-striped mb-0">
            <thead className="text-white text-center" style={{ backgroundColor: '#5A2E1B' }}>
              <tr>
                <th>Número Pedido</th><th>Pedido por</th><th>Fecha</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map(p => (
                <tr key={p.id} className="text-center">
                  <td>{p.numero_pedido}</td>
                  <td>{p.usuario.username}</td>
                  <td>{new Date(p.fecha).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/pedido/${p.id}`} className="btn btn-sm me-2" style={{ backgroundColor: '#A0522D', color: '#FFF' }}>
                      Ver
                    </Link>
                    <Link to={`/pedido/delete/${p.id}`} className="btn btn-sm" style={{ backgroundColor: '#8B0000', color: '#FFF' }}>
                      Eliminar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="alert alert-warning text-center mt-3">
            No hay pedidos con los filtros seleccionados.
          </div>
        )}
      </div>
    </Base>
  )
}
