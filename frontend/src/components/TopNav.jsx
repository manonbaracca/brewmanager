import React from 'react';
import { Link } from 'react-router-dom';

export default function TopNav({
  productosSinStock = [],
  trabajadoresCount = 0,
  productCount = 0,
  pedidosCount = 0,
}) {
  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-4">
          <div className="card shadow">
            <div className="card-header text-white" style={{ backgroundColor: '#8B4513' }}>
              Pinboard
            </div>
            <div className="card-body text-center" style={{ backgroundColor: '#FAF0E6' }}>
              <h5 className="my-3" style={{ color: '#5A2E1B' }}>Información</h5>
              {productosSinStock.length > 0 ? (
                <div className="alert" style={{ backgroundColor: '#DEB887', color: '#5A2E1B', border: 'none' }}>
                  <p><strong>Atención:</strong> Los siguientes productos están sin stock:</p>
                  <ul className="list-unstyled" style={{ color: '#5A2E1B' }}>
                    {productosSinStock.map(p => (
                      <li key={p.id}>{p.nombre}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p style={{ color: '#5A2E1B' }}>No hay productos sin stock.</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header text-white" style={{ backgroundColor: '#8B4513' }}>
              Estadísticas
            </div>
            <div className="card-body" style={{ backgroundColor: '#FAF0E6' }}>
              <div className="row">
                {[{
                  label: 'Usuarios',
                  count: trabajadoresCount,
                  icon: 'fas fa-users',
                  link: '/staff'
                },{
                  label: 'Productos',
                  count: productCount,
                  icon: 'fas fa-box',
                  link: '/producto'
                },{
                  label: 'Pedidos',
                  count: pedidosCount,
                  icon: 'fas fa-shipping-fast',
                  link: '/pedidos'
                }].map(stat => (
                  <div className="col-md-4" key={stat.label}>
                    <Link to={stat.link} className="text-decoration-none">
                      <div
                        className="card shadow-sm text-center p-4"
                        style={{
                          backgroundColor: '#F5DEB3',
                          transition: 'transform 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <h5 style={{ color: '#5A2E1B' }}>
                          {stat.label} <i className={stat.icon}></i>
                        </h5>
                        <h3 style={{ color: '#5A2E1B' }}>{stat.count}</h3>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
