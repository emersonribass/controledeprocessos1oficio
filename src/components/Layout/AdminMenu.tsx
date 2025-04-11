
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import { cn } from "@/lib/utils";

interface AdminMenuProps {
  isAdmin: boolean;
}

export const AdminMenu = ({ isAdmin }: AdminMenuProps) => {
  const { pathname } = useLocation();

  if (!isAdmin) return null;

  return (
    <Menubar className="border-none bg-transparent p-0">
      <MenubarMenu>
        <MenubarTrigger
          className={cn(
            "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
            pathname.startsWith("/admin")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-secondary"
          )}
        >
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
            <Link to="/admin/process-types" className="w-full cursor-pointer">
              Tipos de Processo
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
  );
};
