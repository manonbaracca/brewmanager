import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Chart, registerables } from 'chart.js'
import Base from '@/components/Base'
import TopNav from '@/components/TopNav'
import api from '@/lib/api'
Chart.register(...registerables)

export default function Dashboard() {
  const [productosSinStock, setProductosSinStock] = useState([])
  const [stats, setStats] = useState({ trabajadoresCount: 0, productCount: 0, pedidosCount: 0 })

  const [productos, setProductos] = useState([])
  const [pedidos, setPedidos] = useState([])

  const [fromDate, setFromDate] = useState('') 
  const [toDate, setToDate] = useState('')  

  const pieRef = useRef(null)
  const barRef = useRef(null)
  const pieChart = useRef(null)
  const barChart = useRef(null)

  const themeColors = ['#8B4513', '#5A2E1B', '#C47A47', '#A0522D', '#D2691E', '#8B0000']
  const alpha = '80'
  const generateColors = n => Array.from({ length: n }, (_, i) => themeColors[i % themeColors.length] + alpha)

  const toLocalYMD = (dateLike) => {
    const d = new Date(dateLike)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}` 
  }
  
  const inRange = (iso) => {
    const day = toLocalYMD(iso)
    if (fromDate && day < fromDate) return false
    if (toDate && day > toDate) return false
    return true
  }
  

  useEffect(() => {
    Promise.all([api.get('/api/staff/'), api.get('/api/productos/'), api.get('/api/pedidos/')])
      .then(([staffRes, prodRes, pedRes]) => {
        const staff = Array.isArray(staffRes.data) ? staffRes.data : []
        const nonAdminCount = staff.filter(
          u => String(u.role || '').toLowerCase() !== 'admin' &&
               String(u.username || '').toLowerCase() !== 'admin'
        ).length

        const _productos = Array.isArray(prodRes.data) ? prodRes.data : []
        const _pedidos = Array.isArray(pedRes.data) ? pedRes.data : []

        setProductos(_productos)
        setPedidos(_pedidos)

        setStats({
          trabajadoresCount: nonAdminCount,
          productCount: _productos.length,
          pedidosCount: _pedidos.length,
        })
        setProductosSinStock(_productos.filter(p => p.cantidad === 0))
      })
      .catch(console.error)
  }, [])

  const pedidosFiltrados = useMemo(
    () => pedidos.filter(p => inRange(p.fecha)),
    [pedidos, fromDate, toDate]
  )

  useEffect(() => {
    const acc = {}
    pedidosFiltrados.forEach(p =>
      p.detalles?.forEach(d => {
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
        plugins: { legend: { position: 'right', labels: { color: '#5A2E1B', boxWidth: 12, padding: 16 } } }
      }
    })

    const countByDay = {}
    pedidosFiltrados.forEach(p => {
      const key = toLocalYMD(p.fecha)
      countByDay[key] = (countByDay[key] || 0) + 1
    })
    const barLabels = Object.keys(countByDay).sort()
    const barData = barLabels.map(k => countByDay[k])

    if (barChart.current) barChart.current.destroy()
    barChart.current = new Chart(barRef.current, {
      type: 'bar',
      data: {
        labels: barLabels,
        datasets: [{
          label: 'Pedidos',
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
  }, [pedidosFiltrados])

  return (
    <Base title="Dashboard">
      <TopNav
        productosSinStock={productosSinStock}
        trabajadoresCount={stats.trabajadoresCount}
        productCount={stats.productCount}
        pedidosCount={stats.pedidosCount}
      />

      <div className="container my-5">
        <div className="card shadow-sm mb-4">
          <div className="card-body d-flex flex-wrap align-items-center gap-3">
            <div>
              <label className="form-label mb-1">Desde</label>
              <input
                type="date"
                className="form-control"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label mb-1">Hasta</label>
              <input
                type="date"
                className="form-control"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
              />
            </div>
            {(fromDate || toDate) && (
              <button
                className="btn btn-outline-secondary ms-auto"
                onClick={() => { setFromDate(''); setToDate('') }}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

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
                Pedidos por Día
              </div>
              <div className="card-body">
                <canvas ref={barRef} />
                <small className="text-muted d-block mt-2">
                  *Filtrado por el rango de fechas seleccionado.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Base>
  )
}
