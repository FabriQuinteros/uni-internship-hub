/**
 * @fileoverview Página de registro de organizaciones
 * Esta página implementa la vista completa para el registro de nuevas organizaciones,
 * incluyendo el formulario y el layout general de la página.
 * 
 * La página está diseñada para ser accesible desde:
 * 1. El enlace "Registrar organización" en la página de login
 * 2. Navegación directa a /auth/register-organization
 */

import { Link } from 'react-router-dom';
import { BookOpen, Building, ArrowLeft, CheckCircle } from 'lucide-react';
import { OrganizationRegisterForm } from '@/components/auth/OrganizationRegisterForm';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HeroButton } from '@/components/ui/button-variants';

/**
 * Componente de la página de registro de organizaciones
 * Proporciona un contenedor con estilos y layout para el formulario,
 * siguiendo el diseño y estilo de la landing page
 * 
 * @returns {JSX.Element} Página completa de registro
 */
export default function RegisterOrganization() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">PasantíasUNI</span>
          </Link>
          <Link to="/auth/organization">
            <HeroButton variant="secondary" className="text-secondary-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al login
            </HeroButton>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <Building className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Registro de Organización
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Únete a nuestra red de empresas y conecta con talento universitario
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="relative overflow-hidden shadow-hero">
              <div className="absolute inset-0 bg-gradient-card opacity-50" />
              <CardHeader className="relative">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-2xl text-foreground">
                    Información de la Organización
                  </CardTitle>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    Registro Nuevo
                  </Badge>
                </div>
                <CardDescription className="text-base">
                  Complete el formulario con los datos de su organización
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="grid md:grid-cols-3 gap-8 mb-8">
                  {[
                    'Perfil empresarial completo',
                    'Publicación de ofertas',
                    'Gestión de candidatos'
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                <OrganizationRegisterForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

    </div>
  );
}
