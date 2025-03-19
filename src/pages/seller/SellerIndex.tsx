
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Car, DollarSign, Tag } from 'lucide-react';

const SellerIndex: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Portal de Vendedores</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Bienvenido a nuestro servicio para vendedores. Valúa tu auto en minutos y recibe ofertas de compradores verificados.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-blue-100 shadow-sm">
          <CardHeader className="pb-2">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <Car className="w-6 h-6 text-blue-700" />
            </div>
            <CardTitle>Valúa tu Auto</CardTitle>
            <CardDescription>
              Obtén una valoración precisa de tu vehículo basada en datos de mercado en tiempo real
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="mr-2 mt-0.5">•</span>
                <span>Valoración gratuita en menos de 2 minutos</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-0.5">•</span>
                <span>Basada en miles de transacciones recientes</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-0.5">•</span>
                <span>Opciones de precio según tus necesidades de venta</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => navigate('/seller/valuation')}>
              Valuar mi auto
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-green-100 shadow-sm">
          <CardHeader className="pb-2">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
              <DollarSign className="w-6 h-6 text-green-700" />
            </div>
            <CardTitle>Vende rápido y seguro</CardTitle>
            <CardDescription>
              Conecta con compradores verificados y recibe ofertas en tiempo récord
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="mr-2 mt-0.5">•</span>
                <span>Sin intermediarios ni comisiones ocultas</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-0.5">•</span>
                <span>Compradores pre-verificados y serios</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-0.5">•</span>
                <span>Asistencia personalizada durante todo el proceso</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate('/auth')}>
              Acceder a mi cuenta
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-12 bg-muted/50 p-6 rounded-lg">
        <div className="flex items-center mb-4">
          <Tag className="w-5 h-5 mr-2 text-primary" />
          <h3 className="text-lg font-medium">¿Por qué elegirnos?</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-background p-4 rounded-md shadow-sm">
            <h4 className="font-medium mb-2">Valoración justa</h4>
            <p className="text-sm text-muted-foreground">
              Utilizamos algoritmos avanzados para determinar el valor real de tu auto en el mercado actual.
            </p>
          </div>
          <div className="bg-background p-4 rounded-md shadow-sm">
            <h4 className="font-medium mb-2">Proceso simplificado</h4>
            <p className="text-sm text-muted-foreground">
              Todo el proceso de venta es rápido, transparente y sin complicaciones burocráticas.
            </p>
          </div>
          <div className="bg-background p-4 rounded-md shadow-sm">
            <h4 className="font-medium mb-2">Seguridad garantizada</h4>
            <p className="text-sm text-muted-foreground">
              Verificamos a todos los compradores y facilitamos un proceso seguro de pago y transferencia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerIndex;
