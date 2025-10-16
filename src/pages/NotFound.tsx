import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleGoHome = () => {
    if (isAuthenticated && user) {
      // Si está autenticado, redirigir al dashboard apropiado según el rol
      if (user.role === 'student') {
        navigate('/dashboard/student');
      } else if (user.role === 'organization') {
        navigate('/dashboard/organization');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } else {
      // Si no está autenticado, ir al landing page
      navigate('/');
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            404
          </CardTitle>
          <CardDescription className="text-lg">
            Página no encontrada
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Lo siento, la página que estás buscando no existe o ha sido movida.
          </p>
          
          <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg font-mono break-all">
            Ruta solicitada: {location.pathname}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={handleGoBack}
              variant="outline" 
              className="flex-1 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            
            <Button 
              onClick={handleGoHome}
              className="flex-1 flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              {isAuthenticated ? 'Ir al Dashboard' : 'Ir al Inicio'}
            </Button>
          </div>
          
          {isAuthenticated && user && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg text-sm text-blue-700 dark:text-blue-300">
              <p>👋 Hola {user.email}</p>
              <p>Rol: {user.role}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
