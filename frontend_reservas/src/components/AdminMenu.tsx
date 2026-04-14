import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import ConfirmModal from './ConfirmModal';

interface MenuItem {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string | number;
  categoria: string;
  disponible: boolean;
}

function AdminMenu() {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<MenuItem>>({});
  const [showForm, setShowForm] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [newItem, setNewItem] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: 'Bebidas',
  });

  const categorias = ['Bebidas', 'Hamburguesas', 'Pizzas', 'Hot Dogs', 'Postres'];

  // Filtrar items según categoría seleccionada
  const itemsFiltrados = selectedCategoria
    ? menuItems.filter(item => item.categoria === selectedCategoria)
    : menuItems;

  useEffect(() => {
    cargarMenu();
  }, []);

  const cargarMenu = async () => {
    setLoading(true);
    try {
      console.log('📡 Cargando menú...');
      const response = await apiClient.getMenu();
      console.log('📥 Respuesta menú:', response);
      if (response.success && response.data) {
        const menuArr = response.data.results || response.data;
        setMenuItems(Array.isArray(menuArr) ? menuArr : []);
      } else {
        setError(response.error || 'Error al cargar menú');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setFormData({
      nombre: item.nombre,
      descripcion: item.descripcion,
      precio: item.precio,
      categoria: item.categoria,
      disponible: item.disponible,
    });
  };

  const handleSave = async () => {
    if (!editingId) return;

    setLoading(true);
    try {
      console.log('📡 Actualizando item...');
      const response = await apiClient.updateMenuItem(editingId, formData);
      if (response.success) {
        console.log('✅ Item actualizado');
        setEditingId(null);
        setFormData({});
        cargarMenu();
      } else {
        setError(response.error || 'Error al actualizar item');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.nombre || !newItem.precio) {
      setError('Completa los campos requeridos');
      return;
    }

    try {
      console.log('📡 Creando nuevo item del menú...');
      const response = await apiClient.createMenuItem({
        nombre: newItem.nombre,
        descripcion: newItem.descripcion,
        precio: parseFloat(newItem.precio),
        categoria: newItem.categoria,
        disponible: true,
      });

      if (response.success) {
        console.log('✅ Item creado');
        setNewItem({ nombre: '', descripcion: '', precio: '', categoria: 'Bebidas' });
        setShowForm(false);
        cargarMenu();
      } else {
        setError(response.error || 'Error al crear item');
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDeleteItem = (id: number) => {
    setItemToDelete(id);
    setShowConfirm(true);
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      console.log('📡 Eliminando item...');
      const response = await apiClient.deleteMenuItem(itemToDelete);
      if (response.success) {
        console.log('✅ Item eliminado');
        setShowConfirm(false);
        setItemToDelete(null);
        cargarMenu();
      } else {
        setError(response.error || 'Error al eliminar item');
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              ← Volver
            </button>
            <h1 className="text-4xl font-bold text-gray-800">📋 Gestión del Menú</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            {showForm ? '✕ Cerrar' : '➕ Agregar Item'}
          </button>
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

        {/* Formulario para agregar nuevo item */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Nuevo Item del Menú</h2>
            <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Nombre *</label>
                <input
                  type="text"
                  value={newItem.nombre}
                  onChange={(e) => setNewItem({ ...newItem, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Nombre del item"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Categoría *</label>
                <select
                  value={newItem.categoria}
                  onChange={(e) => setNewItem({ ...newItem, categoria: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Precio *</label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.precio}
                  onChange={(e) => setNewItem({ ...newItem, precio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Descripción</label>
                <input
                  type="text"
                  value={newItem.descripcion}
                  onChange={(e) => setNewItem({ ...newItem, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Descripción del item"
                />
              </div>

              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg disabled:opacity-50 transition"
                >
                  {loading ? 'Guardando...' : '💾 Guardar'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 rounded-lg transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de items del menú */}
        {loading ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">Cargando menú...</p>
          </div>
        ) : (
          <>
            {/* Filtros por Categoría */}
            <div className="mb-8 flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategoria(null)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  selectedCategoria === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📋 Todos ({menuItems.length})
              </button>
              {categorias.map((cat) => {
                const count = menuItems.filter(item => item.categoria === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoria(cat)}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      selectedCategoria === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {itemsFiltrados.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-lg p-6">
                {editingId === item.id ? (
                  /* Modo Edición */
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={formData.nombre || ''}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="Nombre"
                    />
                    <textarea
                      value={formData.descripcion || ''}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="Descripción"
                      rows={2}
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={formData.precio || ''}
                      onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="Precio"
                    />
                    <select
                      value={formData.categoria || ''}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      {categorias.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.disponible ?? true}
                        onChange={(e) => setFormData({ ...formData, disponible: e.target.checked })}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="ml-2 text-gray-700">Disponible</span>
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg disabled:opacity-50 transition"
                      >
                        💾 Guardar
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 rounded-lg transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Modo Vista */
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{item.nombre}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        item.disponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.disponible ? '✓ Disponible' : '✕ No disponible'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{item.descripcion}</p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold text-blue-600">${item.precio}</span>
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                        {item.categoria}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            </div>

            {itemsFiltrados.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  {selectedCategoria
                    ? `No hay items en la categoría "${selectedCategoria}"`
                    : 'No hay items en el menú'}
                </p>
              </div>
            )}
          </>
        )}

      <ConfirmModal
        isOpen={showConfirm}
        title="Eliminar Item del Menú"
        message="¿Estás seguro de que deseas eliminar este item? Esta acción no se puede deshacer."
        isDangerous={true}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDeleteItem}
        onCancel={() => setShowConfirm(false)}
      />
      </div>
    </div>
  );
}

export default AdminMenu;
