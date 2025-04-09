import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
type UsersPageHeaderProps = {
  onAddUsuario: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
};
export function UsersPageHeader({
  onAddUsuario,
  searchTerm,
  onSearchChange
}: UsersPageHeaderProps) {
  return <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cadastro de Usuários</h2>
          <p className="text-muted-foreground">
            Gerencie os usuários do sistema e suas permissões.
          </p>
        </div>
        <Button onClick={onAddUsuario} className="gap-0 px-[10px]">
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>
      
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input type="text" placeholder="Buscar usuários..." className="pl-8" value={searchTerm} onChange={e => onSearchChange(e.target.value)} />
      </div>
    </div>;
}