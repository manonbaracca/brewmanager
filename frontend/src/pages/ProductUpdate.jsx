import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Base from '@/components/Base'
import TopNav from '@/components/TopNav'

export default function ProductUpdate() {
  const { id } = useParams()
  const nav = useNavigate()

  const [form, setForm] = useState({
    nombre: '',
    categoria: '',
    cantidad: 0
  })

  const [categorias, setCategorias] = useState([])
  const [sinStock, setSinStock] = useState([])

  const [trabajadoresCount, setTrabajadoresCount] = useState(0)
  const [productCount, setProductCount] = useState(0)
  const [pedidosCount, setPedidosCount] = useState(0)

  const [alert, setAlert] = useState(null)

  useEffect(() => {

    Promise.all([
      axios.get(`/api/productos/${id}/`,       { withCredentials: true }),  
      axios.get('/api/categorias/',            { withCredentials: true }), 
      axios.get('/api/productos/',             { withCredentials: true }),  
      axios.get('/api/staff/',                 { withCredentials: true }),  
      axios.get('/api/pedidos/',               { withCredentials: true })  
    ])
      .then(([pRes, cRes, prodRes, staffRes, pedRes]) => {

        setForm({
          nombre:   pRes.data.nombre,
          categoria: pRes.data.categoria.id,
          cantidad:  pRes.data.cantidad
        })

        setCategorias(Array.isArray(cRes.data) ? cRes.data : [])

        const allProducts = Array.isArray(prodRes.data) ? prodRes.data : []
        setProductCount(allProducts.length)
        setSinStock(allProducts.filter(p => p.cantidad === 0))

        const allStaff = Array.isArray(staffRes.data) ? staffRes.data : []
        setTrabajadoresCount(allStaff.length)

        const allPedidos = Array.isArray(pedRes.data) ? pedRes.data : []
        setPedidosCount(allPedidos.length)
      })
      .catch(() => {
        setAlert({ type: 'danger', msg: 'Error al cargar datos iniciales.' })
      })
  }, [id])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await axios.put(
        `/api/productos/${id}/`,
        form,
        { withCredentials: true }
      )
      nav('/producto', {
        state: { successMessage: 'Producto actualizado.' }
      })
    } catch {
      setAlert({ type: 'danger', msg: 'Error al guardar cambios.' })
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
            <button
              className="btn-close"
              onClick={() => setAlert(null)}
            />
          </div>
        )}

        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-sm border-0">
              <div
                className="card-header text-center text-white"
                style={{ backgroundColor: '#5A2E1B' }}
              >
                Editar Producto
              </div>
              <div
                className="card-body"
                style={{ backgroundColor: '#F5DEB3' }}
              >
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                      name="nombre"
                      className="form-control"
                      value={form.nombre}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Categoría</label>
                    <select
                      name="categoria"
                      className="form-select"
                      value={form.categoria}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Selecciona...</option>
                      {categorias.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Cantidad</label>
                    <input
                      name="cantidad"
                      type="number"
                      className="form-control"
                      value={form.cantidad}
                      onChange={handleChange}
                      min="0"
                      required
                    />
                  </div>

                  <div className="d-flex justify-content-between mt-4">
                    <button
                      type="button"
                      className="btn"
                      onClick={() => nav('/producto')}
                      style={{
                        backgroundColor: '#FAF0E6',
                        color: '#5A2E1B',
                        border: '1px solid #5A2E1B'
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn text-white"
                      style={{ backgroundColor: '#8B4513' }}
                    >
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
