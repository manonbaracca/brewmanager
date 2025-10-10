import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Base from '@/components/Base'
import api, { initCsrf } from '@/lib/api'
import ConfirmDialog from '@/components/ConfirmDialog'

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

  const [confirmOpen, setConfirmOpen]     = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/api/categorias/'),
      api.get('/api/productos/'),
    ])
      .then(([catRes, prodRes]) => {
        const cats  = Array.isArray(catRes.data) ? catRes.data : []
        const prods = Array.isArray(prodRes.data) ? prodRes.data : []
        setCategorias(cats)
        setAllProducts(prods)
        setProductos(prods)
      })
      .catch(() => pushAlerta('danger', 'Error al cargar datos iniciales.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (selectedCat === 'Todos') {
      setProductos(allProducts)
    } else {
      setProductos(allProducts.filter(p => String(p.categoria.id) === String(selectedCat)))
    }
  }, [selectedCat, allProducts])

  const pastel = {
    success: { background:'#d4edda', borderColor:'#c3e6cb', color:'#155724' },
    danger:  { background:'#f8d7da', borderColor:'#f5c6cb', color:'#721c24' },
    warning: { background:'#fff3cd', borderColor:'#ffeeba', color:'#856404' },
    info:    { background:'#d1ecf1', borderColor:'#bee5eb', color:'#0c5460' },
  }
  const pushAlerta = (type, msg, timeout=2500) => {
    const id = Math.random().toString(36).slice(2)
    setAlertas(a => [...a, { id, type, msg }])
    if (timeout) {
      setTimeout(() => {
        setAlertas(a => a.filter(x => x.id !== id))
      }, timeout)
    }
  }

  const handleAgregarCarrito = (producto, cantidad) => {
    if (cantidad < 1) return pushAlerta('danger', 'La cantidad debe ser al menos 1.')

    const enCarrito  = carrito.find(item => item.id === producto.id)?.cantidad || 0
    const disponible = producto.cantidad - enCarrito
    if (cantidad > disponible) {
      return pushAlerta('danger', `No hay suficiente stock para ${producto.nombre}. Quedan ${disponible}.`, 3500)
    }

    setCarrito(prev => {
      const existe = prev.find(item => item.id === producto.id)
      if (existe) {
        return prev.map(item =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + cantidad } : item
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
    if (carrito.length === 0) return pushAlerta('warning', 'El carrito está vacío.')
    setConfirmOpen(true)
  }

  const confirmarPedido = async () => {
    setConfirmOpen(false)
    setIsSubmitting(true)
    const payload = {
      detalles: carrito.map(item => ({ producto_id: item.id, cantidad: item.cantidad }))
    }
    try {
      await initCsrf() 
      const { data } = await api.post('/api/pedidos/', payload)
      const num = data?.numero_pedido
      navigate('/staff-index', {
        state: { successMessage: num ? `Pedido ${num} creado correctamente.` : 'Pedido creado correctamente.' }
      })
    } catch (err) {
      const msg =
        err.response?.data?.detalles?.[0] ||
        err.response?.data?.detail ||
        'Error al crear pedido.'
      pushAlerta('danger', msg, 4000)
    } finally {
      setIsSubmitting(false)
    }
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
        {alertas.map(a => (
          <div
            key={a.id}
            className="alert alert-dismissible fade show"
            style={{ ...pastel[a.type || 'info'], border:'1px solid', borderRadius:8 }}
          >
            {a.msg}
            <button
              className="btn-close"
              onClick={() => setAlertas(cur => cur.filter(x => x.id !== a.id))}
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
                    <li key={p.id} className="list-group-item d-flex justify-content-between align-items-center">
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
                          style={{ width: '64px', borderColor: '#8B4513' }}
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
                    <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
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
                    <li className="list-group-item text-center text-muted">Carrito vacío</li>
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

      <ConfirmDialog
        open={confirmOpen}
        title="Confirmar Pedido"
        message="¿Deseás confirmar y enviar el pedido?"
        confirmText="Sí, confirmar"
        cancelText="Cancelar"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmarPedido}
      />
    </Base>
  )
}
