import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';

interface Estadistica {
  label: string;
  valor: number;
  icono: string;
  color: string;
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Estadistica[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const [mesas, reservas, ordenes, menu] = await Promise.all([
        apiClient.getMesas(),
        apiClient.getReservas(),
        apiClient.getOrdenes(),
        apiClient.getMenu(),
      ]);

      const mesasArr = mesas.data?.results || mesas.data || [];
      const reservasArr = reservas.data?.results || reservas.data || [];
      const ordenesArr = ordenes.data?.results || ordenes.data || [];
      const menuArr = menu.data?.results || menu.data || [];

      setStats([
        {
          label: 'Mesas',
          valor: Array.isArray(mesasArr) ? mesasArr.length : 0,
          icono: '🪑',
          color: 'bg-blue-100 text-blue-800',
        },
        {
          label: 'Reservas',
          valor: Array.isArray(reservasArr) ? reservasArr.length : 0,
          icono: '📅',
          color: 'bg-green-100 text-green-800',
        },
        {
          label: 'Órdenes',
          valor: Array.isArray(ordenesArr) ? ordenesArr.length : 0,
          icono: '🍽️',
          color: 'bg-yellow-100 text-yellow-800',
        },
        {
          label: 'Items en Menú',
          valor: Array.isArray(menuArr) ? menuArr.length : 0,
          icono: '📋',
          color: 'bg-purple-100 text-purple-800',
        },
      ]);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🔓 Cerrando sesión...');
      await apiClient.logout();
      console.log('✅ Sesión cerrada');
      navigate('/login');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar Admin */}
      <nav className="bg-blue-600 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            <h1 className="text-2xl font-bold">Panel Admin</h1>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold transition"
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* Contenido */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h2>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Estadísticas */}
        {loading ? (
          <div className="text-center py-16">
            <p className="text-gray-600">Cargando estadísticas...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`${stat.color} rounded-lg shadow-lg p-6 text-center transform hover:scale-105 transition`}
              >
                <div className="text-4xl mb-2">{stat.icono}</div>
                <div className="text-3xl font-bold">{stat.valor}</div>
                <div className="text-sm mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Menú de Administración */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Gestión del Restaurante</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/admin/mesas"
              className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-lg font-semibold transition transform hover:scale-105"
            >
              <div className="text-3xl mb-2">🪑</div>
              <div>Gestión de Mesas</div>
            </Link>
            <Link
              to="/admin/reservas"
              className="bg-green-500 hover:bg-green-600 text-white p-6 rounded-lg font-semibold transition transform hover:scale-105"
            >
              <div className="text-3xl mb-2">📅</div>
              <div>Gestión de Reservas</div>
            </Link>
            <Link
              to="/admin/ordenes"
              className="bg-yellow-500 hover:bg-yellow-600 text-white p-6 rounded-lg font-semibold transition transform hover:scale-105"
            >
              <div className="text-3xl mb-2">🍽️</div>
              <div>Gestión de Órdenes</div>
            </Link>
            <Link
              to="/admin/menu"
              className="bg-purple-500 hover:bg-purple-600 text-white p-6 rounded-lg font-semibold transition transform hover:scale-105"
            >
              <div className="text-3xl mb-2">📋</div>
              <div>Gestión del Menú</div>
            </Link>
            <Link
              to="/admin/horarios"
              className="bg-indigo-500 hover:bg-indigo-600 text-white p-6 rounded-lg font-semibold transition transform hover:scale-105"
            >
              <div className="text-3xl mb-2">🕐</div>
              <div>Horarios del Restaurante</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
