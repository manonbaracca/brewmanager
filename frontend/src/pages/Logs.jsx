import React, { useEffect, useMemo, useState } from 'react'
import Base from '@/components/Base'
import api from '@/lib/api'

const ROLE_OPTIONS = [
  { value: '',          label: '— Todos —' },
  { value: 'admin',     label: 'Admin' },
  { value: 'logistica', label: 'Logística' },
  { value: 'cliente',   label: 'Cliente' },
]

export default function Logs() {
  const [logs, setLogs] = useState([])
  const [users, setUsers] = useState([])

  const [userFilter, setUserFilter]   = useState('')
  const [roleFilter, setRoleFilter]   = useState('') 
  const [fromDate, setFromDate]       = useState('')
  const [toDate, setToDate]           = useState('')
  const [q, setQ]                     = useState('') 
  const [qDebounced, setQDebounced]   = useState('')  
  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q.trim()), 350)
    return () => clearTimeout(t)
  }, [q])

  useEffect(() => {
    api.get('/api/staff/')
      .then(({ data }) => setUsers(Array.isArray(data) ? data : []))
      .catch(console.error)
  }, [])

  const resetFilters = () => {
    setUserFilter('')
    setRoleFilter('')
    setFromDate('')
    setToDate('')
    setQ('')
    setQDebounced('')
  }

  const fetchLogs = () => {
    const params = {}

    if (userFilter) params.user_id   = userFilter
    if (roleFilter) params.role      = roleFilter

    if (fromDate)  params.date_from  = fromDate
    if (toDate)    params.date_to    = toDate

    if (qDebounced) params.q = qDebounced

    api.get('/api/audit-logs/', { params })
      .then(({ data }) => setLogs(Array.isArray(data) ? data : []))
      .catch(console.error)
  }

  useEffect(fetchLogs, [userFilter, roleFilter, fromDate, toDate, qDebounced])

  const roleCounts = useMemo(() => {
    const acc = { admin:0, logistica:0, cliente:0 }
    users.forEach(u => {
      if (u.is_superuser) acc.admin++
      else if ((u.role||'').toLowerCase()==='logistica') acc.logistica++
      else acc.cliente++
    })
    return acc
  }, [users])

  return (
    <Base title="Logs de Auditoría">
      <div className="container my-4">

        <div className="card shadow-sm mb-3">
          <div className="card-body">
            <div className="row g-3 align-items-end">

              <div className="col-md-3">
                <label className="form-label">Usuario</label>
                <select
                  className="form-select"
                  value={userFilter}
                  onChange={e => setUserFilter(e.target.value)}
                >
                  <option value="">— Todos —</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.username}{u.is_superuser ? ' (admin)' : (u.role ? ` (${u.role})` : '')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">Rol</label>
                <select
                  className="form-select"
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                >
                  {ROLE_OPTIONS.map(r => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                      {r.value && roleCounts[r.value] ? ` (${roleCounts[r.value]})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label">Desde</label>
                <input
                  type="date"
                  className="form-control"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                />
              </div>

              <div className="col-md-2">
                <label className="form-label">Hasta</label>
                <input
                  type="date"
                  className="form-control"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                />
              </div>

              <div className="col-md-2">
                <label className="form-label">Buscar (usuario)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="ej: juan"
                  value={q}
                  onChange={e => setQ(e.target.value)}
                />
              </div>

              <div className="col-12 d-flex justify-content-end">
                <button className="btn btn-outline-secondary" onClick={resetFilters}>
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead className="table-light">
              <tr>
                <th style={{whiteSpace:'nowrap'}}>Fecha</th>
                <th>Usuario</th>
                <th>Acción</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan="4" className="text-center text-muted py-4">
                  No hay registros con los filtros aplicados.
                </td></tr>
              ) : logs.map(log => (
                <tr key={log.id}>
                  <td style={{whiteSpace:'nowrap'}}>
                    {new Date(log.timestamp).toLocaleString('es-ES')}
                  </td>
                  <td>{log.user || '—'}</td>
                  <td>{log.action}</td>
                  <td>{log.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </Base>
  )
}
