import { NavLink, useLocation } from "react-router-dom";
import {
  BookOpen,
  Home,
  User,
  FileText,
  Send,
  Heart,
  Building,
  Users,
  Settings,
  BarChart3,
  Shield,
  Database,
  GraduationCap
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  userRole: 'student' | 'organization' | 'admin';
}

const navigationItems = {
  student: [
    {
      title: "Dashboard",
      url: "/student/dashboard",
      icon: Home,
      description: "Vista general"
    },
    {
      title: "Mi Perfil",
      url: "/student/profile",
      icon: User,
      description: "Información personal"
    },
    {
      title: "Ofertas",
      url: "/student/offers",
      icon: FileText,
      description: "Buscar pasantías"
    },
    {
      title: "Mis Postulaciones",
      url: "/student/applications",
      icon: Send,
      description: "Estado de aplicaciones"
    },
    {
      title: "Favoritos",
      url: "/student/favorites",
      icon: Heart,
      description: "Ofertas guardadas"
    }
  ],
  organization: [
    {
      title: "Dashboard",
      url: "/organization/dashboard",
      icon: Home,
      description: "Vista general"
    },
    {
      title: "Perfil Empresa",
      url: "/organization/profile",
      icon: Building,
      description: "Información corporativa"
    },
    {
      title: "Mis Ofertas",
      url: "/organization/offers",
      icon: FileText,
      description: "Gestionar publicaciones"
    },
    {
      title: "Postulaciones",
      url: "/organization/applications",
      icon: Users,
      description: "Candidatos recibidos"
    },
    {
      title: "Estadísticas",
      url: "/organization/analytics",
      icon: BarChart3,
      description: "Métricas y reportes"
    }
  ],
  admin: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: Home,
      description: "Vista general del sistema"
    },
    {
      title: "Gestión de Usuarios",
      url: "/admin/users",
      icon: Users,
      description: "Estudiantes y organizaciones"
    },
    {
      title: "Aprobación de Ofertas",
      url: "/admin/approval",
      icon: Shield,
      description: "Revisar publicaciones"
    },
    {
      title: "Configuración",
      url: "/admin/catalogs",
      icon: Settings,
      description: "Parámetros del sistema"
    }
  ]
};

export function AppSidebar({ userRole }: AppSidebarProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  const items = navigationItems[userRole];
  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + '/');

  const roleInfo = {
    student: { icon: GraduationCap, title: "Estudiante", color: "text-primary" },
    organization: { icon: Building, title: "Organización", color: "text-secondary" },
    admin: { icon: Shield, title: "Administrador", color: "text-warning" }
  };

  const RoleIcon = roleInfo[userRole].icon;

  return (
    <Sidebar collapsible="icon">
      {/* Header */}
      <div className="p-2 border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-sidebar-accent shrink-0">
            <BookOpen className="h-5 w-5 text-sidebar-foreground" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-sidebar-foreground">PasantíasUNI</span>
            <div className="flex items-center gap-1">
              <RoleIcon className={`h-3 w-3 ${roleInfo[userRole].color}`} />
              <span className="text-xs text-sidebar-foreground/70">{roleInfo[userRole].title}</span>
            </div>
          </div>
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.url);
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={active}
                      tooltip={item.title}
                      size="lg"
                    >
                      <NavLink to={item.url}>
                        <Icon />
                        <div className="flex flex-col gap-0.5 leading-none">
                          <span className="font-medium">{item.title}</span>
                          <span className="text-xs opacity-70">{item.description}</span>
                        </div>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with collapse trigger */}
      <div className="mt-auto border-t border-sidebar-border p-2">
        <SidebarTrigger className="w-full" />
      </div>
    </Sidebar>
  );
}