import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../services/api';

function OrdenDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orden, setOrden] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarOrden();
  }, [id]);

  const cargarOrden = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getOrden(parseInt(id!));
      console.log('📥 Respuesta orden:', response);
      if (response.success && response.data) {
        setOrden(response.data);
      } else {
        setError(response.error || 'No se pudo cargar la orden');
      }
    } catch (err) {
      const errorMsg = (err as Error).message;
      console.error('❌ Error:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Cargando orden...</p>
      </div>
    );
  }

  if (error || !orden) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <p className="text-red-600 font-semibold mb-4">{error || 'Orden no encontrada'}</p>
          <Link to="/" className="text-blue-600 hover:text-blue-800 font-semibold">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

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

  const getEstadoEmoji = (estado: string) => {
    switch (estado) {
      case 'Pendiente':
        return '⏳';
      case 'Preparando':
        return '👨‍🍳';
      case 'Lista':
        return '✅';
      case 'Entregada':
        return '🚚';
      default:
        return '📦';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-blue-600 hover:text-blue-800 font-semibold mb-6 inline-block">
          ← Volver al inicio
        </Link>

        <div className="bg-white rounded-lg shadow-lg px-8 py-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Orden #{orden.id}
              </h1>
              <p className="text-gray-600 mt-1">
                {new Date(orden.creada_en).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full font-bold text-lg ${getEstadoColor(orden.estado)}`}>
              {getEstadoEmoji(orden.estado)} {orden.estado}
            </span>
          </div>

          {/* Información del cliente */}
          <div className="border-b pb-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Cliente</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Nombre</p>
                <p className="text-lg font-semibold text-gray-800">{orden.nombre_cliente}</p>
              </div>
              <div>
                <p className="text-gray-600">Teléfono</p>
                <p className="text-lg font-semibold text-gray-800">{orden.telefono}</p>
              </div>
            </div>
          </div>

          {/* Información de entrega/retirada */}
          <div className="border-b pb-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Detalles de Entrega</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Tipo</p>
                <p className="text-lg font-semibold text-gray-800">{orden.tipo}</p>
              </div>
              {orden.tipo === 'Comer en Mesa' ? (
                <div>
                  <p className="text-gray-600">Mesa</p>
                  <p className="text-lg font-semibold text-gray-800">
                    Mesa {orden.mesa_numero} ({orden.mesa_ubicacion})
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600">Hora de Retiro</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {new Date(orden.fecha_hora_retiro).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Ítems de la orden */}
          <div className="border-b pb-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Ítems Ordenados</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-700 font-semibold">Producto</th>
                    <th className="px-4 py-2 text-right text-gray-700 font-semibold">Precio</th>
                    <th className="px-4 py-2 text-center text-gray-700 font-semibold">Cantidad</th>
                    <th className="px-4 py-2 text-right text-gray-700 font-semibold">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {orden.items && Array.isArray(orden.items) && orden.items.map((item: any, index: number) => {
                    const precioUnitario = typeof item.precio_unitario === 'string' 
                      ? parseFloat(item.precio_unitario) 
                      : item.precio_unitario;
                    const cantidad = parseInt(item.cantidad) || 1;
                    const subtotal = precioUnitario * cantidad;
                    
                    return (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-800">{item.item_menu?.nombre || 'Producto'}</div>
                          <div className="text-sm text-gray-600">{item.item_menu?.categoria || 'Sin categoría'}</div>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-800">
                          ${precioUnitario.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-800">
                          {cantidad}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-800">
                          ${subtotal.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-end mb-6">
            <div className="w-full md:w-80">
              <div className="flex justify-between items-center text-lg mb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-800">${parseFloat(orden.precio_total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-2xl font-bold border-t pt-3">
                <span className="text-gray-800">Total:</span>
                <span className="text-blue-600">${parseFloat(orden.precio_total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/ordenes')}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 rounded transition"
            >
              Ver Mis Órdenes
            </button>
            <button
              onClick={() => navigate('/ordenes/nueva')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition"
            >
              Hacer Otra Orden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrdenDetail;
