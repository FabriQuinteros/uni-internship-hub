import { Bell, Search, User, LogOut, Settings, UserCircle, Wifi, WifiOff } from "lucide-react";
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
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { systemService } from "@/services/systemService";
import { API_CONFIG } from "@/config/api.config";
import { toast } from "@/components/ui/use-toast";

interface DashboardHeaderProps {
  userRole: 'student' | 'organization' | 'admin';
}

export const DashboardHeader = ({ userRole }: DashboardHeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [isCheckingApi, setIsCheckingApi] = useState(false);

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

  const checkApiConnection = async () => {
    setIsCheckingApi(true);
    try {
      const message = await systemService.ping();
      setApiStatus('connected');
      toast({
        title: "✅ API Conectada",
        description: `Backend: "${message}"`,
        variant: "default",
      });
    } catch (error) {
      setApiStatus('disconnected');
      toast({
        title: "❌ Error de API",
        description: "No se pudo conectar con el servidor",
        variant: "destructive",
      });
    } finally {
      setIsCheckingApi(false);
    }
  };

  useEffect(() => {
    checkApiConnection();
  }, []);

  const getApiStatusIcon = () => {
    if (apiStatus === 'connected') {
      return <Wifi className="h-4 w-4 text-green-600" />;
    } else if (apiStatus === 'disconnected') {
      return <WifiOff className="h-4 w-4 text-red-600" />;
    } else {
      return <Wifi className="h-4 w-4 text-yellow-600 animate-pulse" />;
    }
  };

  const getApiStatusText = () => {
    switch (apiStatus) {
      case 'connected': return 'API Conectada';
      case 'disconnected': return 'API Desconectada';
      default: return 'Verificando API...';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

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
        {/* API Status */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={checkApiConnection}
                disabled={isCheckingApi}
                className="flex items-center gap-2"
              >
                {getApiStatusIcon()}
                <span className="hidden md:inline text-xs">
                  {isCheckingApi ? 'Verificando...' : getApiStatusText()}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <div className="space-y-1">
                <p className="font-medium">{getApiStatusText()}</p>
                <p className="text-xs text-muted-foreground">
                  URL: {API_CONFIG.BASE_URL}
                </p>
                <p className="text-xs text-muted-foreground">
                  Click para verificar conexión
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

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
                <AvatarImage src={user?.imageUrl} alt={user?.name} />
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