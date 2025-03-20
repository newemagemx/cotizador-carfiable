
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="listings">Mis anuncios</TabsTrigger>
            <TabsTrigger value="messages">Mensajes</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Actividad reciente</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">No hay actividad reciente.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Resumen de anuncios</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">No tienes anuncios activos.</p>
                  <Button className="mt-4">
                    <Link to="/seller/valuation">Publicar un vehículo</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="listings">
            <Card>
              <CardHeader>
                <CardTitle>Mis anuncios</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">No has publicado ningún anuncio todavía.</p>
                <Button className="mt-4">
                  <Link to="/seller/valuation">Publicar un vehículo</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Mensajes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">No tienes mensajes.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de la cuenta</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Próximamente opciones de configuración.</p>
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

export default Dashboard;
