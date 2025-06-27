import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Base from '@/components/Base';

export default function Logs() {
  const [logs, setLogs]           = useState([]);
  const [users, setUsers]         = useState([]);
  const [userFilter, setUserFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    axios.get('/api/staff/', { withCredentials: true })
      .then(res => setUsers(res.data))
      .catch(console.error);
  }, []);

  const fetchLogs = () => {
    const params = {};
    if (userFilter) params.user_id = userFilter;
    if (dateFilter) params.date    = dateFilter;
    axios.get('/api/audit-logs/', { params, withCredentials: true })
      .then(res => setLogs(res.data))
      .catch(console.error);
  };

  useEffect(fetchLogs, [userFilter, dateFilter]);

  return (
    <Base title="Logs de Auditoría">
      <div className="container my-4">
        <div className="row mb-3">
          <div className="col-md-4">
            <label>Usuario:</label>
            <select
              className="form-select"
              value={userFilter}
              onChange={e => setUserFilter(e.target.value)}
            >
              <option value="">— Todos —</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.username}{u.is_superuser && ' (admin)'}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label>Fecha:</label>
            <input
              type="date"
              className="form-control"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
            />
          </div>
        </div>

        <table className="table table-striped">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Usuario</th>
              <th>Acción</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td>{new Date(log.timestamp).toLocaleString('es-ES')}</td>
                <td>{log.user || '—'}</td>
                <td>{log.action}</td>
                <td>{log.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Base>
  );
}
