
import { TableCell } from "@/components/ui/table";
import ProcessDepartmentCell from "./ProcessDepartmentCell";
import { Department } from "@/types";
import { useProcessManager } from "@/hooks/useProcessManager";
import { useAuth } from "@/hooks/auth";
import { createLogger } from "@/utils/loggerUtils";

const logger = createLogger("ProcessDepartmentsSection");

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
  isArchived?: boolean;
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
  isArchived = false
}: ProcessDepartmentsSectionProps) => {
  // Encontrar o order_num do departamento atual
  const findCurrentDepartmentOrder = (): number => {
    const currentDept = sortedDepartments.find(dept => isCurrentDepartment(dept.id));
    return currentDept ? currentDept.order : Number.MAX_SAFE_INTEGER;
  };

  const currentDeptOrder = findCurrentDepartmentOrder();
  
  // Debug dos responsáveis para identificar problemas
  logger.debug(`ProcessDepartmentsSection para processo ${processId}. Responsáveis por setor:`, sectorResponsibles);
  logger.debug(`Departamento atual: order=${currentDeptOrder}`);

  return (
    <>
      {sortedDepartments.map((dept, index) => {
        const entryDate = getMostRecentEntryDate(dept.id);
        const isPastDept = hasPassedDepartment(dept.id);
        const isActive = isCurrentDepartment(dept.id);
        const isOverdue = isDepartmentOverdue(dept.id, isProcessStarted);
        
        // CORREÇÃO: Sempre mostrar responsáveis para setores com order <= ao atual
        // Isto garante que setores anteriores e o atual mostrem seus responsáveis
        let departmentResponsible = null;
        const showResponsible = isProcessStarted && (isActive || (dept.order <= currentDeptOrder));
        
        if (showResponsible) {
          // Debug de cada departamento para identificar problemas
          logger.debug(`Dept ${dept.id} (order=${dept.order}): showResponsible=${showResponsible}, isActive=${isActive}, isPastDept=${isPastDept}`);
          
          if (sectorResponsibles && sectorResponsibles[dept.id]) {
            departmentResponsible = sectorResponsibles[dept.id];
            logger.debug(`Responsável encontrado para setor ${dept.id}:`, departmentResponsible);
          } else if (index === 0 && processResponsible) {
            departmentResponsible = processResponsible;
          } else {
            logger.debug(`Nenhum responsável encontrado para setor ${dept.id}`);
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
              isArchived={isArchived}
            />
          </TableCell>
        );
      })}
    </>
  );
};

export default ProcessDepartmentsSection;
