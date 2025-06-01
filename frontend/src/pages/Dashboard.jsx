import React, { useEffect, useState } from 'react'
import axios from 'axios'
import TopNav from '@/components/TopNav'

export default function Dashboard() {
  const [productosSinStock, setProductosSinStock] = useState([])
  const [stats, setStats] = useState({
    trabajadoresCount: 0,
    productCount: 0,
    pedidosCount: 0
  })

  useEffect(() => {
    axios.get('/api/productos/?cantidad=0')
      .then(res => setProductosSinStock(res.data))
      .catch(console.error)

    Promise.all([
      axios.get('/api/usuarios/count/'),   // crea estos endpoints en DRF
      axios.get('/api/productos/count/'),
      axios.get('/api/pedidos/count/')
    ]).then(([r1, r2, r3]) => {
      setStats({
        trabajadoresCount: r1.data.count,
        productCount:      r2.data.count,
        pedidosCount:      r3.data.count
      })
    }).catch(console.error)
  }, [])

  return (
    <div>
      <TopNav
        productosSinStock={productosSinStock}
        trabajadoresCount={stats.trabajadoresCount}
        productCount={stats.productCount}
        pedidosCount={stats.pedidosCount}
      />
      {/* resto del Dashboard */}
    </div>
  )
}
