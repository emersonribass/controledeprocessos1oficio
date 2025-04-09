import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Pencil, Plus, Save, X } from "lucide-react";
import { useProcessTypes } from "@/hooks/useProcessTypes";
const AdminProcessTypesPage = () => {
  const {
    processTypes,
    isLoading,
    createProcessType,
    updateProcessType,
    toggleProcessTypeActive
  } = useProcessTypes();
  const [newTypeName, setNewTypeName] = useState("");
  const [editingType, setEditingType] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const handleAddNew = async () => {
    if (!newTypeName.trim()) return;
    const success = await createProcessType(newTypeName);
    if (success) {
      setNewTypeName("");
      setIsAdding(false);
    }
  };
  const startEdit = (id: string, name: string) => {
    setEditingType({
      id,
      name
    });
  };
  const cancelEdit = () => {
    setEditingType(null);
  };
  const saveEdit = async () => {
    if (!editingType || !editingType.name.trim()) return;
    const success = await updateProcessType(editingType.id, editingType.name);
    if (success) {
      setEditingType(null);
    }
  };
  const toggleActive = async (id: string, currentActive: boolean) => {
    await toggleProcessTypeActive(id, !currentActive);
  };
  return <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tipos de Processo</h2>
        <p className="text-muted-foreground">
          Gerencie os tipos de processo disponíveis no sistema.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Tipos de Processo</CardTitle>
            <CardDescription>
              Lista de todos os tipos de processo cadastrados no sistema.
            </CardDescription>
          </div>
          {!isAdding ? <Button onClick={() => setIsAdding(true)} className="gap-0 px-[10px] text-center text-white">
              <Plus className="mr-2 h-4 w-4" />
              Novo Tipo
            </Button> : null}
        </CardHeader>
        <CardContent>
          {isAdding && <div className="mb-4 flex items-center space-x-2">
              <Input value={newTypeName} onChange={e => setNewTypeName(e.target.value)} placeholder="Nome do tipo de processo" className="max-w-sm" />
              <Button onClick={handleAddNew} variant="default" className="gap-0 bg-green-700 hover:bg-green-600 text-white">
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </Button>
              <Button onClick={() => setIsAdding(false)} variant="ghost" className="gap-0 bg-blue-700 hover:bg-blue-600 text-white px-[10px]">
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            </div>}

          {isLoading ? <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Carregando tipos de processo...</p>
            </div> : <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processTypes.length === 0 ? <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                      Nenhum tipo de processo cadastrado.
                    </TableCell>
                  </TableRow> : processTypes.map(type => <TableRow key={type.id}>
                      <TableCell>
                        {editingType?.id === type.id ? <Input value={editingType.name} onChange={e => setEditingType({
                  ...editingType,
                  name: e.target.value
                })} className="max-w-sm" /> : type.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch checked={type.active !== false} onCheckedChange={() => toggleActive(type.id, type.active !== false)} />
                          <span>{type.active !== false ? "Ativo" : "Inativo"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {editingType?.id === type.id ? <div className="flex space-x-2">
                            <Button onClick={saveEdit} size="sm" variant="outline">
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button onClick={cancelEdit} size="sm" variant="ghost">
                              <X className="h-4 w-4" />
                            </Button>
                          </div> : <Button onClick={() => startEdit(type.id, type.name)} size="sm" variant="ghost">
                            <Pencil className="h-4 w-4" />
                          </Button>}
                      </TableCell>
                    </TableRow>)}
              </TableBody>
            </Table>}
        </CardContent>
      </Card>
    </div>;
};
export default AdminProcessTypesPage;