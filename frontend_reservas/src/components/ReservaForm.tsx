import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../services/api';

interface FormData {
  nombre_cliente: string;
  telefono: string;
  fecha: string;
  hora: string;
  mesa: number;
  estado: string;
}

interface Mesa {
  id: number;
  numero: number;
  capacidad: number;
  ubicacion: string;
}

interface Horario {
  id: number;
  dia_semana: string;
  hora_apertura: string;
  hora_cierre: string;
  cerrado: boolean;
  actualizado_en: string;
}

function ReservaForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState<FormData>({
    nombre_cliente: '',
    telefono: '',
    fecha: '',
    hora: '',
    mesa: 0,
    estado: 'Pendiente',
  });
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [horarioHoy, setHorarioHoy] = useState<Horario | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchMesas();
    fetchHorarios();
    if (id) {
      fetchReserva();
    }
  }, [id]);

  const fetchMesas = async () => {
    try {
      console.log('📡 Cargando mesas...');
      const response = await apiClient.getMesas();
      console.log('📥 Respuesta mesas:', response);
      if (response.success && response.data) {
        const results = response.data.results || response.data;
        const mesasArray = Array.isArray(results) ? results : [];
        console.log('✅ Mesas cargadas:', mesasArray);
        setMesas(mesasArray);
      } else {
        console.error('❌ Error:', response.error);
      }
    } catch (err) {
      console.error('❌ Error al cargar mesas:', err);
    }
  };

  const fetchHorarios = async () => {
    try {
      console.log('📡 Cargando horarios del restaurante...');
      const response = await apiClient.getHorarios();
      console.log('📥 Respuesta horarios:', response);
      if (response.success && response.data) {
        const results = response.data.results || response.data;
        const horariosArray = Array.isArray(results) ? results : [];
        console.log('✅ Horarios cargados:', horariosArray);
        setHorarios(horariosArray);
      } else {
        console.error('❌ Error:', response.error);
      }
    } catch (err) {
      console.error('❌ Error al cargar horarios:', err);
    }
  };

  const getDiaSemana = (fecha: string): string => {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const date = new Date(fecha);
    return dias[date.getDay()];
  };

  const getHorarioForDate = (fecha: string): Horario | null => {
    if (!fecha || horarios.length === 0) return null;
    const diaSemana = getDiaSemana(fecha);
    return horarios.find(h => h.dia_semana === diaSemana) || null;
  };

  const fetchReserva = async () => {
    try {
      console.log('📡 Cargando reserva ID:', id);
      const response = await apiClient.getReserva(Number.parseInt(id || '0'));
      console.log('📥 Respuesta reserva:', response);
      if (response.success && response.data) {
        const { nombre_cliente, telefono, fecha, hora, mesa, estado } = response.data;
        setFormData(prev => ({
          ...prev,
          nombre_cliente: nombre_cliente || '',
          telefono: telefono || '',
          fecha: fecha || '',
          hora: hora || '',
          mesa: mesa || 0,
          estado: estado || 'Pendiente',
        }));
        // Cargar horario del día
        if (fecha) {
          const nuevoHorario = getHorarioForDate(fecha);
          setHorarioHoy(nuevoHorario);
        }
        console.log('✅ Reserva cargada');
      } else {
        console.error('❌ Error:', response.error);
      }
    } catch (err) {
      console.error('❌ Error al cargar reserva:', err);
    }
  };

  const validateNombreCliente = (): string | null => {
    if (!formData.nombre_cliente.trim()) {
      return 'El nombre es obligatorio';
    }
    return null;
  };

  const validateTelefono = (): string | null => {
    if (!formData.telefono.trim()) {
      return 'El teléfono es obligatorio';
    }
    if (formData.telefono.length < 7) {
      return 'El teléfono debe tener al menos 7 dígitos';
    }
    return null;
  };

  const validateFecha = (): string | null => {
    if (!formData.fecha) {
      return 'La fecha es obligatoria';
    }
    return null;
  };

  const validateHora = (): string | null => {
    if (!formData.hora) {
      return 'La hora es obligatoria';
    }

    const horario = getHorarioForDate(formData.fecha);
    if (horario?.cerrado) {
      return '🔒 El restaurante está cerrado este día';
    }
    
    if (horario) {
      const horaReserva = formData.hora;
      const horaApertura = horario.hora_apertura;
      const horaCierre = horario.hora_cierre;

      if (horaReserva < horaApertura) {
        return `⏰ Antes de la apertura (${horaApertura})`;
      }
      if (horaReserva >= horaCierre) {
        return `⏰ Después del cierre (${horaCierre})`;
      }

      const [hora, minutos] = horaReserva.split(':').map(Number);
      const horaPlusDos = `${String(hora + 2).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
      if (horaPlusDos > horaCierre) {
        return `⏱️ La reserva de 2h sobrepasa cierre (${horaCierre})`;
      }
    }
    return null;
  };

  const validateMesa = (): string | null => {
    if (!formData.mesa || formData.mesa === 0) {
      return 'Debe seleccionar una mesa';
    }
    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nombreError = validateNombreCliente();
    if (nombreError) newErrors.nombre_cliente = nombreError;

    const telefonoError = validateTelefono();
    if (telefonoError) newErrors.telefono = telefonoError;

    const fechaError = validateFecha();
    if (fechaError) newErrors.fecha = fechaError;

    const horaError = validateHora();
    if (horaError) newErrors.hora = horaError;

    const mesaError = validateMesa();
    if (mesaError) newErrors.mesa = mesaError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'mesa' ? Number.parseInt(value) : value,
    }));

    // Si cambió la fecha, actualizar el horario del día seleccionado
    if (name === 'fecha' && value) {
      const nuevoHorario = getHorarioForDate(value);
      setHorarioHoy(nuevoHorario);
    }

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = id
        ? await apiClient.updateReserva(Number.parseInt(id), formData)
        : await apiClient.createReserva(formData);

      if (response.success) {
        // Guardar ID en sessionStorage si el usuario no está autenticado
        const token = apiClient.getToken();
        if (!token && response.data?.id) {
          sessionStorage.setItem('guestReservaId', response.data.id);
        }
        navigate('/reservas');
      } else {
        setErrors({ general: response.error || 'Error al guardar reserva' });
      }
    } catch (err) {
      setErrors({ general: (err as Error).message || 'Error desconocido' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          {id ? 'Editar Reserva' : 'Nueva Reserva'}
        </h1>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-lg">
        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.general}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="nombre_cliente" className="block text-gray-700 font-semibold mb-2">
            Nombre *
          </label>
          <input
            type="text"
            id="nombre_cliente"
            name="nombre_cliente"
            value={formData.nombre_cliente}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded focus:outline-none bg-white text-gray-900 ${
              errors.nombre_cliente ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Nombre completo"
          />
          {errors.nombre_cliente && (
            <p className="text-red-600 text-sm mt-1">{errors.nombre_cliente}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="telefono" className="block text-gray-700 font-semibold mb-2">
            Teléfono *
          </label>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded focus:outline-none bg-white text-gray-900 ${
              errors.telefono ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="1234567890"
          />
          {errors.telefono && (
            <p className="text-red-600 text-sm mt-1">{errors.telefono}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="fecha" className="block text-gray-700 font-semibold mb-2">
            Fecha *
          </label>
          <input
            type="date"
            id="fecha"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded focus:outline-none bg-white text-gray-900 ${
              errors.fecha ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.fecha && (
            <p className="text-red-600 text-sm mt-1">{errors.fecha}</p>
          )}
          
          {formData.fecha && horarioHoy && (
            <div className="mt-3 p-3 rounded bg-blue-50 border border-blue-200">
              {horarioHoy.cerrado ? (
                <p className="text-red-600 font-semibold">🔒 Restaurante cerrado este día</p>
              ) : (
                <p className="text-blue-800 text-sm">
                  ⏰ <strong>{getDiaSemana(formData.fecha)}:</strong> {horarioHoy.hora_apertura} - {horarioHoy.hora_cierre}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="hora" className="block text-gray-700 font-semibold mb-2">
            Hora * (duración: 2 horas)
          </label>
          <input
            type="time"
            id="hora"
            name="hora"
            value={formData.hora}
            onChange={handleChange}
            disabled={!formData.fecha || (horarioHoy?.cerrado ?? false)}
            className={`w-full px-3 py-2 border rounded focus:outline-none bg-white text-gray-900 ${
              errors.hora ? 'border-red-500' : 'border-gray-300'
            } ${!formData.fecha || (horarioHoy?.cerrado ?? false) ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          {errors.hora && (
            <p className="text-red-600 text-sm mt-1">{errors.hora}</p>
          )}
          
          {formData.fecha && horarioHoy && !horarioHoy.cerrado && (
            <p className="text-gray-600 text-xs mt-2">
              💡 Selecciona una hora entre {horarioHoy.hora_apertura} y{' '}
              {(() => {
                const [h, m] = horarioHoy.hora_cierre.split(':').map(Number);
                const maxHora = h - 2;
                return `${String(maxHora).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
              })()}
            </p>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="mesa" className="block text-gray-700 font-semibold mb-2">
            Mesa *
          </label>
          <select
            id="mesa"
            name="mesa"
            value={formData.mesa}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded focus:outline-none bg-white text-gray-900 ${
              errors.mesa ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value={0}>Selecciona una mesa</option>
            {mesas.map(mesa => (
              <option key={mesa.id} value={mesa.id}>
                Mesa {mesa.numero} - {mesa.capacidad} personas ({mesa.ubicacion})
              </option>
            ))}
          </select>
          {errors.mesa && (
            <p className="text-red-600 text-sm mt-1">{errors.mesa}</p>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Guardando...' : 'Guardar Reserva'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/reservas')}
            className="flex-1 bg-gray-400 text-white py-2 rounded hover:bg-gray-500 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>

      {submitted && Object.keys(errors).length > 0 && (
        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          Por favor, completa todos los campos obligatorios correctamente.
        </div>
      )}
      </div>
    </div>
  );
}

export default ReservaForm;
