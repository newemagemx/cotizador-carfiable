
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Car, DollarSign, Calendar, BarChart4 } from "lucide-react";

const SellerIndex: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Carfiable</h1>
              <span className="ml-2 text-sm font-medium bg-blue-100 text-blue-800 py-1 px-2 rounded-md">
                Vendedores
              </span>
            </div>
            <nav className="flex space-x-4">
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                Cotizador
              </Link>
              <Link to="/seller" className="text-blue-600 hover:text-blue-900 font-medium">
                Vendedores
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <section className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6 sm:p-8 md:p-10 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Vende tu auto con Carfiable
            </h2>
            <p className="text-lg mb-6 max-w-2xl">
              Obtén una valoración inmediata de tu vehículo, publica tu anuncio de forma profesional 
              y conecta con compradores interesados.
            </p>
            <Link to="/seller/valuation">
              <Button size="lg" className="bg-white text-blue-800 hover:bg-gray-100">
                Comenzar ahora
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Car className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Valoración Profesional</h3>
              <p className="text-gray-600">
                Obtén una valoración precisa de tu auto basada en el mercado actual y sus características.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Precios Competitivos</h3>
              <p className="text-gray-600">
                Elige entre diferentes estrategias de precio según tus prioridades de venta.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Citas sin Complicaciones</h3>
              <p className="text-gray-600">
                Programa citas con compradores interesados directamente desde nuestra plataforma.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">¿Cómo funciona?</h2>
          
          <div className="space-y-6 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">
                1
              </div>
              <div>
                <h3 className="text-lg font-medium mb-1">Valora tu auto</h3>
                <p className="text-gray-600">
                  Ingresa los datos de tu vehículo para obtener una valoración automática basada en el mercado.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">
                2
              </div>
              <div>
                <h3 className="text-lg font-medium mb-1">Crea tu anuncio</h3>
                <p className="text-gray-600">
                  Sube fotos, documentos y completa la información de tu vehículo.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">
                3
              </div>
              <div>
                <h3 className="text-lg font-medium mb-1">Agenda una cita para captura profesional</h3>
                <p className="text-gray-600">
                  Programa una cita para que nuestro equipo realice una captura profesional de tu vehículo.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">
                4
              </div>
              <div>
                <h3 className="text-lg font-medium mb-1">Gestiona las citas con compradores</h3>
                <p className="text-gray-600">
                  Recibe solicitudes de cita y coordina las visitas con los compradores interesados.
                </p>
              </div>
            </div>
          </div>
          
          <Link to="/seller/valuation">
            <Button className="w-full sm:w-auto">Valorar mi auto ahora</Button>
          </Link>
        </section>

        <section className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">¿Por qué elegir Carfiable?</h2>
            <BarChart4 className="h-8 w-8 text-blue-600" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">Proceso Profesional</h3>
              <p className="text-gray-600">
                Contamos con un equipo de profesionales que te acompañarán durante todo el proceso de venta.
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">Compradores Verificados</h3>
              <p className="text-gray-600">
                Los interesados son verificados para garantizar tu seguridad durante el proceso.
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">Visibilidad Garantizada</h3>
              <p className="text-gray-600">
                Tu anuncio tendrá visibilidad en nuestro catálogo y en nuestras campañas de marketing.
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">Notificaciones en Tiempo Real</h3>
              <p className="text-gray-600">
                Recibe alertas por WhatsApp sobre nuevas solicitudes, citas y actividad de tu anuncio.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white mt-12 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="font-bold text-lg">Carfiable</p>
              <p className="text-gray-400 text-sm">La forma más segura de vender tu auto</p>
            </div>
            <div className="flex space-x-6">
              <Link to="/" className="text-gray-300 hover:text-white">
                Cotizador
              </Link>
              <Link to="/seller" className="text-gray-300 hover:text-white">
                Vendedores
              </Link>
              <a href="#" className="text-gray-300 hover:text-white">
                Contacto
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} Carfiable. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SellerIndex;
