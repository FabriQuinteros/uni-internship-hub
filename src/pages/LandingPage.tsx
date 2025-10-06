import { useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Building, Users, BookOpen, ArrowRight, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeroButton, AcademicButton } from "@/components/ui/button-variants";
import heroImage from "@/assets/hero-internships.jpg";

const LandingPage = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const roles = [
    {
      icon: GraduationCap,
      title: "Estudiantes",
      description: "Encuentra pasantías que impulsen tu carrera profesional",
      features: ["Perfil académico completo", "Postulación a ofertas", "Seguimiento de aplicaciones"],
      link: "/auth/student"
    },
    {
      icon: Building,
      title: "Organizaciones",
      description: "Conecta con el mejor talento universitario",
      features: ["Publicación de ofertas", "Gestión de candidatos", "Proceso de selección"],
      link: "/auth/organization"
    }
  ];

  const stats = [
    { number: "500+", label: "Estudiantes activos" },
    { number: "120+", label: "Organizaciones" },
    { number: "350+", label: "Pasantías completadas" },
    { number: "95%", label: "Tasa de satisfacción" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">PasantíasUNI</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#roles" className="text-muted-foreground hover:text-primary transition-colors">
              Roles
            </a>
            <a href="#estadisticas" className="text-muted-foreground hover:text-primary transition-colors">
              Estadísticas
            </a>
            <AcademicButton variant="outline">
              Iniciar Sesión
            </AcademicButton>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative container mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Sistema de Gestión de
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">
              Pasantías Universitarias
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            Conectamos estudiantes de Ingeniería en Sistemas con oportunidades profesionales 
            que transforman su futuro académico y laboral
          </p>
          {/* Botones de acción principales */}
          {/* Estos botones son los CTA (Call To Action) principales de la landing page */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Botón primario para estudiantes */}
            <HeroButton variant="primary">
              Explorar Oportunidades
              <ArrowRight className="ml-2 h-5 w-5" />
            </HeroButton>
            {/* Botón de registro de organizaciones
                Este botón redirige directamente al formulario de registro
                usando React Router para mantener la navegación SPA */}
            <Link to="/auth/register-organization">
              <HeroButton variant="secondary">
                Registrar Organización
              </HeroButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              ¿Cómo quieres participar?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Nuestro sistema está diseñado para dos tipos de usuarios, cada uno con herramientas específicas
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {roles.map((role, index) => {
              const Icon = role.icon;
              return (
                <Card
                  key={index}
                  className={`relative overflow-hidden transition-all duration-500 cursor-pointer group h-full ${
                    hoveredCard === index ? 'scale-105 shadow-hero' : 'shadow-card'
                  }`}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="absolute inset-0 bg-gradient-card" />
                  <CardHeader className="relative pb-6">
                    <div className="flex items-center justify-between mb-6">
                      <Icon className={`h-16 w-16 transition-colors duration-300 ${
                        hoveredCard === index ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-sm px-3 py-1">
                        Acceso Directo
                      </Badge>
                    </div>
                    <CardTitle className="text-3xl text-foreground mb-3">{role.title}</CardTitle>
                    <CardDescription className="text-lg leading-relaxed">{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="relative pt-0">
                    <ul className="space-y-4 mb-8">
                      {role.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                          <span className="text-muted-foreground text-base">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to={role.link}>
                      <HeroButton 
                        variant="primary" 
                        size="lg"
                        className="w-full group-hover:shadow-floating text-lg py-4"
                      >
                        Comenzar
                      </HeroButton>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="estadisticas" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Resultados que Importan
            </h2>
            <p className="text-xl text-muted-foreground">
              Números que reflejan el impacto de nuestro sistema
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground text-lg">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
                <span className="font-bold text-foreground">PasantíasUNI</span>
              </div>
              <p className="text-muted-foreground">
                Sistema institucional para la gestión de pasantías de Ingeniería en Sistemas.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Estudiantes</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Crear perfil</li>
                <li>Buscar pasantías</li>
                <li>Postular ofertas</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Organizaciones</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Registrar empresa</li>
                <li>Publicar ofertas</li>
                <li>Gestionar candidatos</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Soporte</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Ayuda</li>
                <li>Documentación</li>
                <li>Contacto</li>
              </ul>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default LandingPage;