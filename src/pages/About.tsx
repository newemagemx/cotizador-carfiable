
import React from 'react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center mb-8">Acerca de Carfiable</h1>
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <p className="mb-4">
            Carfiable es una plataforma que facilita la compra y venta de vehículos usados, 
            proporcionando valoraciones confiables y servicios que garantizan transacciones seguras.
          </p>
          <p className="mb-4">
            Nuestra misión es transformar el mercado de autos usados en México, aportando 
            transparencia y confianza en cada transacción.
          </p>
          <div className="mt-6">
            <Link to="/" className="text-blue-600 hover:underline">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
