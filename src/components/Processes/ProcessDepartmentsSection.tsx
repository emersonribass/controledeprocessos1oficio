
import { TableCell } from "@/components/ui/table";
import ProcessDepartmentCell from "./ProcessDepartmentCell";
import { Department } from "@/types";

interface ProcessDepartmentsSectionProps {
  sortedDepartments: Department[];
  isProcessStarted: boolean;
  getMostRecentEntryDate: (departmentId: string) => string | null;
  hasPassedDepartment: (departmentId: string) => boolean;
  isCurrentDepartment: (departmentId: string) => boolean;
  isPreviousDepartment: (departmentId: string) => boolean;
  isDepartmentOverdue: (departmentId: string, isProcessStarted: boolean) => boolean;
  processId: string;
  processResponsible?: any;
  sectorResponsibles?: Record<string, any>;
}

const ProcessDepartmentsSection = ({
  sortedDepartments,
  isProcessStarted,
  getMostRecentEntryDate,
  hasPassedDepartment,
  isCurrentDepartment,
  isPreviousDepartment,
  isDepartmentOverdue,
  processId,
  processResponsible,
  sectorResponsibles
}: ProcessDepartmentsSectionProps) => {
  return (
    <>
      {sortedDepartments.map((dept, index) => {
        const entryDate = getMostRecentEntryDate(dept.id);
        const isPastDept = hasPassedDepartment(dept.id);
        const isActive = isCurrentDepartment(dept.id);
        const isOverdue = isDepartmentOverdue(dept.id, isProcessStarted);
        const isPrevious = isPreviousDepartment(dept.id);
        
        // Determinar o responsável para este departamento
        let departmentResponsible = null;
        
        // Mostra o responsável se:
        // 1. É o departamento atual
        // 2. É um departamento anterior (isPrevious) E tem um responsável registrado
        if (isActive && sectorResponsibles && sectorResponsibles[dept.id]) {
          departmentResponsible = sectorResponsibles[dept.id];
        }
        // Caso especial para o primeiro departamento se for o atual
        else if (isActive && index === 0 && processResponsible) {
          departmentResponsible = processResponsible;
        }
        // Para departamentos anteriores, mostrar o responsável se existir
        else if (isPrevious && sectorResponsibles && sectorResponsibles[dept.id]) {
          departmentResponsible = sectorResponsibles[dept.id];
        }
        
        return (
          <TableCell key={dept.id} className="text-center">
            <ProcessDepartmentCell
              departmentId={dept.id}
              isCurrentDepartment={isActive}
              hasPassedDepartment={isPastDept}
              entryDate={entryDate}
              showDate={isActive || isPastDept}
              isDepartmentOverdue={isActive && isOverdue}
              departmentTimeLimit={dept.timeLimit}
              isProcessStarted={isProcessStarted}
              responsible={departmentResponsible}
              isFirstDepartment={index === 0}
            />
          </TableCell>
        );
      })}
    </>
  );
};

export default ProcessDepartmentsSection;
