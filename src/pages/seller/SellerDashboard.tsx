
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, CarFront, Gauge, Clock } from 'lucide-react';

const SellerDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Panel de Vendedor</h1>
          <Button>
            <Link to="/seller/valuation" className="flex items-center">
              <PlusCircle className="h-4 w-4 mr-2" />
              Publicar vehículo
            </Link>
          </Button>
        </div>
        
        <Tabs defaultValue="listings" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="listings">Mis vehículos</TabsTrigger>
            <TabsTrigger value="offers">Ofertas recibidas</TabsTrigger>
            <TabsTrigger value="appointments">Citas</TabsTrigger>
            <TabsTrigger value="valuation">Valoraciones</TabsTrigger>
          </TabsList>
          
          <TabsContent value="listings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CarFront className="h-5 w-5 mr-2" />
                  Mis vehículos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No has publicado ningún vehículo todavía.</p>
                  <Button>
                    <Link to="/seller/valuation" className="flex items-center">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Publicar mi primer vehículo
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="offers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gauge className="h-5 w-5 mr-2" />
                  Ofertas recibidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">
                  No has recibido ofertas todavía. Publica un vehículo para comenzar.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Citas programadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">
                  No tienes citas programadas.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="valuation">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gauge className="h-5 w-5 mr-2" />
                  Valoraciones guardadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">
                  No has guardado ninguna valoración.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6">
          <Link to="/" className="text-blue-600 hover:underline">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
