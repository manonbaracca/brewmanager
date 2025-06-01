import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import Base from '@/components/Base'

export default function AjustesCategorias() {
  const [categorias, setCategorias] = useState([])
  const [nuevaCat, setNuevaCat]   = useState('')
  const [alerts, setAlerts]       = useState([])
  const navigate                  = useNavigate()

  useEffect(() => {
    fetchCategorias()
  }, [])

  const fetchCategorias = async () => {
    try {
      const { data } = await axios.get('/api/categorias/', { withCredentials: true })
      setCategorias(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleGuardar = async (id, nombre) => {
    try {
      await axios.put(
        `/api/categorias/${id}/`,
        JSON.stringify({ nombre: nombre.trim() }),
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      )
      setAlerts(cur => [
        ...cur,
        { type: 'success', msg: 'Categoría actualizada correctamente.' }
      ])
      fetchCategorias()
    } catch {
      setAlerts(cur => [
        ...cur,
        { type: 'danger', msg: 'No se pudo actualizar la categoría.' }
      ])
    }
  }

  const handleEliminar = async id => {
    try {
      await axios.delete(`/api/categorias/${id}/`, { withCredentials: true })
      setCategorias(cats => cats.filter(c => c.id !== id))
      setAlerts(cur => [
        ...cur,
        { type: 'success', msg: 'Categoría eliminada correctamente.' }
      ])
    } catch {
      setAlerts(cur => [
        ...cur,
        { type: 'danger', msg: 'No se pudo eliminar la categoría.' }
      ])
    }
  }

  const handleAgregar = async e => {
    e.preventDefault()
    setAlerts([])
    try {
      await axios.post(
        '/api/categorias/',
        JSON.stringify({ nombre: nuevaCat.trim() }),
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      )
      setAlerts([{ type: 'success', msg: 'Categoría agregada correctamente.' }])
      setNuevaCat('')
      fetchCategorias()
    } catch (err) {
      const isDup = err.response?.status === 400
      setAlerts([{ 
        type: 'danger',
        msg: isDup
          ? 'La categoría ya existe.'
          : 'Error al agregar la categoría.'
      }])
    }
  }

  return (
    <Base title="Gestión de Categorías">
      <div className="container my-5">
        {alerts.map((a, i) => (
          <div
            key={i}
            className={`alert alert-${a.type} alert-dismissible fade show shadow-sm`}
            style={{
              backgroundColor: '#F5DEB3',
              borderColor:     '#8B4513',
              color:           '#5A2E1B',
            }}
            role="alert"
          >
            {a.msg}
            <button
              type="button"
              className="btn-close"
              onClick={() => setAlerts(cur => cur.filter((_, idx) => idx !== i))}
            />
          </div>
        ))}

        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow">
              <div
                className="card-header text-center text-white"
                style={{ backgroundColor: '#8B4513' }}
              >
                Gestión de Categorías
              </div>
              <div className="card-body">
                <h5 className="text-center mb-4">Categorías Existentes</h5>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Categoría</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorias.map(cat => (
                      <tr key={cat.id}>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            defaultValue={cat.nombre}
                            onBlur={e => handleGuardar(cat.id, e.target.value)}
                          />
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm"
                            style={{
                              backgroundColor: '#D4A373',
                              color:           '#FFF',
                              marginRight:     '0.5rem'
                            }}
                            onClick={() => {
                              const input = document.querySelector(
                                `input[value="${cat.nombre}"]`
                              )
                              handleGuardar(cat.id, input.value)
                            }}
                          >
                            Guardar
                          </button>
                          <button
                            className="btn btn-sm"
                            style={{
                              backgroundColor: '#A73E1C',
                              color:           '#FFF'
                            }}
                            onClick={() => handleEliminar(cat.id)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <hr className="my-4" />

                <h5 className="text-center mb-4">Agregar Nueva Categoría</h5>
                <form onSubmit={handleAgregar}>
                  <div className="mb-3">
                    <label htmlFor="nuevaCat" className="form-label">
                      Nueva Categoría:
                    </label>
                    <input
                      id="nuevaCat"
                      className="form-control"
                      value={nuevaCat}
                      onChange={e => setNuevaCat(e.target.value)}
                      placeholder="Escribe una nueva categoría"
                      required
                    />
                  </div>
                  <div className="text-center">
                    <button
                      type="submit"
                      className="btn"
                      style={{
                        backgroundColor: '#8B4513',
                        color:           '#FFF',
                        marginRight:     '1rem'
                      }}
                    >
                      Agregar
                    </button>
                    <Link
                      to="/ajustes"
                      className="btn"
                      style={{
                        backgroundColor: '#A73E1C',
                        color:           '#FFF'
                      }}
                    >
                      Volver
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Base>
  )
}
