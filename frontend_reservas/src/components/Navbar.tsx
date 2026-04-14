import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold hover:text-blue-200 transition">
          🍽️ El Sabor
        </Link>
        <Link
          to="/login"
          className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-2 rounded font-semibold transition"
        >
          🔐 Iniciar Sesión
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
