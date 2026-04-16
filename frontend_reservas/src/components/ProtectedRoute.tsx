import { type ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { apiClient } from '../services/api';

interface ProtectedRouteProps {
  readonly children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔐 Verificando autenticación...');
        const response = await apiClient.getCurrentUser();
        console.log('📥 Respuesta auth:', response);
        
        // Verificar si hay usuario autenticado en los diferentes formatos posibles
        const userData = response.data?.user || 
                        response.data?.data?.user || 
                        response.data?.authenticated;
        
        if (response.success && userData) {
          console.log('✅ Usuario autenticado:', userData.username || 'Usuario detectado');
          setIsAuthenticated(true);
        } else {
          console.log('❌ No autenticado - no hay user en response');
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('❌ Error verificando auth:', err);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Mientras verifica, muestra loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirige a login
  if (!isAuthenticated) {
    console.log('🚫 No autenticado, redirigiendo a /login');
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, muestra el contenido
  return <>{children}</>;
}

export default ProtectedRoute;
