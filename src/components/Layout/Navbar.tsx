
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { UserCircle, BellIcon, LogOut, Home, ClipboardList, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationsPopover from "../Notifications/NotificationsPopover";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { unreadCount } = useNotifications();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-4 w-4 mr-1" />,
    },
    {
      title: "Processos",
      href: "/processes",
      icon: <ClipboardList className="h-4 w-4 mr-1" />,
    },
  ];

  // Verificação se o usuário tem acesso de administrador usando a função isAdmin
  const userIsAdmin = user && isAdmin(user.email);

  return (
    <nav className="bg-white border-b border-border h-14 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center">
        <Link to="/" className="flex items-center mr-6">
          <h1 className="text-xl font-bold text-primary">
            Nottar
            <span className="text-muted-foreground text-sm ml-2">Controle de Processos</span>
          </h1>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary"
              )}
            >
              {link.icon}
              <span>{link.title}</span>
            </Link>
          ))}
          
          {/* Menu Administração - Apenas visível para administradores */}
          {userIsAdmin && (
            <Menubar className="border-none bg-transparent p-0">
              <MenubarMenu>
                <MenubarTrigger className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname.startsWith("/admin")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary"
                )}>
                  <Settings className="h-4 w-4 mr-1" />
                  <span>Administração</span>
                </MenubarTrigger>
                <MenubarContent align="start" className="min-w-[200px] bg-white">
                  <MenubarItem asChild>
                    <Link to="/admin/departments" className="w-full cursor-pointer">
                      Cadastro de Setores
                    </Link>
                  </MenubarItem>
                  <MenubarItem asChild>
                    <Link to="/admin/process-settings" className="w-full cursor-pointer">
                      Configurações de Processos
                    </Link>
                  </MenubarItem>
                  <MenubarItem asChild>
                    <Link to="/admin/users" className="w-full cursor-pointer">
                      Cadastro de Usuários
                    </Link>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <NotificationsPopover
          open={notificationsOpen}
          onOpenChange={setNotificationsOpen}
        >
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setNotificationsOpen(true)}
          >
            <BellIcon className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>
        </NotificationsPopover>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={user?.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.name?.charAt(0) || "U"}
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
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile" className="cursor-pointer">
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Navbar;
