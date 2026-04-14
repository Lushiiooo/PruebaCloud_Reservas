import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/api';
import ConfirmModal from './ConfirmModal';

interface OrdenItem {
  item_menu: {
    nombre: string;
    categoria: string;
  };
  cantidad: number;
  precio_unitario: string;
}

interface Orden {
  id: number;
  nombre_cliente: string;
  telefono: string;
  tipo: string;
  mesa_numero?: number;
  precio_total: string;
  estado: string;
  items: OrdenItem[];
  creada_en: string;
}

const ESTADOS = ['Pendiente', 'Preparando', 'Lista', 'Entregada'];

function AdminOrdenes() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [ordenToDelete, setOrdenToDelete] = useState<number | null>(null);

  useEffect(() => {
    cargarOrdenes();
  }, []);

  const cargarOrdenes = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('📡 Cargando órdenes...');
      const response = await apiClient.getOrdenes();
      console.log('📥 Respuesta órdenes:', response);
      if (response.success && response.data) {
        const ordenesArr = response.data.results || response.data;
        setOrdenes(Array.isArray(ordenesArr) ? ordenesArr : []);
      } else {
        setError(response.error || 'Error al cargar órdenes');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEstado = async (id: number, nuevoEstado: string) => {
    try {
      console.log('📡 Cambiando estado de orden...');
      const response = await apiClient.cambiarEstadoOrden(id, nuevoEstado);
      if (response.success) {
        console.log('✅ Estado actualizado');
        cargarOrdenes();
      } else {
        setError(response.error || 'Error al cambiar estado');
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDeleteOrden = (id: number) => {
    setOrdenToDelete(id);
    setShowConfirm(true);
  };

  const confirmDeleteOrden = async () => {
    if (!ordenToDelete) return;

    try {
      console.log('📡 Eliminando orden...');
      const response = await apiClient.deleteOrden(ordenToDelete);
      if (response.success) {
        console.log('✅ Orden eliminada');
        setShowConfirm(false);
        setOrdenToDelete(null);
        cargarOrdenes();
      } else {
        setError(response.error || 'Error al eliminar orden');
      }
    } catch (err) {
      setError((err as Error).message);
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

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white shadow-lg p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/admin/dashboard" className="text-white hover:text-blue-200 font-semibold">
            ← Volver al Dashboard
          </Link>
          <h1 className="text-2xl font-bold">🍽️ Gestión de Órdenes</h1>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <p className="text-gray-600">Cargando órdenes...</p>
          </div>
        ) : ordenes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg">
            <p className="text-gray-600">No hay órdenes registradas</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">ID</th>
                  <th className="px-4 py-3 text-left font-semibold">Cliente</th>
                  <th className="px-4 py-3 text-left font-semibold">Tipo</th>
                  <th className="px-4 py-3 text-left font-semibold">Total</th>
                  <th className="px-4 py-3 text-left font-semibold">Items</th>
                  <th className="px-4 py-3 text-left font-semibold">Estado</th>
                  <th className="px-4 py-3 text-left font-semibold">Cambiar Estado</th>
                  <th className="px-4 py-3 text-left font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.map((orden) => (
                  <>
                    <tr key={orden.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold">#{orden.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold">{orden.nombre_cliente}</div>
                        <div className="text-xs text-gray-500">{orden.telefono}</div>
                      </td>
                      <td className="px-4 py-3">
                        {orden.tipo === 'Comer en Mesa' ? `Mesa ${orden.mesa_numero}` : 'Retiro'}
                      </td>
                      <td className="px-4 py-3 font-bold text-blue-600">
                        ${parseFloat(orden.precio_total || '0').toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs">
                          {orden.items?.length || 0} items
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(orden.estado)}`}>
                          {getEstadoEmoji(orden.estado)} {orden.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={orden.estado}
                          onChange={(e) => handleChangeEstado(orden.id, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded bg-white text-gray-900 text-xs"
                        >
                          {ESTADOS.map((estado) => (
                            <option key={estado} value={estado}>
                              {estado}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleDeleteOrden(orden.id)}
                          className="text-red-600 hover:text-red-800 font-semibold"
                        >
                          🗑️ Eliminar
                        </button>
                      </td>
                    </tr>
                    <tr key={`items-${orden.id}`} className="bg-gray-50">
                      <td colSpan={8} className="px-4 py-3">
                        <details className="text-sm">
                          <summary className="cursor-pointer font-semibold text-blue-600 hover:text-blue-800">
                            📦 Ver detalles ({orden.items?.length || 0} items)
                          </summary>
                          <div className="mt-2 ml-4 border-l-2 border-gray-300 pl-3">
                            {orden.items && orden.items.length > 0 ? (
                              orden.items.map((item, idx) => (
                                <div key={idx} className="py-1 text-gray-700">
                                  ✓ {item.item_menu.nombre} ({item.item_menu.categoria}) x{item.cantidad} @ ${item.precio_unitario}
                                </div>
                              ))
                            ) : (
                              <div className="text-gray-500">Sin items</div>
                            )}
                          </div>
                        </details>
                      </td>
                    </tr>
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}

      <ConfirmModal
        isOpen={showConfirm}
        title="Eliminar Orden"
        message="¿Estás seguro de que deseas eliminar esta orden? Esta acción no se puede deshacer."
        isDangerous={true}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDeleteOrden}
        onCancel={() => setShowConfirm(false)}
      />
      </div>
    </div>
  );
}

export default AdminOrdenes;
