import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import ReservaList from './components/ReservaList';
import ReservaForm from './components/ReservaForm';
import OrdenForm from './components/OrdenForm';
import OrdenList from './components/OrdenList';
import OrdenDetail from './components/OrdenDetail';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './components/AdminDashboard';
import AdminMesas from './components/AdminMesas';
import AdminReservas from './components/AdminReservas';
import AdminOrdenes from './components/AdminOrdenes';
import AdminHorarios from './components/AdminHorarios';
import AdminMenu from './components/AdminMenu';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={
            <>
              <Navbar />
              <Login />
            </>
          } />
          
          {/* Rutas de usuario */}
          <Route path="/" element={
            <>
              <Navbar />
              <Home />
            </>
          } />
          <Route path="/reservas" element={
            <>
              <Navbar />
              <ReservaList />
            </>
          } />
          <Route path="/reservas/nueva" element={
            <>
              <Navbar />
              <ReservaForm />
            </>
          } />
          <Route path="/reservas/:id/editar" element={
            <>
              <Navbar />
              <ReservaForm />
            </>
          } />
          <Route path="/ordenes" element={
            <>
              <Navbar />
              <OrdenList />
            </>
          } />
          <Route path="/ordenes/nueva" element={
            <>
              <Navbar />
              <OrdenForm />
            </>
          } />
          <Route path="/ordenes/:id" element={
            <>
              <Navbar />
              <OrdenDetail />
            </>
          } />

          {/* Rutas de admin (protegidas) */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/mesas" element={
            <ProtectedRoute>
              <AdminMesas />
            </ProtectedRoute>
          } />
          <Route path="/admin/reservas" element={
            <ProtectedRoute>
              <AdminReservas />
            </ProtectedRoute>
          } />
          <Route path="/admin/ordenes" element={
            <ProtectedRoute>
              <AdminOrdenes />
            </ProtectedRoute>
          } />
          <Route path="/admin/horarios" element={
            <ProtectedRoute>
              <AdminHorarios />
            </ProtectedRoute>
          } />
          <Route path="/admin/menu" element={
            <ProtectedRoute>
              <AdminMenu />
            </ProtectedRoute>
          } />

          {/* Redirección de rutas no encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
