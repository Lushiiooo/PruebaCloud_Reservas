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
  mesa_numero: number;
  mesa_ubicacion: string;
  mesa?: number;
  estado: string;
  creada_en: string;
}

interface Mesa {
  id: number;
  numero: number;
  capacidad: number;
  ubicacion: string;
}

function AdminReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Reserva>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [reservaToDelete, setReservaToDelete] = useState<number | null>(null);

  useEffect(() => {
    cargarReservas();
    cargarMesas();
  }, []);

  const cargarMesas = async () => {
    try {
      const response = await apiClient.getMesas();
      if (response.success && response.data) {
        const mesasArr = response.data.results || response.data;
        setMesas(Array.isArray(mesasArr) ? mesasArr : []);
      }
    } catch (err) {
      console.error('Error al cargar mesas:', err);
    }
  };

  const cargarReservas = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('📡 Cargando reservas...');
      const response = await apiClient.getReservas();
      console.log('📥 Respuesta reservas:', response);
      if (response.success && response.data) {
        const reservasArr = response.data.results || response.data;
        setReservas(Array.isArray(reservasArr) ? reservasArr : []);
      } else {
        setError(response.error || 'Error al cargar reservas');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReserva = (id: number) => {
    setReservaToDelete(id);
    setShowConfirm(true);
  };

  const confirmDeleteReserva = async () => {
    if (!reservaToDelete) return;

    try {
      console.log('📡 Eliminando reserva...');
      const response = await apiClient.deleteReserva(reservaToDelete);
      if (response.success) {
        console.log('✅ Reserva eliminada');
        setShowConfirm(false);
        setReservaToDelete(null);
        cargarReservas();
      } else {
        setError(response.error || 'Error al eliminar reserva');
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleEditReserva = (reserva: Reserva) => {
    setEditingId(reserva.id);
    setEditFormData({
      mesa: reserva.mesa_numero,
      estado: reserva.estado,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      console.log('📡 Actualizando reserva...');
      const response = await apiClient.updateReserva(editingId, {
        mesa: editFormData.mesa,
        estado: editFormData.estado,
      });

      if (response.success) {
        console.log('✅ Reserva actualizada');
        setEditingId(null);
        setEditFormData({});
        cargarReservas();
      } else {
        setError(response.error || 'Error al actualizar reserva');
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Confirmada':
        return 'bg-green-100 text-green-800';
      case 'Cancelada':
        return 'bg-red-100 text-red-800';
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
          <h1 className="text-2xl font-bold">📅 Gestión de Reservas</h1>
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
            <p className="text-gray-600">Cargando reservas...</p>
          </div>
        ) : reservas.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg">
            <p className="text-gray-600">No hay reservas registradas</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Cliente</th>
                  <th className="px-4 py-3 text-left font-semibold">Teléfono</th>
                  <th className="px-4 py-3 text-left font-semibold">Fecha</th>
                  <th className="px-4 py-3 text-left font-semibold">Hora</th>
                  <th className="px-4 py-3 text-left font-semibold">Mesa</th>
                  <th className="px-4 py-3 text-left font-semibold">Estado</th>
                  <th className="px-4 py-3 text-left font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map((reserva) => (
                  <tr key={reserva.id} className="border-b hover:bg-gray-50">
                    {editingId === reserva.id ? (
                      <>
                        <td colSpan={2} className="px-4 py-3">
                          <div className="text-sm font-semibold">{reserva.nombre_cliente}</div>
                          <div className="text-xs text-gray-500">{reserva.telefono}</div>
                        </td>
                        <td colSpan={2} className="px-4 py-3">
                          <div className="text-sm">
                            {new Date(reserva.fecha).toLocaleDateString('es-ES')} {reserva.hora}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={editFormData.mesa || ''}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, mesa: parseInt(e.target.value) })
                            }
                            className="px-2 py-1 border border-gray-300 rounded bg-white text-gray-900 text-sm"
                          >
                            <option value="">Seleccionar mesa</option>
                            {mesas.map((mesa) => (
                              <option key={mesa.id} value={mesa.id}>
                                Mesa {mesa.numero}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={editFormData.estado || ''}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, estado: e.target.value })
                            }
                            className="px-2 py-1 border border-gray-300 rounded bg-white text-gray-900 text-sm"
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="Confirmada">Confirmada</option>
                            <option value="Cancelada">Cancelada</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={handleSaveEdit}
                            className="text-green-600 hover:text-green-800 font-semibold mr-2 text-sm"
                          >
                            💾 Guardar
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:text-gray-800 font-semibold text-sm"
                          >
                            ✕ Cancelar
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-semibold">{reserva.nombre_cliente}</td>
                        <td className="px-4 py-3 text-sm">{reserva.telefono}</td>
                        <td className="px-4 py-3">
                          {new Date(reserva.fecha).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-4 py-3">{reserva.hora}</td>
                        <td className="px-4 py-3">
                          Mesa {reserva.mesa_numero} ({reserva.mesa_ubicacion})
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(reserva.estado)}`}>
                            {reserva.estado}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => handleEditReserva(reserva)}
                            className="text-blue-600 hover:text-blue-800 font-semibold mr-2"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleDeleteReserva(reserva.id)}
                            className="text-red-600 hover:text-red-800 font-semibold"
                          >
                            🗑️ Eliminar
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      <ConfirmModal
        isOpen={showConfirm}
        title="Eliminar Reserva"
        message="¿Estás seguro de que deseas eliminar esta reserva? Esta acción no se puede deshacer."
        isDangerous={true}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDeleteReserva}
        onCancel={() => setShowConfirm(false)}
      />
      </div>
    </div>
  );
}

export default AdminReservas;
