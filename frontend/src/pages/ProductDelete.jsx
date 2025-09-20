import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Base from '@/components/Base'
import TopNav from '@/components/TopNav'
import api, { initCsrf } from '@/lib/api'

export default function ProductDelete() {
  const { id } = useParams()
  const nav = useNavigate()
  const [item, setItem] = useState(null)
  const [sinStock, setSinStock] = useState([])
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const [pRes, sRes] = await Promise.all([
          api.get(`/api/productos/${id}/`),
          api.get('/api/productos/?cantidad=0')
        ])
        if (!alive) return
        setItem(pRes.data)
        setSinStock(sRes.data)
      } catch {
        if (alive) setAlert({ type:'danger', msg:'Error al cargar.' })
      }
    })()
    return () => { alive = false }
  }, [id])

  const handleDelete = async () => {
    try {
      await initCsrf()
      await api.delete(`/api/productos/${id}/`)
      nav('/producto', { state: { successMessage: 'Producto eliminado exitosamente.' } })
    } catch {
      setAlert({ type:'danger', msg:'Error al eliminar.' })
    }
  }

  if (!item) {
    return (
      <Base title="Borrar Producto">
        <div className="container my-5"><p>Cargando…</p></div>
      </Base>
    )
  }

  return (
    <Base title="Borrar Producto">
      <TopNav productosSinStock={sinStock} trabajadoresCount={0} productCount={0} pedidosCount={0} />
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
              <div className="card-header text-center text-white" style={{ backgroundColor:'#5A2E1B' }}>
                Confirmar Eliminación
              </div>
              <div className="card-body" style={{ backgroundColor:'#F5DEB3' }}>
                <div className="alert alert-danger text-center mb-4" style={{ backgroundColor:'#FADBD8', borderColor:'#C0392B' }}>
                  <h5 className="mb-0">
                    <i className="fas fa-exclamation-triangle"></i>
                    &nbsp;¿Eliminar <strong>{item.nombre}</strong>?
                    <br/><small className="text-muted">Esta acción no se puede deshacer.</small>
                  </h5>
                </div>
                <div className="d-flex justify-content-between">
                  <button className="btn" onClick={() => nav('/producto')} style={{ backgroundColor:'#FAF0E6', color:'#5A2E1B', border:'1px solid #5A2E1B' }}>
                    Cancelar
                  </button>
                  <button className="btn text-white" onClick={handleDelete} style={{ backgroundColor:'#8B4513' }}>
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Base>
  )
}
