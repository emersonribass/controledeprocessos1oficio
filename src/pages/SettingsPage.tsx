
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useProcesses } from "@/hooks/useProcesses";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const SettingsPage = () => {
  const { departments } = useProcesses();
  const [sortedDepartments, setSortedDepartments] = useState([...departments]);
  
  // This is mock functionality as we're not actually changing the state permanently
  const moveDepartmentUp = (index: number) => {
    if (index <= 0) return;
    
    const newDepartments = [...sortedDepartments];
    [newDepartments[index - 1], newDepartments[index]] = [newDepartments[index], newDepartments[index - 1]];
    
    // Update order property
    newDepartments[index - 1] = { ...newDepartments[index - 1], order: index };
    newDepartments[index] = { ...newDepartments[index], order: index + 1 };
    
    setSortedDepartments(newDepartments);
  };
  
  const moveDepartmentDown = (index: number) => {
    if (index >= sortedDepartments.length - 1) return;
    
    const newDepartments = [...sortedDepartments];
    [newDepartments[index], newDepartments[index + 1]] = [newDepartments[index + 1], newDepartments[index]];
    
    // Update order property
    newDepartments[index] = { ...newDepartments[index], order: index + 1 };
    newDepartments[index + 1] = { ...newDepartments[index + 1], order: index + 2 };
    
    setSortedDepartments(newDepartments);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Configure o fluxo de trabalho e os departamentos.
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Ordem dos Departamentos</CardTitle>
            <CardDescription>
              Configure a ordem dos departamentos no fluxo de processos.
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
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => moveDepartmentDown(index)}
                          disabled={index === sortedDepartments.length - 1}
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
