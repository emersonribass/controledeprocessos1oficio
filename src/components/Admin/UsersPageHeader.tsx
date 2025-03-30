
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type UsersPageHeaderProps = {
  onAddUsuario: () => void;
};

export function UsersPageHeader({ onAddUsuario }: UsersPageHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Cadastro de Usuários</h2>
        <p className="text-muted-foreground">
          Gerencie os usuários do sistema e suas permissões.
        </p>
      </div>
      <Button onClick={onAddUsuario}>
        <Plus className="mr-2 h-4 w-4" />
        Novo Usuário
      </Button>
    </div>
  );
}
