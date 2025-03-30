
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, UserCheck, UserX } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { User } from "@/types";
import { useProcesses } from "@/hooks/useProcesses";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Definição do tipo para a tabela de usuários no Supabase
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

// Formulário de usuário
type FormUsuario = {
  nome: string;
  email: string;
  senha: string;
  ativo: boolean;
  setores_atribuidos: string[];
  perfil: 'administrador' | 'usuario';
};

const AdminUsersPage = () => {
  const [usuarios, setUsuarios] = useState<UsuarioSupabase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [usuarioAtual, setUsuarioAtual] = useState<UsuarioSupabase | null>(null);
  const { toast } = useToast();
  const { departments } = useProcesses();

  const form = useForm<FormUsuario>({
    defaultValues: {
      nome: "",
      email: "",
      senha: "",
      ativo: true,
      setores_atribuidos: [],
      perfil: "usuario",
    },
  });

  // Buscar usuários do Supabase
  const fetchUsuarios = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .order("nome");

      if (error) {
        throw error;
      }

      setUsuarios(data as UsuarioSupabase[]);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const getDepartmentName = (id: string) => {
    const department = departments.find((d) => d.id === id);
    return department ? department.name : "Desconhecido";
  };

  const handleAddUsuario = () => {
    setUsuarioAtual(null);
    form.reset({
      nome: "",
      email: "",
      senha: "",
      ativo: true,
      setores_atribuidos: [],
      perfil: "usuario",
    });
    setOpenDialog(true);
  };

  const handleEditUsuario = (usuario: UsuarioSupabase) => {
    setUsuarioAtual(usuario);
    form.reset({
      nome: usuario.nome,
      email: usuario.email,
      senha: "", // Não preencher senha na edição
      ativo: usuario.ativo,
      setores_atribuidos: usuario.setores_atribuidos,
      perfil: usuario.perfil,
    });
    setOpenDialog(true);
  };

  const handleToggleAtivo = async (usuario: UsuarioSupabase) => {
    try {
      const { error } = await supabase
        .from("usuarios")
        .update({ ativo: !usuario.ativo })
        .eq("id", usuario.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: `Usuário ${usuario.ativo ? 'desativado' : 'ativado'} com sucesso!`,
      });

      fetchUsuarios(); // Recarregar a lista após a alteração
    } catch (error) {
      console.error("Erro ao atualizar status do usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do usuário.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUsuario = async (usuario: UsuarioSupabase) => {
    if (confirm(`Tem certeza que deseja excluir o usuário ${usuario.nome}?`)) {
      try {
        const { error } = await supabase
          .from("usuarios")
          .delete()
          .eq("id", usuario.id);

        if (error) {
          throw error;
        }

        toast({
          title: "Sucesso",
          description: "Usuário excluído com sucesso!",
        });

        fetchUsuarios(); // Recarregar a lista após a exclusão
      } catch (error) {
        console.error("Erro ao excluir usuário:", error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir o usuário.",
          variant: "destructive",
        });
      }
    }
  };

  const onSubmit = async (data: FormUsuario) => {
    try {
      // Se estamos editando um usuário existente
      if (usuarioAtual) {
        const updateData: Partial<UsuarioSupabase> = {
          nome: data.nome,
          email: data.email,
          ativo: data.ativo,
          setores_atribuidos: data.setores_atribuidos,
          perfil: data.perfil,
        };

        // Só incluir senha se foi fornecida
        if (data.senha) {
          updateData.senha = data.senha;
        }

        const { error } = await supabase
          .from("usuarios")
          .update(updateData)
          .eq("id", usuarioAtual.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Usuário atualizado com sucesso!",
        });
      } else {
        // Estamos criando um novo usuário
        const { error } = await supabase.from("usuarios").insert({
          nome: data.nome,
          email: data.email,
          senha: data.senha,
          ativo: data.ativo,
          setores_atribuidos: data.setores_atribuidos,
          perfil: data.perfil,
        });

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Usuário criado com sucesso!",
        });
      }

      setOpenDialog(false);
      fetchUsuarios(); // Recarregar a lista após salvar
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o usuário.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cadastro de Usuários</h2>
          <p className="text-muted-foreground">
            Gerencie os usuários do sistema e suas permissões.
          </p>
        </div>
        <Button onClick={handleAddUsuario}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários</CardTitle>
          <CardDescription>
            Lista de todos os usuários cadastrados no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead>Departamentos</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  usuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell className="font-medium">{usuario.nome}</TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>
                        {format(new Date(usuario.created_at), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {usuario.setores_atribuidos.map((depId) => (
                            <Badge key={depId} variant="outline">
                              {getDepartmentName(depId)}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={usuario.perfil === "administrador" ? "default" : "secondary"}>
                          {usuario.perfil === "administrador" ? "Administrador" : "Usuário"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={usuario.ativo ? "default" : "destructive"}>
                          {usuario.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleToggleAtivo(usuario)}
                            title={usuario.ativo ? "Desativar usuário" : "Ativar usuário"}
                          >
                            {usuario.ativo ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditUsuario(usuario)}
                            title="Editar usuário"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive"
                            onClick={() => handleDeleteUsuario(usuario)}
                            title="Excluir usuário"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Diálogo para adicionar/editar usuário - Melhorado com layout em colunas */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              {usuarioAtual ? "Editar Usuário" : "Adicionar Novo Usuário"}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações do usuário e clique em salvar quando terminar.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Coluna da esquerda */}
                <div className="space-y-4">
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

                  <FormField
                    control={form.control}
                    name="perfil"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
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
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Ativo</FormLabel>
                          <FormDescription>
                            Determina se o usuário pode acessar o sistema.
                          </FormDescription>
                        </div>
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

                {/* Coluna da direita */}
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
                        <div className="h-[320px] overflow-y-auto border rounded-md p-3">
                          {departments.map((department) => (
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setOpenDialog(false)} className="mr-2">
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsersPage;
