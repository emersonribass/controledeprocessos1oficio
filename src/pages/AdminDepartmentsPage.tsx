
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useDepartments } from "@/hooks/useDepartments";
import DepartmentsList from "@/components/Admin/DepartmentsList";
import DeleteDepartmentDialog from "@/components/Admin/DeleteDepartmentDialog";
import DepartmentFormSheet from "@/components/Admin/DepartmentFormSheet";

const AdminDepartmentsPage = () => {
  const {
    departments,
    isLoading,
    openSheet,
    setOpenSheet,
    openDeleteDialog,
    setOpenDeleteDialog,
    selectedDepartment,
    handleAddDepartment,
    handleEditDepartment,
    handleDeleteDepartment,
    confirmDelete,
    onDepartmentSaved
  } = useDepartments();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cadastro de Setores</h2>
          <p className="text-muted-foreground">
            Gerencie os setores do sistema e seus prazos de permanência.
          </p>
        </div>
        <Button onClick={handleAddDepartment}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Setor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Setores</CardTitle>
          <CardDescription>
            Lista de todos os setores cadastrados no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DepartmentsList 
            departments={departments} 
            isLoading={isLoading} 
            onEdit={handleEditDepartment} 
            onDelete={handleDeleteDepartment} 
          />
        </CardContent>
      </Card>

      {/* Modal de confirmação de exclusão */}
      <DeleteDepartmentDialog 
        open={openDeleteDialog} 
        onOpenChange={setOpenDeleteDialog} 
        department={selectedDepartment} 
        onConfirm={confirmDelete} 
      />

      {/* Sheet lateral para adicionar/editar departamento */}
      <DepartmentFormSheet 
        open={openSheet} 
        onOpenChange={setOpenSheet} 
        department={selectedDepartment} 
        onSave={onDepartmentSaved} 
        departments={departments} 
      />
    </div>
  );
};

export default AdminDepartmentsPage;
