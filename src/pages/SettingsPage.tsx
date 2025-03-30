import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useProcesses } from "@/hooks/useProcesses";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Department } from "@/types";

const SettingsPage = () => {
  const { departments } = useProcesses();
  const [sortedDepartments, setSortedDepartments] = useState<Department[]>([]);
  const [isMoving, setIsMoving] = useState(false);
  
  useEffect(() => {
    setSortedDepartments([...departments]);
  }, [departments]);
  
  const moveDepartmentUp = async (index: number) => {
    if (index <= 0 || isMoving) return;
    
    setIsMoving(true);
    
    try {
      const newDepartments = [...sortedDepartments];
      const currentDept = newDepartments[index];
      const prevDept = newDepartments[index - 1];
      
      // Trocar as ordens no array
      newDepartments[index - 1] = { ...prevDept, order: currentDept.order };
      newDepartments[index] = { ...currentDept, order: prevDept.order };
      
      // Organizar o array pela ordem
      newDepartments.sort((a, b) => a.order - b.order);
      
      // Atualizar o banco de dados
      const batch = [
        supabase
          .from('setores')
          .update({ order_num: prevDept.order })
          .eq('id', Number(currentDept.id)),
        supabase
          .from('setores')
          .update({ order_num: currentDept.order })
          .eq('id', Number(prevDept.id))
      ];
      
      const results = await Promise.all(batch);
      
      // Verificar erros
      const hasError = results.some(result => result.error);
      if (hasError) {
        throw new Error("Erro ao atualizar a ordem dos departamentos");
      }
      
      setSortedDepartments(newDepartments);
      toast.success("Ordem atualizada com sucesso");
    } catch (error) {
      console.error("Erro ao mover departamento:", error);
      toast.error("Não foi possível atualizar a ordem");
    } finally {
      setIsMoving(false);
    }
  };
  
  const moveDepartmentDown = async (index: number) => {
    if (index >= sortedDepartments.length - 1 || isMoving) return;
    
    setIsMoving(true);
    
    try {
      const newDepartments = [...sortedDepartments];
      const currentDept = newDepartments[index];
      const nextDept = newDepartments[index + 1];
      
      // Trocar as ordens no array
      newDepartments[index] = { ...currentDept, order: nextDept.order };
      newDepartments[index + 1] = { ...nextDept, order: currentDept.order };
      
      // Organizar o array pela ordem
      newDepartments.sort((a, b) => a.order - b.order);
      
      // Atualizar o banco de dados
      const batch = [
        supabase
          .from('setores')
          .update({ order_num: nextDept.order })
          .eq('id', Number(currentDept.id)),
        supabase
          .from('setores')
          .update({ order_num: currentDept.order })
          .eq('id', Number(nextDept.id))
      ];
      
      const results = await Promise.all(batch);
      
      // Verificar erros
      const hasError = results.some(result => result.error);
      if (hasError) {
        throw new Error("Erro ao atualizar a ordem dos departamentos");
      }
      
      setSortedDepartments(newDepartments);
      toast.success("Ordem atualizada com sucesso");
    } catch (error) {
      console.error("Erro ao mover departamento:", error);
      toast.error("Não foi possível atualizar a ordem");
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Configure o fluxo de trabalho e os setores.
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Ordem dos Setores</CardTitle>
            <CardDescription>
              Configure a ordem dos setores no fluxo de processos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ordem</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Prazo (dias)</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDepartments.map((department, index) => (
                  <TableRow key={department.id}>
                    <TableCell>{department.order}</TableCell>
                    <TableCell className="font-medium">
                      {department.name}
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        value={department.timeLimit} 
                        className="w-20"
                        min={0}
                        readOnly
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => moveDepartmentUp(index)}
                          disabled={index === 0 || isMoving}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => moveDepartmentDown(index)}
                          disabled={index === sortedDepartments.length - 1 || isMoving}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
