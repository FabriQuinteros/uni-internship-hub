import { Bell, Search, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  userRole: 'student' | 'organization' | 'admin';
}

export const DashboardHeader = ({ userRole }: DashboardHeaderProps) => {
  const getUserInfo = () => {
    switch (userRole) {
      case 'student':
        return {
          name: "María González",
          email: "maria.gonzalez@universidad.edu",
          avatar: "/api/placeholder/32/32",
          role: "Estudiante"
        };
      case 'organization':
        return {
          name: "TechCorp Solutions",
          email: "rrhh@techcorp.com",
          avatar: "/api/placeholder/32/32",
          role: "Organización"
        };
      case 'admin':
        return {
          name: "Dr. Carlos Mendoza",
          email: "admin@universidad.edu",
          avatar: "/api/placeholder/32/32",
          role: "Administrador"
        };
      default:
        return {
          name: "Usuario",
          email: "usuario@email.com",
          avatar: "/api/placeholder/32/32",
          role: "Usuario"
        };
    }
  };

  const userInfo = getUserInfo();

  return (
    <header className="h-16 border-b bg-card/50 backdrop-blur-sm px-6 flex items-center justify-between">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            className="pl-10 bg-background"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            3
          </Badge>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={userInfo.avatar} alt={userInfo.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {userInfo.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userInfo.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userInfo.email}
                </p>
                <Badge variant="secondary" className="w-fit text-xs mt-1">
                  {userInfo.role}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};