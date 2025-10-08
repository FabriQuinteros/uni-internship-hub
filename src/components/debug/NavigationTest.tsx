// Componente de prueba para verificar navegación SPA
import React from 'react';
import { useLocation } from 'react-router-dom';

const NavigationTest: React.FC = () => {
  const location = useLocation();
  
  React.useEffect(() => {
    console.log('🔄 Navegación SPA funcionando - Ruta actual:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <p className="text-green-800">
        ✅ Navegación SPA activa - Ruta: <code className="bg-green-100 px-2 py-1 rounded">{location.pathname}</code>
      </p>
      <p className="text-sm text-green-600 mt-2">
        Si ves este mensaje, la navegación no está recargando toda la página.
      </p>
    </div>
  );
};

export default NavigationTest;