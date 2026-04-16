import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';

interface MenuItem {
  id: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  precio: number;
  disponible: boolean;
}

interface CarritoItem {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  categoria: string;
}

interface FormData {
  nombre_cliente: string;
  telefono: string;
  tipo: 'Para Retirar' | 'Comer en Mesa';
  mesa?: number;
  fecha_hora_retiro?: string;
}

function OrdenForm() {
  const navigate = useNavigate();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [mesas, setMesas] = useState<any[]>([]);
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Hamburguesas');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nombre_cliente: '',
    telefono: '',
    tipo: 'Para Retirar',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    console.log('🟠 OrdenForm montado');
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      console.log('📡 Cargando menú y mesas...');
      
      const [menuRes, mesasRes] = await Promise.all([
        apiClient.getMenu(),
        apiClient.getMesas(),
      ]);

      console.log('📥 Respuesta menú:', menuRes);
      console.log('📥 Respuesta mesas:', mesasRes);

      if (menuRes.success && menuRes.data) {
        // Manejar paginación de Django
        let menuItems = menuRes.data;
        if (menuRes.data.results) {
          menuItems = menuRes.data.results;
        }
        console.log('✅ Items del menú:', menuItems);
        setMenu(Array.isArray(menuItems) ? menuItems : []);
      } else {
        console.error('❌ Error en menú:', menuRes.error);
        setError(menuRes.error || 'Error al cargar menú');
      }

      if (mesasRes.success && mesasRes.data) {
        let mesasData = mesasRes.data;
        if (mesasRes.data.results) {
          mesasData = mesasRes.data.results;
        }
        console.log('✅ Mesas:', mesasData);
        setMesas(Array.isArray(mesasData) ? mesasData : []);
      } else {
        console.error('❌ Error en mesas:', mesasRes.error);
        setError(mesasRes.error || 'Error al cargar mesas');
      }
    } catch (err) {
      const errorMsg = (err as Error).message;
      console.error('❌ Error general:', errorMsg);
      setError(errorMsg);
    }
  };

  const categorias = ['Hamburguesas', 'Pizzas', 'Hot Dogs', 'Bebidas', 'Postres'];
  const itemsPorCategoria = menu.filter(item => item.categoria === categoriaSeleccionada);

  const agregarAlCarrito = (item: MenuItem) => {
    setCarrito(prev => {
      const existente = prev.find(c => c.id === item.id);
      if (existente) {
        return prev.map(c =>
          c.id === item.id ? { ...c, cantidad: c.cantidad + 1 } : c
        );
      }
      return [...prev, {
        id: item.id,
        nombre: item.nombre,
        precio: item.precio,
        cantidad: 1,
        categoria: item.categoria,
      }];
    });
  };

  const quitarDelCarrito = (id: number) => {
    setCarrito(prev => prev.filter(c => c.id !== id));
  };

  const actualizarCantidad = (id: number, cantidad: number) => {
    if (cantidad <= 0) {
      quitarDelCarrito(id);
    } else {
      setCarrito(prev =>
        prev.map(c => (c.id === id ? { ...c, cantidad } : c))
      );
    }
  };

  const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  const validarFormulario = () => {
    const errors: Record<string, string> = {};

    if (!formData.nombre_cliente.trim()) {
      errors.nombre_cliente = 'El nombre es requerido';
    }
    if (!formData.telefono || formData.telefono.length < 7) {
      errors.telefono = 'Teléfono es requerido. Mínimo 7 dígitos.';
    }
    if (formData.tipo === 'Comer en Mesa' && !formData.mesa) {
      errors.mesa = 'Debe seleccionar una mesa';
    }
    if (formData.tipo === 'Para Retirar' && !formData.fecha_hora_retiro) {
      errors.fecha_hora_retiro = 'Debe especificar fecha y hora de retiro';
    }
    if (carrito.length === 0) {
      errors.carrito = 'El carrito está vacío';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setLoading(true);
    try {
      const ordenData = {
        nombre_cliente: formData.nombre_cliente,
        telefono: formData.telefono,
        tipo: formData.tipo,
        mesa: formData.tipo === 'Comer en Mesa' ? formData.mesa : null,
        fecha_hora_retiro: formData.tipo === 'Para Retirar' ? formData.fecha_hora_retiro : null,
      };

      const ordenRes = await apiClient.createOrden(ordenData);
      if (!ordenRes.success) {
        setError(ordenRes.error || 'Error al crear orden');
        return;
      }

      const ordenId = ordenRes.data.id;
      const items = carrito.map(item => ({
        item_menu_id: item.id,
        cantidad: item.cantidad,
      }));

      const itemsRes = await apiClient.agregarItemsOrden(ordenId, items);
      if (itemsRes.success) {
        // Guardar ID en sessionStorage si el usuario no está autenticado
        const token = apiClient.getToken();
        if (!token) {
          sessionStorage.setItem('guestOrdenId', ordenId);
        }
        navigate(`/ordenes/${ordenId}`);
      } else {
        setError(itemsRes.error || 'Error al agregar items');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Hacer Orden</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu */}
          <div className="lg:col-span-2">
            {/* Tabs de categorías */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categorias.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoriaSeleccionada(cat)}
                  className={`px-4 py-2 rounded font-semibold transition ${
                    categoriaSeleccionada === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Items del menú */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {itemsPorCategoria.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-gray-50 rounded">
                  <p className="text-gray-600">No hay items disponibles en esta categoría</p>
                </div>
              ) : (
                itemsPorCategoria.map(item => (
                  <div key={item.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
                    <h3 className="text-xl font-bold text-gray-800">{item.nombre}</h3>
                    <p className="text-gray-600 text-sm mt-1">{item.descripcion}</p>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-2xl font-bold text-blue-600">${(typeof item.precio === 'string' ? Number.parseFloat(item.precio) : item.precio).toFixed(2)}</span>
                      <button
                        onClick={() => agregarAlCarrito(item)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition"
                      >
                        + Agregar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Carrito (Sticky) */}
          <div className="lg:sticky lg:top-4 h-fit">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🛒 Carrito</h2>

              {carrito.length === 0 ? (
                <p className="text-gray-600 mb-4">El carrito está vacío</p>
              ) : (
                <div className="mb-4">
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {carrito.map(item => (
                      <div key={item.id} className="flex justify-between items-center border-b pb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-700">{item.nombre}</p>
                          <p className="text-gray-500 text-sm">${(typeof item.precio === 'string' ? Number.parseFloat(item.precio) : item.precio).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                            className="bg-red-200 hover:bg-red-300 text-red-700 px-2 py-1 rounded text-sm"
                          >
                            -
                          </button>
                          <span className="font-bold w-6 text-center">{item.cantidad}</span>
                          <button
                            onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                            className="bg-green-200 hover:bg-green-300 text-green-700 px-2 py-1 rounded text-sm"
                          >
                            +
                          </button>
                          <button
                            onClick={() => quitarDelCarrito(item.id)}
                            className="ml-2 text-red-600 hover:text-red-800 font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-3 mb-4">
                    <div className="flex justify-between font-bold text-lg text-gray-800">
                      <span>Total:</span>
                      <span className="text-blue-600">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {formErrors.carrito && (
                <p className="text-red-600 text-sm mb-2">{formErrors.carrito}</p>
              )}

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={formData.nombre_cliente}
                  onChange={(e) => setFormData({ ...formData, nombre_cliente: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white text-gray-900"
                />
                {formErrors.nombre_cliente && (
                  <p className="text-red-600 text-xs">{formErrors.nombre_cliente}</p>
                )}

                <input
                  type="tel"
                  placeholder="Teléfono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white text-gray-900"
                />
                {formErrors.telefono && (
                  <p className="text-red-600 text-xs">{formErrors.telefono}</p>
                )}

                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white text-gray-900"
                >
                  <option value="Para Retirar">Para Retirar</option>
                  <option value="Comer en Mesa">Comer en Mesa</option>
                </select>

                {formData.tipo === 'Comer en Mesa' && (
                  <>
                    <select
                      value={formData.mesa || ''}
                      onChange={(e) => setFormData({ ...formData, mesa: Number.parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white text-gray-900"
                    >
                      <option value="">Seleccionar Mesa</option>
                      {mesas.map(mesa => (
                        <option key={mesa.id} value={mesa.id}>
                          Mesa {mesa.numero} ({mesa.capacidad} personas)
                        </option>
                      ))}
                    </select>
                    {formErrors.mesa && (
                      <p className="text-red-600 text-xs">{formErrors.mesa}</p>
                    )}
                  </>
                )}

                {formData.tipo === 'Para Retirar' && (
                  <>
                    <input
                      type="datetime-local"
                      value={formData.fecha_hora_retiro || ''}
                      onChange={(e) => setFormData({ ...formData, fecha_hora_retiro: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white text-gray-900"
                    />
                    {formErrors.fecha_hora_retiro && (
                      <p className="text-red-600 text-xs">{formErrors.fecha_hora_retiro}</p>
                    )}
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading || carrito.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 rounded transition"
                >
                  {loading ? 'Procesando...' : `Confirmar Orden - $${total.toFixed(2)}`}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrdenForm;
