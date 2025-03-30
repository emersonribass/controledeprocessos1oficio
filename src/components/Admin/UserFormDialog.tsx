
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserForm } from "@/components/Admin/UserForm";
import { UsuarioSupabase, FormUsuario } from "@/types/usuario";
import { Department } from "@/types";

type UserFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuarioAtual: UsuarioSupabase | null;
  departments: Department[];
  onSave: (data: FormUsuario) => void;
};

export function UserFormDialog({
  open,
  onOpenChange,
  usuarioAtual,
  departments,
  onSave
}: UserFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            {usuarioAtual ? "Editar Usuário" : "Adicionar Novo Usuário"}
          </DialogTitle>
          <DialogDescription>
            Preencha as informações do usuário e clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>

        <UserForm
          usuarioAtual={usuarioAtual}
          departments={departments}
          onSave={onSave}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
