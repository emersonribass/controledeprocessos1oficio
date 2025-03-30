
import { useForm } from "react-hook-form";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Department } from "@/types";

type UsuarioSupabase = {
  id: string;
  nome: string;
  email: string;
  senha: string;
  ativo: boolean;
  setores_atribuidos: string[];
  perfil: 'administrador' | 'usuario';
  created_at: string;
  updated_at: string;
};

type FormUsuario = {
  nome: string;
  email: string;
  senha: string;
  ativo: boolean;
  setores_atribuidos: string[];
  perfil: 'administrador' | 'usuario';
};

type UserFormProps = {
  usuarioAtual: UsuarioSupabase | null;
  departments: Department[];
  onSave: (data: FormUsuario) => void;
  onCancel: () => void;
};

export function UserForm({ usuarioAtual, departments, onSave, onCancel }: UserFormProps) {
  const form = useForm<FormUsuario>({
    defaultValues: {
      nome: usuarioAtual?.nome || "",
      email: usuarioAtual?.email || "",
      senha: "",
      ativo: usuarioAtual?.ativo !== undefined ? usuarioAtual.ativo : true,
      setores_atribuidos: usuarioAtual?.setores_atribuidos || [],
      perfil: usuarioAtual?.perfil || "usuario",
    },
  });

  // Divide os departamentos em duas colunas
  const halfLength = Math.ceil(departments.length / 2);
  const leftColumnDepartments = departments.slice(0, halfLength);
  const rightColumnDepartments = departments.slice(halfLength);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-4 py-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="senha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{usuarioAtual ? "Nova Senha (deixe em branco para manter a atual)" : "Senha"}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="perfil"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Perfil</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="usuario" id="usuario" />
                          <Label htmlFor="usuario">Usuário</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="administrador" id="administrador" />
                          <Label htmlFor="administrador">Administrador</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ativo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 h-full">
                    <FormLabel>Ativo</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div>
            <FormField
              control={form.control}
              name="setores_atribuidos"
              render={() => (
                <FormItem>
                  <div className="mb-2">
                    <FormLabel className="text-base">Setores atribuídos</FormLabel>
                    <FormDescription>
                      Selecione os setores aos quais o usuário terá acesso.
                    </FormDescription>
                  </div>
                  <ScrollArea className="h-[200px] rounded-md border p-2">
                    <div className="grid grid-cols-2 gap-x-4">
                      <div>
                        {leftColumnDepartments.map((department) => (
                          <FormField
                            key={department.id}
                            control={form.control}
                            name="setores_atribuidos"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={department.id}
                                  className="flex flex-row items-start space-x-3 space-y-0 mb-2"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(department.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, department.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== department.id
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {department.name}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <div>
                        {rightColumnDepartments.map((department) => (
                          <FormField
                            key={department.id}
                            control={form.control}
                            name="setores_atribuidos"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={department.id}
                                  className="flex flex-row items-start space-x-3 space-y-0 mb-2"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(department.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, department.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== department.id
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {department.name}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </ScrollArea>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" type="button" onClick={onCancel} className="mr-2">
            Cancelar
          </Button>
          <Button type="submit">Salvar</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
