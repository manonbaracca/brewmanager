import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import Base from '@/components/Base'
import TopNav from '@/components/TopNav'

export default function Products() {
  const [categorias, setCategorias]   = useState([])
  const [selectedCat, setSelectedCat] = useState('Todos')
  const [allProducts, setAllProducts] = useState([])    
  const [productos, setProductos]     = useState([])    
  const [usuariosCount, setUsuariosCount] = useState(0)
  const [pedidosCount, setPedidosCount]   = useState(0)
  const [form, setForm]                   = useState({ nombre: '', categoria_id: '', cantidad: 1 })
  const [alert, setAlert]                 = useState(null)
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get('/api/categorias/',        { withCredentials: true }),
      axios.get('/api/staff/',             { withCredentials: true }),
      axios.get('/api/pedidos/',           { withCredentials: true }),
      axios.get('/api/productos/',         { withCredentials: true }),
      axios.get('/api/productos/?cantidad=0', { withCredentials: true })
    ])
    .then(([catRes, usersRes, pedRes, prodRes, stockRes]) => {
      setCategorias(catRes.data)
      setUsuariosCount(usersRes.data.length)
      setPedidosCount(pedRes.data.length)
      setAllProducts(prodRes.data)
    })
    .catch(() => {
      setAlert({ type:'warning', msg:'No se pudo cargar la info inicial.' })
    })
    .finally(() => {
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (selectedCat === 'Todos') {
      setProductos(allProducts)
    } else {
      setProductos(
        allProducts.filter(p => String(p.categoria.id) === String(selectedCat))
      )
    }
  }, [allProducts, selectedCat])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setAlert(null)

    if (form.cantidad < 1) {
      setAlert({ type: 'danger', msg: 'La cantidad debe ser mayor a cero.' })
      return
    }

    try {
      await axios.post(
        '/api/productos/',
        {
          nombre:       form.nombre,
          cantidad:     form.cantidad,
          categoria_id: form.categoria_id,
        },
        { withCredentials: true }
      )
      const { data: nuevos } = await axios.get('/api/productos/', { withCredentials: true })
      setAllProducts(nuevos)
      setForm({ nombre: '', categoria_id: '', cantidad: 1 })
      setAlert({ type: 'success', msg: 'Producto agregado correctamente.' })
    } catch (err) {
      const data = err.response?.data || {}
      if (data.nombre?.[0]?.includes('Ya existe producto')) {
        setAlert({ type: 'danger', msg: 'El producto ya existe con ese nombre.' })
      } else if (data.cantidad) {
        setAlert({ type: 'danger', msg: 'La cantidad debe ser mayor a cero.' })
      } else if (data.categoria_id) {
        setAlert({ type: 'danger', msg: 'Debes seleccionar una categoría.' })
      } else {
        setAlert({ type: 'danger', msg: 'Error al agregar producto.' })
      }
    }
  }

  if (loading) {
    return (
      <Base title="Productos">
        <div className="container my-5"><p>Cargando…</p></div>
      </Base>
    )
  }
  const sinStock = allProducts.filter(p => p.cantidad === 0)

  return (
    <Base title="Productos">
      <TopNav
        productosSinStock={allProducts.filter(p => p.cantidad === 0)}
        trabajadoresCount={usuariosCount}
        productCount={allProducts.length}
        pedidosCount={pedidosCount}
      />

      <div className="container my-4">
        {alert && (
          <div className={`alert alert-${alert.type} alert-dismissible fade show`}>
            {alert.msg}
            <button className="btn-close" onClick={() => setAlert(null)} />
          </div>
        )}


        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body d-flex align-items-center justify-content-center p-3" style={{ backgroundColor: '#A0522D', gap: '.5rem' }}>
            <label className="fw-bold text-white mb-0">Categoría:</label>
            <select
              className="form-select"
              style={{ maxWidth: 300 }}
              value={selectedCat}
              onChange={e => setSelectedCat(e.target.value)}
            >
              <option value="Todos">Todas las categorías</option>
              {categorias.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-4 order-lg-2">
            <div className="card shadow-sm border-0">
              <div className="card-header text-white text-center" style={{ backgroundColor:'#5A2E1B', fontWeight:'bold' }}>
                Agregar Producto
              </div>
              <div className="card-body bg-white">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input name="nombre" className="form-control" value={form.nombre} onChange={handleChange} required/>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Categoría</label>
                    <select name="categoria_id" className="form-select" value={form.categoria_id} onChange={handleChange} required>
                      <option value="">Selecciona...</option>
                      {categorias.map(c=>(
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Cantidad</label>
                    <input name="cantidad" type="number" className="form-control" value={form.cantidad} onChange={handleChange} min="1" required/>
                  </div>
                  <button type="submit" className="btn w-100 mt-3" style={{ backgroundColor:'#A0522D', color:'#FFF' }}>
                    Agregar Producto
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-8 order-lg-1">
            <div className="card shadow-sm border-0">
              <div className="card-header text-white text-center" style={{ backgroundColor:'#5A2E1B', fontWeight:'bold' }}>
                Lista de Productos
              </div>
              <div className="card-body p-0">
                {productos.length === 0 ? (
                  <p className="text-center my-4 text-muted">No hay productos en esta categoría.</p>
                ) : (
                  <table className="table table-hover mb-0">
                    <thead className="text-white text-center" style={{ backgroundColor:'#8B4513' }}>
                      <tr>
                        <th>Nombre</th><th>Categoría</th><th>Cantidad</th><th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productos.map(p => (
                        <tr key={p.id} className="text-center">
                          <td>{p.nombre}</td>
                          <td>{p.categoria.nombre}</td>
                          <td>{p.cantidad}</td>
                          <td>
                            <Link to={`/producto/update/${p.id}`} className="btn btn-sm me-2" style={{ backgroundColor:'#A0522D', color:'#FFF' }}>Editar</Link>
                            <Link to={`/producto/delete/${p.id}`} className="btn btn-sm" style={{ backgroundColor:'#8B0000', color:'#FFF' }}>Eliminar</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Base>
  )
}
