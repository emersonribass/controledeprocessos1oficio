
import { useForm } from "react-hook-form";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Department } from "@/types";
import { UsuarioSupabase, FormUsuario } from "@/types/usuario";
import { BasicInfoFields } from "./UserFormFields/BasicInfoFields";
import { ProfileFields } from "./UserFormFields/ProfileFields";
import { DepartmentsSelection } from "./UserFormFields/DepartmentsSelection";
import { useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const usuarioFormSchema = z.object({
  nome: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "E-mail inválido" }),
  senha: z.string().min(1, { message: "Senha é obrigatória" }).or(z.string().optional()),
  ativo: z.boolean(),
  setores_atribuidos: z.array(z.string()),
  perfil: z.enum(["administrador", "usuario"])
});

type UserFormProps = {
  usuarioAtual: UsuarioSupabase | null;
  departments: Department[];
  onSave: (data: FormUsuario) => void;
  onCancel: () => void;
};

export function UserForm({
  usuarioAtual,
  departments,
  onSave,
  onCancel
}: UserFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  const isEditMode = !!usuarioAtual;
  
  const formSchema = isEditMode
    ? usuarioFormSchema.extend({
        senha: z.string().optional(), // Senha opcional em modo de edição
      })
    : usuarioFormSchema; // Em modo de criação, senha é obrigatória
  
  const form = useForm<FormUsuario>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: usuarioAtual?.nome || "",
      email: usuarioAtual?.email || "",
      senha: "",
      ativo: usuarioAtual?.ativo !== undefined ? usuarioAtual.ativo : true,
      setores_atribuidos: usuarioAtual?.setores_atribuidos || [],
      perfil: usuarioAtual?.perfil || "usuario"
    }
  });
  
  const handleSubmit = async (data: FormUsuario) => {
    setIsSaving(true);
    try {
      await onSave(data);
    } finally {
      setIsSaving(false);
    }
  };
  
  return <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <BasicInfoFields form={form} isEditMode={isEditMode} />
            <ProfileFields form={form} />
          </div>

          <div>
            <DepartmentsSelection form={form} departments={departments} />
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button 
            variant="outline" 
            type="button" 
            onClick={onCancel} 
            className="mr-2"
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </form>
    </Form>;
}
