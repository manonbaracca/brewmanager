// src/pages/Dashboard.jsx
import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'

function Dashboard({ productos, productosLabels, productosCantidades }) {
  const pedidosChartRef = useRef(null)
  const stockChartRef = useRef(null)

  useEffect(() => {
    const ctx1 = pedidosChartRef.current.getContext('2d')
    new Chart(ctx1, {
      type: 'pie',
      data: {
        labels: productosLabels,
        datasets: [{
          label: 'Pedidos',
          data: productosCantidades,
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)'
          ],
          borderColor: 'rgba(255, 255, 255, 1)',
          borderWidth: 2
        }]
      },
      options: {
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#333'
            }
          }
        }
      }
    })

    const ctx2 = stockChartRef.current.getContext('2d')
    new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: productos.map(p => p.nombre),
        datasets: [{
          label: 'Stock',
          data: productos.map(p => p.cantidad),
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)'
          ],
          borderColor: 'rgba(255, 255, 255, 1)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#333'
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(200, 200, 200, 0.2)'
            },
            ticks: {
              color: '#333'
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(200, 200, 200, 0.2)'
            },
            ticks: {
              color: '#333'
            }
          }
        }
      }
    })
  }, [productos, productosLabels, productosCantidades])

  return (
    <div className="dashboard-container" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
      <div>
        <h2 style={{ textAlign: 'center', color: '#5A2E1B' }}>Pedidos por Producto</h2>
        <canvas ref={pedidosChartRef} width="400" height="300"></canvas>
      </div>
      <div>
        <h2 style={{ textAlign: 'center', color: '#5A2E1B' }}>Stock de Productos</h2>
        <canvas ref={stockChartRef} width="400" height="300"></canvas>
      </div>
    </div>
  )
}

export default Dashboard

