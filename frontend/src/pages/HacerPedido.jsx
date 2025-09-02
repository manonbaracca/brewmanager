import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Base from '@/components/Base'

export default function HacerPedido() {
  const navigate = useNavigate()

  const [categorias, setCategorias]       = useState([])
  const [selectedCat, setSelectedCat]     = useState('Todos')
  const [allProducts, setAllProducts]     = useState([])
  const [productos, setProductos]         = useState([])
  const [carrito, setCarrito]             = useState([])
  const [alertas, setAlertas]             = useState([])
  const [loading, setLoading]             = useState(true)
  const [isSubmitting, setIsSubmitting]   = useState(false)

  useEffect(() => {
    Promise.all([
      axios.get('/api/categorias/', { withCredentials: true }),
      axios.get('/api/productos/',   { withCredentials: true }),
    ])
      .then(([catRes, prodRes]) => {
        const cats  = Array.isArray(catRes.data) ? catRes.data : []
        const prods = Array.isArray(prodRes.data) ? prodRes.data : []
        setCategorias(cats)
        setAllProducts(prods)
        setProductos(prods)
      })
      .catch(() => {
        setAlertas([{ type: 'danger', msg: 'Error al cargar datos iniciales.' }])
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (selectedCat === 'Todos') {
      setProductos(allProducts)
    } else {
      setProductos(
        allProducts.filter(p => String(p.categoria.id) === String(selectedCat))
      )
    }
  }, [selectedCat, allProducts])

  const pushAlerta = (type, msg) => {
    setAlertas(a => [...a, { type, msg }])
  }

  const handleAgregarCarrito = (producto, cantidad) => {
    if (cantidad < 1) {
      return pushAlerta('danger', 'La cantidad debe ser al menos 1.')
    }

    const enCarrito  = carrito.find(item => item.id === producto.id)?.cantidad || 0
    const disponible = producto.cantidad - enCarrito

    if (cantidad > disponible) {
      return pushAlerta(
        'danger',
        `No hay suficiente stock para ${producto.nombre}. Quedan ${disponible}.`
      )
    }

    setCarrito(prev => {
      const existe = prev.find(item => item.id === producto.id)
      if (existe) {
        return prev.map(item =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        )
      }
      return [...prev, { id: producto.id, nombre: producto.nombre, cantidad }]
    })
    pushAlerta('success', `${cantidad}× ${producto.nombre} añadido al carrito.`)
  }

  const handleEliminarCarrito = id => {
    setCarrito(prev => prev.filter(item => item.id !== id))
    pushAlerta('info', 'Producto eliminado del carrito.')
  }

  const handleRealizarPedido = () => {
    if (carrito.length === 0) {
      return pushAlerta('warning', 'El carrito está vacío.')
    }
    if (!window.confirm('¿Confirmas el pedido?')) return

    setIsSubmitting(true)

    const payload = {
      detalles: carrito.map(item => ({
        producto_id: item.id,
        cantidad:    item.cantidad
      }))
    }

    axios.post('/api/pedidos/', payload, { withCredentials: true })
      .then(({ data }) => {
        const num = data?.numero_pedido
        navigate('/staff-index', {
          state: {
            successMessage: num
              ? `Pedido ${num} creado correctamente.`
              : 'Pedido creado correctamente.'
          }
        })
      })
      .catch(err => {
        const msg =
          err.response?.data?.detalles?.[0] ||
          err.response?.data?.detail ||
          'Error al crear pedido.'
        pushAlerta('danger', msg)
      })
      .finally(() => setIsSubmitting(false))
  }

  if (loading) {
    return (
      <Base title="Hacer Pedido">
        <div className="container my-5 text-center"><p>Cargando…</p></div>
      </Base>
    )
  }

  return (
    <Base title="Hacer Pedido">
      <div className="container my-4">
        {alertas.map((a, i) => (
          <div
            key={i}
            className={`alert alert-${a.type} alert-dismissible fade show`}
            style={{
              backgroundColor: a.type === 'danger' ? '#8B0000' : '#A0522D',
              color: '#FFF'
            }}
          >
            {a.msg}
            <button
              className="btn-close btn-close-white"
              onClick={() => setAlertas(cur => cur.filter((_, idx) => idx !== i))}
            />
          </div>
        ))}

        <div className="row g-4">
          <div className="col-md-6">
            <div className="card shadow-sm rounded-2">
              <div className="card-header text-white" style={{ backgroundColor: '#8B4513' }}>
                Seleccionar Productos
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Categoría:</label>
                  <select
                    className="form-select"
                    value={selectedCat}
                    onChange={e => setSelectedCat(e.target.value)}
                    style={{ borderColor: '#8B4513' }}
                  >
                    <option value="Todos">Todas</option>
                    {categorias.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                <ul className="list-group">
                  {productos.map(p => (
                    <li
                      key={p.id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{p.nombre}</strong><br/>
                        <small style={{ color: '#5A2E1B' }}>Stock: {p.cantidad}</small>
                      </div>
                      <div className="d-flex align-items-center">
                        <input
                          type="number"
                          min="1"
                          max={p.cantidad}
                          defaultValue={1}
                          id={`cant-${p.id}`}
                          className="form-control form-control-sm me-2"
                          style={{ width: '60px', borderColor: '#8B4513' }}
                        />
                        <button
                          className="btn btn-sm text-white"
                          style={{ backgroundColor: '#8B4513' }}
                          onClick={() => {
                            const val = Number(document.getElementById(`cant-${p.id}`).value)
                            handleAgregarCarrito(p, val)
                          }}
                        >
                          Agregar
                        </button>
                      </div>
                    </li>
                  ))}
                  {productos.length === 0 && (
                    <li className="list-group-item text-center text-muted">
                      No hay productos en esta categoría.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card shadow-sm rounded-2">
              <div className="card-header text-white" style={{ backgroundColor: '#8B4513' }}>
                Carrito ({carrito.length})
              </div>
              <div className="card-body">
                <ul className="list-group">
                  {carrito.map(item => (
                    <li
                      key={item.id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      {item.nombre} × {item.cantidad}
                      <button
                        className="btn btn-sm text-white"
                        style={{ backgroundColor: '#8B0000' }}
                        onClick={() => handleEliminarCarrito(item.id)}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                  {carrito.length === 0 && (
                    <li className="list-group-item text-center text-muted">
                      Carrito vacío
                    </li>
                  )}
                </ul>
              </div>
              <div className="card-footer bg-white">
                <button
                  className="btn w-100 text-white fw-semibold"
                  style={{ backgroundColor: '#8B4513' }}
                  onClick={handleRealizarPedido}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando…' : 'Realizar Pedido'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Base>
  )
}
