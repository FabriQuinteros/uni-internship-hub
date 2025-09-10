import { useState } from "react";
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
  useSidebar,
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
      title: "Catálogos",
      url: "/admin/catalogs",
      icon: Database,
      description: "Tecnologías y habilidades"
    },
    {
      title: "Configuración",
      url: "/admin/settings",
      icon: Settings,
      description: "Parámetros del sistema"
    },
    {
      title: "Reportes",
      url: "/admin/reports",
      icon: BarChart3,
      description: "Estadísticas generales"
    }
  ]
};

export function AppSidebar({ userRole }: AppSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const items = navigationItems[userRole];
  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + '/');

  const roleInfo = {
    student: { icon: GraduationCap, title: "Estudiante", color: "text-primary" },
    organization: { icon: Building, title: "Organización", color: "text-secondary" },
    admin: { icon: Shield, title: "Administrador", color: "text-warning" }
  };

  const RoleIcon = roleInfo[userRole].icon;

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-64"} transition-all duration-300 border-r bg-sidebar`}
      collapsible="icon"
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-sidebar-accent">
            <BookOpen className="h-6 w-6 text-sidebar-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-bold text-sidebar-foreground">PasantíasUNI</h2>
              <div className="flex items-center space-x-1">
                <RoleIcon className={`h-3 w-3 ${roleInfo[userRole].color}`} />
                <span className="text-xs text-sidebar-foreground/70">{roleInfo[userRole].title}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 px-2">
            {!collapsed ? "Navegación Principal" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.url);
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`
                          flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200
                          ${active 
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm' 
                            : 'text-sidebar-foreground hover:bg-sidebar-accent'
                          }
                        `}
                      >
                        <Icon className={`h-5 w-5 ${active ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground'}`} />
                        {!collapsed && (
                          <div className="flex-1">
                            <div className={`font-medium ${active ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground'}`}>
                              {item.title}
                            </div>
                            <div className={`text-xs ${active ? 'text-sidebar-primary-foreground/70' : 'text-sidebar-foreground/50'}`}>
                              {item.description}
                            </div>
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Collapse trigger */}
      <div className="p-2 border-t border-sidebar-border">
        <SidebarTrigger className="w-full text-sidebar-foreground hover:bg-sidebar-accent" />
      </div>
    </Sidebar>
  );
}