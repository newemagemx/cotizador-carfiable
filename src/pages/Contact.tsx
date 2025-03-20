
import React from 'react';
import { Link } from 'react-router-dom';

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center mb-8">Contacto</h1>
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <p className="mb-4 text-center">
            ¿Tienes preguntas o comentarios? Estamos aquí para ayudarte.
          </p>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center">
              <span className="font-medium mr-2">Email:</span>
              <a href="mailto:contacto@carfiable.com" className="text-blue-600 hover:underline">
                contacto@carfiable.com
              </a>
            </li>
            <li className="flex items-center">
              <span className="font-medium mr-2">Teléfono:</span>
              <a href="tel:+525512345678" className="text-blue-600 hover:underline">
                +52 55 1234 5678
              </a>
            </li>
          </ul>
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

export default Contact;
