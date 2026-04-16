import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/api';
import ConfirmModal from './ConfirmModal';

interface Mesa {
  id: number;
  numero: number;
  capacidad: number;
  ubicacion: string;
}

function AdminMesas() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Mesa>>({});
  const [newMesa, setNewMesa] = useState({
    numero: '',
    capacidad: '',
    ubicacion: 'Interior',
  });
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [mesaToDelete, setMesaToDelete] = useState<number | null>(null);

  useEffect(() => {
    cargarMesas();
  }, []);

  const cargarMesas = async () => {
    setLoading(true);
    try {
      console.log('📡 Cargando mesas...');
      const response = await apiClient.getMesas();
      console.log('📥 Respuesta mesas:', response);
      if (response.success && response.data) {
        const mesasArr = response.data.results || response.data;
        setMesas(Array.isArray(mesasArr) ? mesasArr : []);
      } else {
        setError(response.error || 'Error al cargar mesas');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMesa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMesa.numero || !newMesa.capacidad) {
      setError('Completa todos los campos');
      return;
    }

    try {
      console.log('📡 Creando nueva mesa...');
      const response = await apiClient.createMesa({
        numero: parseInt(newMesa.numero),
        capacidad: parseInt(newMesa.capacidad),
        ubicacion: newMesa.ubicacion,
      });

      if (response.success) {
        console.log('✅ Mesa creada');
        setNewMesa({ numero: '', capacidad: '', ubicacion: 'Interior' });
        setShowForm(false);
        cargarMesas();
      } else {
        setError(response.error || 'Error al crear mesa');
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDeleteMesa = async (id: number) => {
    setMesaToDelete(id);
    setShowConfirm(true);
  };

  const confirmDeleteMesa = async () => {
    if (!mesaToDelete) return;

    try {
      console.log('📡 Eliminando mesa...');
      const response = await apiClient.deleteMesa(mesaToDelete);
      if (response.success) {
        console.log('✅ Mesa eliminada');
        cargarMesas();
      } else {
        setError(response.error || 'Error al eliminar mesa');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setShowConfirm(false);
      setMesaToDelete(null);
    }
  };

  const handleEditMesa = (mesa: Mesa) => {
    setEditingId(mesa.id);
    setEditFormData({
      numero: mesa.numero,
      capacidad: mesa.capacidad,
      ubicacion: mesa.ubicacion,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    if (!editFormData.numero || !editFormData.capacidad) {
      setError('Completa todos los campos');
      return;
    }

    try {
      console.log('📡 Actualizando mesa...');
      const response = await apiClient.updateMesa(editingId, {
        numero: parseInt(editFormData.numero as any),
        capacidad: parseInt(editFormData.capacidad as any),
        ubicacion: editFormData.ubicacion,
      });

      if (response.success) {
        console.log('✅ Mesa actualizada');
        setEditingId(null);
        setEditFormData({});
        cargarMesas();
      } else {
        setError(response.error || 'Error al actualizar mesa');
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white shadow-lg p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/admin/dashboard" className="text-white hover:text-blue-200 font-semibold">
            ← Volver al Dashboard
          </Link>
          <h1 className="text-2xl font-bold">🪑 Gestión de Mesas</h1>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
        >
          {showForm ? '✕ Cerrar' : '+ Nueva Mesa'}
        </button>

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <form onSubmit={handleAddMesa} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="number"
                placeholder="Número de mesa"
                value={newMesa.numero}
                onChange={(e) => setNewMesa({ ...newMesa, numero: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-900"
              />
              <input
                type="number"
                placeholder="Capacidad"
                value={newMesa.capacidad}
                onChange={(e) => setNewMesa({ ...newMesa, capacidad: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-900"
              />
              <select
                value={newMesa.ubicacion}
                onChange={(e) => setNewMesa({ ...newMesa, ubicacion: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-900"
              >
                <option value="Interior">Interior</option>
                <option value="Terraza">Terraza</option>
              </select>
              <button
                type="submit"
                className="md:col-span-3 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
              >
                ✓ Crear Mesa
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <p className="text-gray-600">Cargando mesas...</p>
          </div>
        ) : mesas.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg">
            <p className="text-gray-600">No hay mesas registradas</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">Número</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">Capacidad</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">Ubicación</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-800">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {mesas.map((mesa) => (
                  <tr key={mesa.id} className="border-b hover:bg-gray-50">
                    {editingId === mesa.id ? (
                      <>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={editFormData.numero || ''}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, numero: parseInt(e.target.value) || 0 })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-gray-900"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={editFormData.capacidad || ''}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, capacidad: parseInt(e.target.value) || 0 })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded bg-white text-gray-900"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={editFormData.ubicacion || ''}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, ubicacion: e.target.value })
                            }
                            className="px-2 py-1 border border-gray-300 rounded bg-white text-gray-900"
                          >
                            <option value="Interior">Interior</option>
                            <option value="Terraza">Terraza</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={handleSaveEdit}
                            className="text-green-600 hover:text-green-800 font-semibold mr-2"
                          >
                            💾 Guardar
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:text-gray-800 font-semibold"
                          >
                            ✕ Cancelar
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4">Mesa {mesa.numero}</td>
                        <td className="px-6 py-4">{mesa.capacidad} personas</td>
                        <td className="px-6 py-4">{mesa.ubicacion}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleEditMesa(mesa)}
                            className="text-blue-600 hover:text-blue-800 font-semibold mr-3"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleDeleteMesa(mesa.id)}
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
        title="Eliminar Mesa"
        message={`¿Estás seguro de que deseas eliminar la mesa ${mesaToDelete}? Esta acción no se puede deshacer.`}
        isDangerous={true}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDeleteMesa}
        onCancel={() => setShowConfirm(false)}
      />
      </div>
    </div>
  );
}

export default AdminMesas;
