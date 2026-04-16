import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';

interface Horario {
  id: number;
  dia_semana: string;
  hora_apertura: string;
  hora_cierre: string;
  cerrado: boolean;
  actualizado_en: string;
}

function AdminHorarios() {
  const navigate = useNavigate();
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Horario>>({});

  useEffect(() => {
    cargarHorarios();
  }, []);

  const cargarHorarios = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getHorarios();
      if (response.success && response.data) {
        const horariosData = Array.isArray(response.data) ? response.data : response.data.results || [];
        setHorarios(horariosData);
      } else {
        setError(response.error || 'Error al cargar horarios');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (horario: Horario) => {
    setEditingId(horario.id);
    setFormData({
      hora_apertura: horario.hora_apertura.substring(0, 5), // HH:MM
      hora_cierre: horario.hora_cierre.substring(0, 5), // HH:MM
      cerrado: horario.cerrado,
    });
  };

  const handleSave = async () => {
    if (!editingId) return;

    setLoading(true);
    try {
      // SIEMPRE enviar los tres campos requeridos
      const dataToSend = {
        hora_apertura: formData.hora_apertura ? `${formData.hora_apertura}:00` : '00:00:00',
        hora_cierre: formData.hora_cierre ? `${formData.hora_cierre}:00` : '00:00:00',
        cerrado: formData.cerrado || false,
      };

      console.log('📨 Enviando actualización de horario:', { id: editingId, data: dataToSend });
      const response = await apiClient.updateHorario(editingId, dataToSend);
      console.log('🔧 Respuesta de horario:', response);
      if (response.success) {
        console.log('✅ Horario actualizado exitosamente');
        setEditingId(null);
        setFormData({});
        cargarHorarios();
      } else {
        const errorMsg = response.error || 'Error al actualizar horario';
        console.error('❌ Error en actualización:', errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg = (err as Error).message;
      console.error('❌ Error en catch:', errorMsg, err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            ← Volver
          </button>
          <h1 className="text-4xl font-bold text-gray-800">🕐 Horarios del Restaurante</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-400 text-red-800 rounded-lg">
            <p className="font-semibold">❌ {error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-red-700 font-semibold hover:text-red-900"
            >
              Descartar
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">Cargando horarios...</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Día</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Apertura</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Cierre</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Estado</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {horarios.map((horario, index) => (
                  <tr
                    key={horario.id}
                    className={`${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    } border-b border-gray-200 hover:bg-blue-50 transition`}
                  >
                    <td className="px-6 py-4 text-gray-900 font-medium">{horario.dia_semana}</td>

                    {editingId === horario.id ? (
                      <>
                        <td className="px-6 py-4">
                          <input
                            type="time"
                            value={formData.hora_apertura || ''}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                hora_apertura: e.target.value,
                              })
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg w-full"
                            disabled={formData.cerrado}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="time"
                            value={formData.hora_cierre || ''}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                hora_cierre: e.target.value,
                              })
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg w-full"
                            disabled={formData.cerrado}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.cerrado || false}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  cerrado: e.target.checked,
                                })
                              }
                              className="w-4 h-4 cursor-pointer"
                            />
                            <span className="ml-2 text-sm text-gray-600">Cerrado</span>
                          </label>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={handleSave}
                            disabled={loading}
                            className="text-green-600 hover:text-green-800 font-medium mr-4 disabled:opacity-50"
                          >
                            💾 Guardar
                          </button>
                          <button
                            onClick={handleCancel}
                            className="text-gray-600 hover:text-gray-800 font-medium"
                          >
                            ✕ Cancelar
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-gray-600">
                          {horario.cerrado ? 'CERRADO' : horario.hora_apertura}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {horario.cerrado ? 'CERRADO' : horario.hora_cierre}
                        </td>
                        <td className="px-6 py-4">
                          {horario.cerrado ? (
                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                              🔒 Cerrado
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                              🔓 Abierto
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleEdit(horario)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            ✏️ Editar
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

        <div className="mt-8 p-4 bg-blue-50 border border-blue-300 rounded-lg">
          <p className="text-blue-800 text-sm">
            💡 <strong>Tip:</strong> Usa "Cerrado" para días que el restaurante esté cerrado. Los horarios se mostrarán
            a los clientes para validar disponibilidad de reservas.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminHorarios;
