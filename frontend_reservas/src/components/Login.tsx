import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log('📡 [Login] Enviando credenciales...');
      const response = await apiClient.login(username, password);
      
      console.log('📥 [Login] Respuesta completa:', response);
      console.log('📥 [Login] Success:', response.success);
      console.log('📥 [Login] Data:', response.data);

      if (!response.success) {
        setError(response.error || 'Error desconocido en login');
        console.error('❌ [Login] Fallo:', response.error);
        return;
      }

      // Acceder a los datos del usuario
      const userData = response.data?.user || response.data?.data?.user;
      
      if (!userData) {
        setError('No se recibió información del usuario');
        console.error('❌ [Login] Sin datos de usuario');
        return;
      }

      console.log('✅ [Login] Login exitoso, usuario:', userData.username);
      console.log('🔄 [Login] Es admin?', userData.is_staff, userData.is_superuser);
      
      // Esperar un poco para que se establezca la cookie
      setTimeout(() => {
        console.log('🔄 [Login] Navegando a /admin/dashboard...');
        navigate('/admin/dashboard', { replace: true });
      }, 500);
      
    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg);
      console.error('❌ [Login] Exception:', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🍽️ El Sabor</h1>
          <h2 className="text-xl font-semibold text-gray-600 mt-2">Panel Administrativo</h2>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p className="font-semibold">❌ {error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
              Usuario
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-900"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-900"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors mt-6"
          >
            {loading ? '🔄 Iniciando sesión...' : '✓ Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-gray-600">
          <p className="font-semibold mb-2">Demo:</p>
          <p>Usuario: <code className="bg-gray-200 px-2 py-1 rounded">admin</code></p>
          <p>Contraseña: <code className="bg-gray-200 px-2 py-1 rounded">admin123</code></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
