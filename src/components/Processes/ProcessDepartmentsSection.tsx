
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
  isProcessCompleted?: boolean;
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
  sectorResponsibles,
  isProcessCompleted = false
}: ProcessDepartmentsSectionProps) => {
  // Encontrar o order_num do departamento atual
  const findCurrentDepartmentOrder = (): number => {
    const currentDept = sortedDepartments.find(dept => isCurrentDepartment(dept.id));
    return currentDept ? currentDept.order : Number.MAX_SAFE_INTEGER;
  };

  const currentDeptOrder = findCurrentDepartmentOrder();

  return (
    <>
      {sortedDepartments.map((dept, index) => {
        const entryDate = getMostRecentEntryDate(dept.id);
        const isPastDept = hasPassedDepartment(dept.id);
        const isActive = isCurrentDepartment(dept.id);
        const isOverdue = isDepartmentOverdue(dept.id, isProcessStarted);
        
        // Lógica melhorada: mostra responsáveis para processos concluídos e para departamentos relevantes
        let departmentResponsible = null;
        
        // Para processos concluídos, mostrar todos os responsáveis de todos os setores
        // Para processos não concluídos, seguir a lógica original
        let showResponsible = false;
        
        if (isProcessCompleted) {
          // Se o processo está concluído, mostrar todos os responsáveis
          showResponsible = isProcessStarted && (sectorResponsibles && sectorResponsibles[dept.id]);
        } else {
          // Lógica original para processos não concluídos
          showResponsible = isActive || (dept.order < currentDeptOrder);
          showResponsible = showResponsible && isProcessStarted;
        }
        
        if (showResponsible) {
          if (sectorResponsibles && sectorResponsibles[dept.id]) {
            departmentResponsible = sectorResponsibles[dept.id];
          } else if (index === 0 && processResponsible) {
            departmentResponsible = processResponsible;
          }
        }

        return (
          <TableCell key={dept.id} className="text-center">
            <ProcessDepartmentCell
              departmentId={dept.id}
              isCurrentDepartment={isActive}
              hasPassedDepartment={isPastDept || isProcessCompleted}
              entryDate={entryDate}
              showDate={isActive || isPastDept || isProcessCompleted}
              isDepartmentOverdue={isActive && isOverdue}
              departmentTimeLimit={dept.timeLimit}
              isProcessStarted={isProcessStarted}
              responsible={departmentResponsible}
              isFirstDepartment={index === 0}
              isProcessCompleted={isProcessCompleted}
            />
          </TableCell>
        );
      })}
    </>
  );
};

export default ProcessDepartmentsSection;
