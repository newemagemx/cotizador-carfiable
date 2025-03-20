
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const Register: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Crear Cuenta</CardTitle>
          <CardDescription className="text-center">
            Regístrate para comenzar a usar Carfiable
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input id="name" type="text" placeholder="Juan Pérez" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" placeholder="ejemplo@correo.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input id="confirmPassword" type="password" />
            </div>
            <Button type="submit" className="w-full">
              Registrarse
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link to="/login" className="text-blue-600 hover:underline text-sm">
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
          </div>
          <div className="mt-2 text-center">
            <Link to="/" className="text-gray-500 hover:underline text-sm">
              Volver al inicio
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
