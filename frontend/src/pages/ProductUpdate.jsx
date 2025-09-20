import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Base from '@/components/Base'
import TopNav from '@/components/TopNav'
import api, { initCsrf } from '@/lib/api'

export default function ProductUpdate() {
  const { id } = useParams()
  const nav = useNavigate()

  const [form, setForm] = useState({ nombre: '', categoria_id: '', cantidad: 0 })
  const [categorias, setCategorias] = useState([])
  const [sinStock, setSinStock] = useState([])
  const [trabajadoresCount, setTrabajadoresCount] = useState(0)
  const [productCount, setProductCount] = useState(0)
  const [pedidosCount, setPedidosCount] = useState(0)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const [pRes, cRes, prodRes, staffRes, pedRes] = await Promise.all([
          api.get(`/api/productos/${id}/`),
          api.get('/api/categorias/'),
          api.get('/api/productos/'),
          api.get('/api/staff/'),
          api.get('/api/pedidos/')
        ])

        if (!alive) return

        setForm({
          nombre:       pRes.data.nombre,
          categoria_id: pRes.data.categoria.id,
          cantidad:     pRes.data.cantidad
        })

        const cats = Array.isArray(cRes.data) ? cRes.data : []
        setCategorias(cats)

        const allProducts = Array.isArray(prodRes.data) ? prodRes.data : []
        setProductCount(allProducts.length)
        setSinStock(allProducts.filter(p => p.cantidad === 0))

        const allStaff = Array.isArray(staffRes.data) ? staffRes.data : []
        setTrabajadoresCount(allStaff.length)

        const allPedidos = Array.isArray(pedRes.data) ? pedRes.data : []
        setPedidosCount(allPedidos.length)
      } catch {
        if (alive) setAlert({ type: 'danger', msg: 'Error al cargar datos iniciales.' })
      }
    })()
    return () => { alive = false }
  }, [id])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setAlert(null)
    try {
      await initCsrf()
      const payload = {
        nombre:       form.nombre,
        categoria_id: form.categoria_id ? Number(form.categoria_id) : null,
        cantidad:     Number(form.cantidad),
      }
      await api.put(`/api/productos/${id}/`, payload)
      nav('/producto', { state: { successMessage: `Producto "${form.nombre}" editado correctamente.` } })
    } catch (err) {
      const data = err.response?.data || {}
      if (data?.categoria_id)      setAlert({ type:'danger', msg:'Debes seleccionar una categoría.' })
      else if (data?.cantidad)     setAlert({ type:'danger', msg:'La cantidad no es válida.' })
      else if (data?.nombre)       setAlert({ type:'danger', msg:'Nombre inválido o duplicado.' })
      else                         setAlert({ type:'danger', msg:'Error al guardar cambios.' })
    }
  }

  return (
    <Base title="Editar Producto">
      <TopNav
        productosSinStock={sinStock}
        trabajadoresCount={trabajadoresCount}
        productCount={productCount}
        pedidosCount={pedidosCount}
      />

      <div className="container my-5">
        {alert && (
          <div className={`alert alert-${alert.type} alert-dismissible fade show`}>
            {alert.msg}
            <button className="btn-close" onClick={() => setAlert(null)} />
          </div>
        )}

        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-sm border-0">
              <div className="card-header text-center text-white" style={{ backgroundColor: '#5A2E1B' }}>
                Editar Producto
              </div>
              <div className="card-body" style={{ backgroundColor: '#F5DEB3' }}>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input name="nombre" className="form-control" value={form.nombre} onChange={handleChange} required />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Categoría</label>
                    <select name="categoria_id" className="form-select" value={form.categoria_id} onChange={handleChange} required>
                      <option value="">Selecciona...</option>
                      {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Cantidad</label>
                    <input name="cantidad" type="number" className="form-control" value={form.cantidad} onChange={handleChange} min="0" required />
                  </div>

                  <div className="d-flex justify-content-between mt-4">
                    <button type="button" className="btn" onClick={() => nav('/producto')}
                      style={{ backgroundColor:'#FAF0E6', color:'#5A2E1B', border:'1px solid #5A2E1B' }}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn text-white" style={{ backgroundColor:'#8B4513' }}>
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Base>
  )
}
