import { Bell, User, LogOut, Settings, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import BackendNotificationCenter from "@/components/notifications/BackendNotificationCenter";

interface DashboardHeaderProps {
  userRole: 'student' | 'organization' | 'admin';
}

export const DashboardHeader = ({ userRole }: DashboardHeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getRoleBadge = () => {
    const roleConfig = {
      student: { text: "Estudiante", class: "bg-primary/10 text-primary hover:bg-primary/20" },
      organization: { text: "Organización", class: "bg-secondary/10 text-secondary hover:bg-secondary/20" },
      admin: { text: "Administrador", class: "bg-destructive/10 text-destructive hover:bg-destructive/20" },
    };

    const config = roleConfig[userRole];
    return (
      <Badge variant="outline" className={config.class}>
        {config.text}
      </Badge>
    );
  };

  const handleLogout = async () => {
    // Redirigir primero para evitar cualquier delay visual
    navigate('/auth/login', { replace: true });
    // Luego hacer el logout en segundo plano
    await logout();
  };

  return (
    <header className="h-16 border-b bg-card/50 backdrop-blur-sm px-6 flex items-center justify-between">
      {/* Logo/Title area */}
      <div className="flex-1">
        <h2 className="text-lg font-semibold">Dashboard</h2>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <BackendNotificationCenter />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src="" alt={user?.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
                <div className="mt-2">
                  {getRoleBadge()}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Perfil</span>
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuración</span>
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};