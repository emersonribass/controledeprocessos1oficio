
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
        
        // Lógica corrigida: mostra responsáveis apenas para o setor atual e setores com order_num menor
        let departmentResponsible = null;
        
        // Estritamente verificar se o dept.order é menor que o order do departamento atual
        // ou se é o departamento atual
        const showResponsible = isActive || (dept.order < currentDeptOrder);
        
        if (showResponsible && isProcessStarted) {
          // Apenas mostra responsáveis se o processo estiver iniciado e 
          // o departamento for atual ou anterior na ordem
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
