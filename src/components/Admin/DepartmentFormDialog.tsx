
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Department } from "@/types";
import DepartmentForm from "@/components/Admin/DepartmentForm";

interface DepartmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: Department | null;
  onSave: () => void;
  departments: Department[];
}

const DepartmentFormDialog = ({ open, onOpenChange, department, onSave, departments }: DepartmentFormDialogProps) => {
  const title = department ? "Editar Setor" : "Novo Setor";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <DepartmentForm
          department={department}
          onSave={() => {
            onSave();
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
          existingDepartments={departments}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DepartmentFormDialog;
