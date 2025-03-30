
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import DepartmentForm from "@/components/Admin/DepartmentForm";
import { Department } from "@/types";

interface DepartmentFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: Department | null;
  onSave: () => void;
  departments: Department[];
}

const DepartmentFormSheet = ({ open, onOpenChange, department, onSave, departments }: DepartmentFormSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{department ? 'Editar Setor' : 'Novo Setor'}</SheetTitle>
          <SheetDescription>
            {department 
              ? 'Edite as informações do setor existente.' 
              : 'Preencha as informações para criar um novo setor.'}
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <DepartmentForm 
            department={department} 
            onSave={onSave} 
            onCancel={() => onOpenChange(false)}
            existingDepartments={departments}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DepartmentFormSheet;
