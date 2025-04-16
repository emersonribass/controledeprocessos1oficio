
import { TableCell } from "@/components/ui/table";
import ProcessDepartmentCell from "./ProcessDepartmentCell";
import { Department } from "@/types";
import { useProcessDepartmentsResponsibility } from "@/hooks/useProcessDepartmentsResponsibility";
import { memo } from "react";

interface ProcessDepartmentsSectionProps {
  processId: string;
  sortedDepartments: Department[];
  isProcessStarted: boolean;
  getMostRecentEntryDate: (departmentId: string) => string | null;
  hasPassedDepartment: (departmentId: string) => boolean;
  isCurrentDepartment: (departmentId: string) => boolean;
  isPreviousDepartment: (departmentId: string) => boolean;
  isDepartmentOverdue: (departmentId: string, isProcessStarted: boolean) => boolean;
}

const ProcessDepartmentsSection = memo(({
  processId,
  sortedDepartments,
  isProcessStarted,
  getMostRecentEntryDate,
  hasPassedDepartment,
  isCurrentDepartment,
  isPreviousDepartment,
  isDepartmentOverdue
}: ProcessDepartmentsSectionProps) => {
  // Usando o novo hook para buscar responsáveis
  const { 
    processResponsible, 
    departmentResponsibles 
  } = useProcessDepartmentsResponsibility(
    processId,
    sortedDepartments,
    isCurrentDepartment,
    hasPassedDepartment
  );

  return (
    <>
      {sortedDepartments.map((dept) => {
        const entryDate = getMostRecentEntryDate(dept.id);
        const isPastDept = hasPassedDepartment(dept.id) && isPreviousDepartment(dept.id);
        const isActive = isCurrentDepartment(dept.id);
        const isOverdue = isDepartmentOverdue(dept.id, isProcessStarted);
        
        // Obtém o responsável do setor com tratamento para null
        const sectorResponsible = departmentResponsibles ? departmentResponsibles[dept.id] : null;
        
        return (
          <TableCell key={dept.id}>
            <ProcessDepartmentCell
              departmentId={dept.id}
              isCurrentDepartment={isActive}
              hasPassedDepartment={isPastDept}
              entryDate={entryDate}
              showDate={isActive || isPastDept}
              isDepartmentOverdue={isActive && isOverdue}
              departmentTimeLimit={dept.timeLimit}
              isProcessStarted={isProcessStarted}
              processResponsible={processResponsible}
              sectorResponsible={sectorResponsible}
            />
          </TableCell>
        );
      })}
    </>
  );
});

ProcessDepartmentsSection.displayName = 'ProcessDepartmentsSection';
export default ProcessDepartmentsSection;
