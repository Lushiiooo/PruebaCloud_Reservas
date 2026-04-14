import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">
      {/* Hero Section */}
      <div className="min-h-screen flex flex-col justify-center items-center text-center px-4">
        <h1 className="text-6xl font-bold text-white mb-4">🍽️ El Sabor</h1>
        <p className="text-2xl text-blue-100 mb-8 max-w-2xl">
          Bienvenido a El Sabor Restaurante. Reserva tu mesa o haz tu pedido ahora.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {/* Botón Reservar Mesa */}
          <Link
            to="/reservas/nueva"
            className="bg-white hover:bg-gray-100 text-blue-600 font-bold py-6 px-12 rounded-lg shadow-lg transition transform hover:scale-105"
          >
            <div className="text-4xl mb-2">🪑</div>
            <div>Reserva tu Mesa</div>
            <p className="text-sm text-gray-600 mt-2">Elige tu mesa y horario</p>
          </Link>

          {/* Botón Hacer Orden */}
          <Link
            to="/ordenes/nueva"
            className="bg-white hover:bg-gray-100 text-blue-600 font-bold py-6 px-12 rounded-lg shadow-lg transition transform hover:scale-105"
          >
            <div className="text-4xl mb-2">🛒</div>
            <div>Hacer Orden</div>
            <p className="text-sm text-gray-600 mt-2">Elige tus platos favoritos</p>
          </Link>
        </div>
      </div>

      {/* Características */}
      <div className="bg-white py-16">
        <div className="w-full px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            ¿Por qué elegir El Sabor?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Rápido</h3>
              <p className="text-gray-600">
                Reserva tu mesa o haz tu pedido en segundos
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl mb-4">🍴</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Delicioso</h3>
              <p className="text-gray-600">
                Comida fresca y de excelente calidad
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl mb-4">😊</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Confiable</h3>
              <p className="text-gray-600">
                Servicio amable y profesional
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Menú Preview */}
      <div className="bg-gray-50 py-16">
        <div className="w-full px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            Nuestro Menú
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-center">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-3xl mb-2">🍔</div>
              <p className="font-bold text-gray-800">Hamburguesas</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-3xl mb-2">🍕</div>
              <p className="font-bold text-gray-800">Pizzas</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-3xl mb-2">🌭</div>
              <p className="font-bold text-gray-800">Hot Dogs</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-3xl mb-2">🥤</div>
              <p className="font-bold text-gray-800">Bebidas</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-3xl mb-2">🍰</div>
              <p className="font-bold text-gray-800">Postres</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/ordenes/nueva"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition"
            >
              Ver Menú Completo →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
