import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Base from '@/components/Base'
import TopNav from '@/components/TopNav'

export default function Orders() {
  const [pedidos, setPedidos] = useState([])
  const [sinStock, setSinStock] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [trabajadoresCount, setTrabajadoresCount] = useState(0)
  const [productCount, setProductCount] = useState(0)
  const [pedidosCount, setPedidosCount] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [filtroFecha, setFiltroFecha] = useState('Todos')
  const [filtroUsuario, setFiltroUsuario] = useState('Todos')

  useEffect(() => {
    Promise.all([
      axios.get('/api/staff/',     { withCredentials: true }),
      axios.get('/api/pedidos/',   { withCredentials: true }),
      axios.get('/api/productos/', { withCredentials: true }),
    ])
      .then(([staffRes, pedRes, prodRes]) => {
        const allStaff = Array.isArray(staffRes.data) ? staffRes.data : []
        setUsuarios(allStaff)
        setTrabajadoresCount(allStaff.length)

        const allPedidos = Array.isArray(pedRes.data) ? pedRes.data : []
        setPedidos(allPedidos)
        setPedidosCount(allPedidos.length)

        const allProducts = Array.isArray(prodRes.data) ? prodRes.data : []
        setProductCount(allProducts.length)
        setSinStock(allProducts.filter(p => p.cantidad === 0))
      })
      .catch(() => {
        setError('No se pudieron cargar los datos de pedidos.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <Base title="Pedidos">
        <div className="container my-5 text-center">
          <p>Cargando pedidos…</p>
        </div>
      </Base>
    )
  }

  const filtrarPedidos = () => {
    let resultado = [...pedidos]

    if (filtroFecha === 'Hoy') {
      const hoy = new Date().toISOString().slice(0, 10)
      resultado = resultado.filter(p => p.fecha.startsWith(hoy))
    } else if (filtroFecha === 'Este mes') {
      const ahora = new Date()
      const mes  = String(ahora.getMonth() + 1).padStart(2, '0')
      const anio = ahora.getFullYear()
      resultado = resultado.filter(p => {
        const [fechaISO] = p.fecha.split('T')
        const [year, month] = fechaISO.split('-')
        return Number(year) === anio && month === mes
      })
    } else if (filtroFecha === 'Este año') {
      const anio = new Date().getFullYear()
      resultado = resultado.filter(p => {
        const [fechaISO] = p.fecha.split('T')
        const [year] = fechaISO.split('-')
        return Number(year) === anio
      })
    }

    if (filtroUsuario !== 'Todos') {
      resultado = resultado.filter(
        p => String(p.usuario.id) === String(filtroUsuario)
      )
    }

    return resultado
  }

  const pedidosFiltrados = filtrarPedidos()

  return (
    <Base title="Pedidos">
      <TopNav
        productosSinStock={sinStock}
        trabajadoresCount={trabajadoresCount}
        productCount={productCount}
        pedidosCount={pedidosCount}
      />

      <div className="container my-4">
        {error && (
          <div className="alert alert-warning alert-dismissible fade show">
            {error}
            <button className="btn-close" onClick={() => setError('')} />
          </div>
        )}

        <div className="card shadow-sm mb-4">
          <div
            className="card-body p-3 d-flex flex-wrap align-items-center justify-content-center"
            style={{ backgroundColor: '#A0522D', gap: 20 }}
          >
            <select
              className="form-select"
              style={{ maxWidth: 200 }}
              value={filtroFecha}
              onChange={e => setFiltroFecha(e.target.value)}
            >
              {['Todos', 'Hoy', 'Este mes', 'Este año'].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            <select
              className="form-select"
              style={{ maxWidth: 200 }}
              value={filtroUsuario}
              onChange={e => setFiltroUsuario(e.target.value)}
            >
              <option value="Todos">Todos</option>
              {usuarios.map(u => (
                <option key={u.id} value={u.id}>
                  {u.username}
                </option>
              ))}
            </select>
          </div>
        </div>

        {pedidosFiltrados.length > 0 ? (
          <table className="table table-striped mb-0">
            <thead
              className="text-white text-center"
              style={{ backgroundColor: '#5A2E1B' }}
            >
              <tr>
                <th>Número Pedido</th>
                <th>Pedido por</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map(p => (
                <tr key={p.id} className="text-center">
                  <td>{p.numero_pedido}</td>
                  <td>{p.usuario.username}</td>
                  <td>{new Date(p.fecha).toLocaleDateString('es-ES')}</td>
                  <td>
                    <Link
                      to={`/pedidos/${p.id}`}
                      className="btn btn-sm me-2"
                      style={{ backgroundColor: '#A0522D', color: '#FFF'}}
                    >
                      Ver
                    </Link>
                    <Link
                      to={`/pedidos/delete/${p.id}`}
                      className="btn btn-sm"
                      style={{ backgroundColor: '#8B0000', color: '#FFF'}}
                    >
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
