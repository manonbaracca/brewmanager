import React, { useEffect, useState, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import Base from '@/components/Base'
import TopNav from '@/components/TopNav'
import api from '@/lib/api'
Chart.register(...registerables)

export default function Dashboard() {
  const [productosSinStock, setProductosSinStock] = useState([])
  const [stats, setStats] = useState({ trabajadoresCount: 0, productCount: 0, pedidosCount: 0 })

  const pieRef = useRef(null)
  const barRef = useRef(null)
  const pieChart = useRef(null)
  const barChart = useRef(null)

  const themeColors = ['#8B4513', '#5A2E1B', '#C47A47', '#A0522D', '#D2691E', '#8B0000']
  const alpha = '80'
  const generateColors = n =>
    Array.from({ length: n }, (_, i) => themeColors[i % themeColors.length] + alpha)

  useEffect(() => {
    Promise.all([
      api.get('/api/staff/'),
      api.get('/api/productos/'),
      api.get('/api/pedidos/'),
    ])
      .then(([staffRes, prodRes, pedRes]) => {
        const staff = Array.isArray(staffRes.data) ? staffRes.data : []
        const nonAdminCount = staff.filter(
          u => String(u.role || '').toLowerCase() !== 'admin' &&
               String(u.username || '').toLowerCase() !== 'admin'
        ).length  
        const productos = prodRes.data || []
        const pedidos = pedRes.data || []

        setStats({
          trabajadoresCount: nonAdminCount,
          productCount: productos.length,
          pedidosCount: pedidos.length,
        })
        setProductosSinStock(productos.filter(p => p.cantidad === 0))

        const barLabels = productos.map(p => p.nombre)
        const barData = productos.map(p => p.cantidad)
        if (barChart.current) barChart.current.destroy()
        barChart.current = new Chart(barRef.current, {
          type: 'bar',
          data: {
            labels: barLabels,
            datasets: [{
              label: 'Stock',
              data: barData,
              backgroundColor: generateColors(barLabels.length),
              borderRadius: 8,
              borderSkipped: false,
            }]
          },
          options: {
            animation: { duration: 800, easing: 'easeOutQuart' },
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { display: false }, ticks: { color: '#5A2E1B', font: { weight: 'bold' } } },
              y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#5A2E1B' } }
            }
          }
        })

        const acc = {}
        pedidos.forEach(p =>
          p.detalles.forEach(d => {
            const name = d.producto?.nombre || '—'
            acc[name] = (acc[name] || 0) + d.cantidad
          })
        )
        const pieLabels = Object.keys(acc)
        const pieData = Object.values(acc)
        if (pieChart.current) pieChart.current.destroy()
        pieChart.current = new Chart(pieRef.current, {
          type: 'pie',
          data: {
            labels: pieLabels,
            datasets: [{ data: pieData, backgroundColor: generateColors(pieLabels.length), hoverOffset: 8 }]
          },
          options: {
            animation: { duration: 700 },
            plugins: {
              legend: { position: 'right', labels: { color: '#5A2E1B', boxWidth: 12, padding: 16 } }
            }
          }
        })
      })
      .catch(console.error)
  }, [])

  return (
    <Base title="Dashboard">
      <TopNav
        productosSinStock={productosSinStock}
        trabajadoresCount={stats.trabajadoresCount}
        productCount={stats.productCount}
        pedidosCount={stats.pedidosCount}
      />

      <div className="container my-5">
        <div className="row gy-4">
          <div className="col-md-6">
            <div className="card shadow-sm">
              <div className="card-header text-white text-center" style={{ backgroundColor: themeColors[0] }}>
                Pedidos por Producto
              </div>
              <div className="card-body">
                <canvas ref={pieRef} />
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card shadow-sm">
              <div className="card-header text-white text-center" style={{ backgroundColor: themeColors[1] }}>
                Stock de Productos
              </div>
              <div className="card-body">
                <canvas ref={barRef} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Base>
  )
}
