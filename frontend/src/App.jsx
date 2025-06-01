
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import ProfileUpdate from './pages/ProfileUpdate'
import Logout from './pages/Logout'
import Ajustes from './pages/Ajustes'
import AjustesCategorias from './pages/AjustesCategorias'
import Staff from './pages/Staff'
import StaffDetail from './pages/StaffDetail'
import StaffDelete from './pages/StaffDelete'
import Orders        from './pages/Orders'
import OrderDetail   from './pages/OrderDetail'
import OrderDelete   from './pages/OrderDelete'
import Products from './pages/Products'
import ProductUpdate from './pages/ProductUpdate'
import ProductDelete from './pages/ProductDelete'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/update" element={<ProfileUpdate />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/ajustes" element={<Ajustes />} />
        <Route path="/ajustes/categorias" element={<AjustesCategorias />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/staff/:id" element={<StaffDetail />} />
        <Route path="/staff/delete/:id" element={<StaffDelete />} />
        <Route path="/pedidos"               element={<Orders />} />
        <Route path="/pedidos/:id"           element={<OrderDetail />} />
        <Route path="/pedidos/delete/:id"    element={<OrderDelete />} />
        <Route path="/producto" element={<Products />} />
        <Route path="/producto/update/:id" element={<ProductUpdate />} />
        <Route path="/producto/delete/:id" element={<ProductDelete />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App

