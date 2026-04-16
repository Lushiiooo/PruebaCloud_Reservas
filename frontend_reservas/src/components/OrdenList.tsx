import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/api';

function OrdenList() {
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const token = apiClient.getToken();
    setIsAuthenticated(!!token);
    
    if (token) {
      cargarOrdenes();
    } else {
      // Si es guest, intenta cargar la orden que acaba de crear
      const guestOrdenId = sessionStorage.getItem('guestOrdenId');
      if (guestOrdenId) {
        cargarOrdenGuest(Number.parseInt(guestOrdenId));
      }
    }
  }, []);

  const cargarOrdenes = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('📡 Cargando órdenes desde API...');
      const response = await apiClient.getOrdenes();
      console.log('📥 Respuesta de API:', response);
      if (response.success && response.data) {
        const results = response.data.results || response.data;
        const ordenesArray = Array.isArray(results) ? results : [];
        console.log('✅ Órdenes cargadas:', ordenesArray);
        setOrdenes(ordenesArray);
      } else {
        const errorMsg = response.error || 'Error al cargar órdenes';
        console.error('❌ Error:', errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg = (err as Error).message;
      console.error('❌ Error en catch:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const cargarOrdenGuest = async (ordenId: number) => {
    console.log('🟢 Cargando orden guest:', ordenId);
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getOrden(ordenId);
      if (response.success && response.data) {
        setOrdenes([response.data]);
        console.log('✅ Orden guest cargada');
      } else {
        console.warn('⚠️ No se pudo cargar la orden:', response.error);
        setOrdenes([]);
      }
    } catch (err) {
      console.warn('⚠️ Error cargando orden guest:', err);
      setOrdenes([]);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Preparando':
        return 'bg-blue-100 text-blue-800';
      case 'Lista':
        return 'bg-green-100 text-green-800';
      case 'Entregada':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderOrdenesContent = () => (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full">
        <thead className="bg-gray-100 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Cliente</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tipo</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Mesa/Retiro</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Total</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Items</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Estado</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Fecha</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ordenes.map((orden, index) => (
            <tr 
              key={orden.id || index} 
              className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200 hover:bg-blue-50 transition`}
            >
              <td className="px-6 py-4 text-gray-900 font-medium">#{orden.id}</td>
              <td className="px-6 py-4 text-gray-600">{orden.nombre_cliente || 'N/A'}</td>
              <td className="px-6 py-4 text-gray-600">{orden.tipo || 'N/A'}</td>
              <td className="px-6 py-4 text-gray-600">
                {orden.tipo === 'Comer en Mesa' 
                  ? `Mesa ${orden.mesa_numero || 'N/A'}` 
                  : 'Retiro'}
              </td>
              <td className="px-6 py-4 text-gray-900 font-semibold">
                ${Number.parseFloat(orden.precio_total || '0').toFixed(2)}
              </td>
              <td className="px-6 py-4 text-gray-600">
                <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                  {(orden.items || []).length} items
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getEstadoColor(orden.estado)}`}>
                  {orden.estado || 'N/A'}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-600 text-sm">
                {orden.creada_en ? new Date(orden.creada_en).toLocaleDateString('es-ES') : 'N/A'}
              </td>
              <td className="px-6 py-4">
                <Link
                  to={`/ordenes/${orden.id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Ver Detalles
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Si no está autenticado, mostrar solo la orden que acaba de crear
  if (!isAuthenticated) {
    const guestOrdenId = sessionStorage.getItem('guestOrdenId');
    
    // Si tiene una orden en sessionStorage, mostrarla
    if (guestOrdenId && ordenes.length > 0) {
      const ordenesActuales = ordenes.filter(o => o.id.toString() === guestOrdenId);
      
      if (ordenesActuales.length > 0) {
        return (
          <div className="min-h-screen bg-white py-8">
            <div className="container mx-auto px-4">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800">Tu Orden</h1>
                <p className="text-gray-600 mt-2">Datos de tu orden</p>
              </div>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Cliente</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tipo</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Total</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Items</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordenesActuales.map((orden) => (
                      <tr key={orden.id} className="bg-white border-b border-gray-200">
                        <td className="px-6 py-4 text-gray-900 font-medium">#{orden.id}</td>
                        <td className="px-6 py-4 text-gray-600">{orden.nombre_cliente}</td>
                        <td className="px-6 py-4 text-gray-600">{orden.tipo}</td>
                        <td className="px-6 py-4 text-gray-900 font-semibold">${Number.parseFloat(orden.precio_total || '0').toFixed(2)}</td>
                        <td className="px-6 py-4 text-gray-600">{(orden.items || []).length}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getEstadoColor(orden.estado)}`}>
                            {orden.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-8 p-4 bg-blue-50 border border-blue-300 rounded-lg">
                <p className="text-blue-800 text-sm">💡 Tu orden será visible mientras permanezcas en el navegador. Para ver más órdenes en el futuro, inicia sesión.</p>
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
            <p className="text-gray-600 text-lg mb-6">Para ver todas tus órdenes, debes iniciar sesión.</p>
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
          <h1 className="text-4xl font-bold text-gray-800">Mis Órdenes</h1>
          <Link
            to="/ordenes/nueva"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold"
          >
            + Nueva Orden
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-400 text-yellow-800 rounded-lg">
            <p className="font-semibold">⚠️ {error}</p>
            <button 
              onClick={cargarOrdenes} 
              className="mt-2 text-blue-700 font-semibold hover:text-blue-900"
            >
              Reintentar conexión
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">Cargando órdenes...</p>
          </div>
        ) : ordenes.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <p className="text-gray-600 text-lg mb-6">No tienes órdenes aún</p>
            <Link
              to="/ordenes/nueva"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Hacer tu primera orden
            </Link>
          </div>
        ) : renderOrdenesContent()}
      </div>
    </div>
  );
}

export default OrdenList;
