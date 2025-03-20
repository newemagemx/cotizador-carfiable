
import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center mb-8">Bienvenido a Carfiable</h1>
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Opciones disponibles</h2>
            <ul className="space-y-3">
              <li>
                <Link to="/seller/valuation" className="block p-3 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition">
                  Valorar mi vehículo
                </Link>
              </li>
              <li>
                <Link to="/about" className="block p-3 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition">
                  Acerca de Carfiable
                </Link>
              </li>
              <li>
                <Link to="/contact" className="block p-3 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
