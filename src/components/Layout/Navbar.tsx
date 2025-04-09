import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/auth";
import { Link, useNavigate } from "react-router-dom";
import NotificationsPopover from "@/components/Notifications/NotificationsPopover";
import { useNotifications } from "@/hooks/useNotifications";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Adicionar o useNotifications para obter a contagem de não lidas
  const { unreadCount } = useNotifications();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 md:px-8">
        <Link to="/" className="mr-auto font-bold text-lg">
          Flowise
        </Link>
        
        <div className="ml-auto flex items-center space-x-4">
          {user && (
            <Link to="/processes" className="text-sm hover:underline">
              Processos
            </Link>
          )}
          
          {user && (
            <Link to="/users" className="text-sm hover:underline">
              Usuários
            </Link>
          )}
          
          {user && user.email.endsWith("@flowise.com.br") && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  Admin
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Painel de Administração</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/admin/users">Gerenciar Usuários</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin/departments">Gerenciar Setores</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin/process-settings">Configurações de Processo</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin/process-types">Tipos de Processo</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* Atualizar para mostrar o contador de notificações */}
          {user && (
            <NotificationsPopover>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-5 w-5 translate-x-1/3 -translate-y-1/3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">{unreadCount}</span>
                  </span>
                )}
              </Button>
            </NotificationsPopover>
          )}
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings">Configurações</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>Sair</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login" className="text-sm hover:underline">
              Entrar
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
