import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/api';
import ConfirmModal from './ConfirmModal';

interface Reserva {
  id: number;
  nombre_cliente: string;
  telefono: string;
  fecha: string;
  hora: string;
  mesa: number;
  mesa_numero: number;
  mesa_ubicacion: string;
  estado: string;
  creada_en: string;
}

function ReservaList() {
  console.log('🔵 ReservaList montado');
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [reservaToDelete, setReservaToDelete] = useState<number | null>(null);

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const token = apiClient.getToken();
    setIsAuthenticated(!!token);
    
    if (token) {
      console.log('🟡 useEffect ejecutándose en ReservaList');
      fetchReservas();
    } else {
      // Si es guest, intenta cargar la reserva que acaba de crear
      const guestReservaId = sessionStorage.getItem('guestReservaId');
      if (guestReservaId) {
        fetchGuestReserva(Number.parseInt(guestReservaId));
      }
    }
  }, []);

  const fetchReservas = async () => {
    console.log('🟢 Iniciando fetchReservas');
    setLoading(true);
    setError(null);
    try {
      console.log('📡 Llamando a apiClient.getReservas()');
      const response = await apiClient.getReservas();
      console.log('📥 Respuesta API:', response);
      if (response.success && response.data) {
        const results = response.data.results || response.data;
        setReservas(Array.isArray(results) ? results : []);
        console.log('✅ Reservas cargadas:', results);
      } else {
        setError(response.error || 'Error al cargar reservas');
        console.warn('⚠️ Error en respuesta:', response.error);
      }
    } catch (err) {
      const errorMsg = (err as Error).message || 'Error desconocido';
      setError(errorMsg);
      console.error('❌ Error en fetchReservas:', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchGuestReserva = async (reservaId: number) => {
    console.log('🟢 Cargando reserva guest:', reservaId);
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getReserva(reservaId);
      if (response.success && response.data) {
        setReservas([response.data]);
        console.log('✅ Reserva guest cargada');
      } else {
        console.warn('⚠️ No se pudo cargar la reserva:', response.error);
        setReservas([]);
      }
    } catch (err) {
      console.warn('⚠️ Error cargando reserva guest:', err);
      setReservas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    setReservaToDelete(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!reservaToDelete) return;
    try {
      const response = await apiClient.deleteReserva(reservaToDelete);
      if (response.success) {
        setReservas(reservas.filter(r => r.id !== reservaToDelete));
        setShowConfirm(false);
        setReservaToDelete(null);
      } else {
        setError(response.error || 'Error al eliminar');
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const renderReservasContent = () => {
    if (loading) {
      return (
        <div className="text-center py-16">
          <p className="text-gray-600 text-lg">Cargando reservas...</p>
        </div>
      );
    }

    if (reservas.length === 0) {
      return (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg mb-6">No tienes reservas aún</p>
          <Link
            to="/reservas/nueva"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Crear tu primera reserva
          </Link>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Cliente</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Teléfono</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Fecha</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Hora</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Mesa</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((reserva, index) => (
              <tr key={reserva.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200 hover:bg-blue-50 transition`}>
                <td className="px-6 py-4 text-gray-900 font-medium">{reserva.nombre_cliente}</td>
                <td className="px-6 py-4 text-gray-600">{reserva.telefono}</td>
                <td className="px-6 py-4 text-gray-600">{reserva.fecha}</td>
                <td className="px-6 py-4 text-gray-600">{reserva.hora}</td>
                <td className="px-6 py-4 text-gray-600">Mesa {reserva.mesa_numero}</td>
                <td className="px-6 py-4 text-center">
                  <Link
                    to={`/reservas/${reserva.id}/editar`}
                    className="text-blue-600 hover:text-blue-800 font-medium mr-4"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(reserva.id)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Si no está autenticado, mostrar solo la reserva que acaba de crear
  if (!isAuthenticated) {
    const guestReservaId = sessionStorage.getItem('guestReservaId');
    
    // Si tiene una reserva en sessionStorage, mostrarla
    if (guestReservaId && reservas.length > 0) {
      const reservasActuales = reservas.filter(r => r.id.toString() === guestReservaId);
      
      if (reservasActuales.length > 0) {
        return (
          <div className="min-h-screen bg-white py-8">
            <div className="container mx-auto px-4">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800">Tu Reserva</h1>
                <p className="text-gray-600 mt-2">Datos de tu reserva</p>
              </div>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Cliente</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Teléfono</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Fecha</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Hora</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Mesa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservasActuales.map((reserva) => (
                      <tr key={reserva.id} className="bg-white border-b border-gray-200">
                        <td className="px-6 py-4 text-gray-900 font-medium">{reserva.nombre_cliente}</td>
                        <td className="px-6 py-4 text-gray-600">{reserva.telefono}</td>
                        <td className="px-6 py-4 text-gray-600">{reserva.fecha}</td>
                        <td className="px-6 py-4 text-gray-600">{reserva.hora}</td>
                        <td className="px-6 py-4 text-gray-600">Mesa {reserva.mesa_numero}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-8 p-4 bg-blue-50 border border-blue-300 rounded-lg">
                <p className="text-blue-800 text-sm">💡 Tu reserva será visible mientras permanezcas en el navegador. Para ver más reservas en el futuro, inicia sesión.</p>
              </div>
            </div>
          </div>
        );
      }
    }
    
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-blue-300">
            <p className="text-gray-600 text-lg mb-6">Para ver todas tus reservas, debes iniciar sesión.</p>
            <Link
              to="/login"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              🔐 Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-4xl font-bold text-gray-800">Mis Reservas</h1>
          <Link
            to="/reservas/nueva"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold"
          >
            + Nueva Reserva
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-400 text-yellow-800 rounded-lg">
            <p className="font-semibold">⚠️ {error}</p>
            <button 
              onClick={fetchReservas} 
              className="mt-2 text-blue-700 font-semibold hover:text-blue-900"
            >
              Reintentar conexión
            </button>
          </div>
        )}

        {renderReservasContent()}

      <ConfirmModal
        isOpen={showConfirm}
        title="Eliminar Reserva"
        message="¿Estás seguro de que deseas eliminar esta reserva? Esta acción no se puede deshacer."
        isDangerous={true}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
      </div>
    </div>
  );
}

export default ReservaList;
