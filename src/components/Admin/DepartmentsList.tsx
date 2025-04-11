
import { Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Department } from "@/types";
import { useState } from "react";

interface DepartmentsListProps {
  departments: Department[];
  isLoading: boolean;
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
  onMoveUp: (department: Department) => void;
  onMoveDown: (department: Department) => void;
}

const DepartmentsList = ({
  departments,
  isLoading,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown
}: DepartmentsListProps) => {
  const [movingDepartmentId, setMovingDepartmentId] = useState<string | null>(null);

  if (isLoading) {
    return <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>;
  }
  
  const handleMoveUp = async (department: Department) => {
    if (movingDepartmentId) return;
    setMovingDepartmentId(department.id);
    console.log(`Clicou em mover para cima: ${department.name} (${department.id})`);
    await onMoveUp(department);
    setMovingDepartmentId(null);
  };
  
  const handleMoveDown = async (department: Department) => {
    if (movingDepartmentId) return;
    setMovingDepartmentId(department.id);
    console.log(`Clicou em mover para baixo: ${department.name} (${department.id})`);
    await onMoveDown(department);
    setMovingDepartmentId(null);
  };

  // Reordenar os departamentos pelo campo order antes de verificar primeiro/último
  const orderedDepartments = [...departments].sort((a, b) => a.order - b.order);

  const isFirstDepartment = (dept: Department) => {
    if (!orderedDepartments.length) return false;
    return orderedDepartments[0].id === dept.id;
  };

  const isLastDepartment = (dept: Department) => {
    if (!orderedDepartments.length) return false;
    return orderedDepartments[orderedDepartments.length - 1].id === dept.id;
  };
  
  return <Table className="w-full">
      <TableHeader>
        <TableRow className="h-10">
          <TableHead>ID</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Ordem</TableHead>
          <TableHead>Prazo (dias)</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {departments.length === 0 ? <TableRow>
            <TableCell colSpan={5} className="text-center py-6">
              Nenhum setor encontrado.
            </TableCell>
          </TableRow> : orderedDepartments.map(department => <TableRow key={department.id} className="h-8 py-1">
              <TableCell className="py-1">{department.id}</TableCell>
              <TableCell className="font-medium py-1">{department.name}</TableCell>
              <TableCell className="py-1">{department.order}</TableCell>
              <TableCell className="py-1">{department.timeLimit}</TableCell>
              <TableCell className="text-right py-1">
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleMoveUp(department)} 
                    disabled={isFirstDepartment(department) || movingDepartmentId !== null} 
                    title="Mover para cima" 
                    className="hover:border-blue-200 text-white bg-green-600 hover:bg-green-500"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleMoveDown(department)} 
                    disabled={isLastDepartment(department) || movingDepartmentId !== null} 
                    title="Mover para baixo" 
                    className="hover:border-blue-200 text-white bg-green-600 hover:bg-green-500"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => onEdit(department)} 
                    title="Editar" 
                    className="hover:border-amber-200 text-white bg-amber-400 hover:bg-amber-300"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => onDelete(department)} 
                    title="Excluir" 
                    className="hover:border-red-200 bg-red-400 hover:bg-red-300 text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>)}
      </TableBody>
    </Table>;
};

export default DepartmentsList;
