
import { TableCell } from "@/components/ui/table";
import ProcessDepartmentCell from "./ProcessDepartmentCell";
import { Department } from "@/types";
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

  // Log para verificar os responsáveis disponíveis
  logger.debug(`ProcessDepartmentsSection para processo ${processId}`);
  logger.debug(`sectorResponsibles: ${JSON.stringify(sectorResponsibles)}`);
  
  if (processId === '118766') {
    logger.debug(`Detalhamento do processo 118766 em ProcessDepartmentsSection:
      - isProcessStarted: ${isProcessStarted}
      - currentDeptOrder: ${currentDeptOrder}
      - sectorResponsibles: ${JSON.stringify(sectorResponsibles || {})}
    `);
  }

  return (
    <>
      {sortedDepartments.map((dept, index) => {
        const entryDate = getMostRecentEntryDate(dept.id);
        const isPastDept = hasPassedDepartment(dept.id);
        const isActive = isCurrentDepartment(dept.id);
        const isOverdue = isDepartmentOverdue(dept.id, isProcessStarted);
        
        // Log para depurar a exibição de responsáveis
        if (processId === '118766') {
          logger.debug(`Departamento ${dept.id} para processo 118766:
            - isActive: ${isActive}
            - isPastDept: ${isPastDept}
            - dept.order: ${dept.order}
            - currentDeptOrder: ${currentDeptOrder}
            - Tem responsável no setor: ${!!(sectorResponsibles && sectorResponsibles[dept.id])}
          `);
        }
        
        // CORREÇÃO: A lógica estava incorreta. Devemos mostrar responsáveis para:
        // 1. O departamento atual
        // 2. Departamentos pelos quais o processo já passou
        // Importante: Não estamos mais verificando order_num, mas sim se é atual ou passado
        let departmentResponsible = null;
        
        // A lógica corrigida é mais simples: mostrar responsáveis para departamentos atuais ou passados
        const showResponsible = isActive || isPastDept;
        
        if (showResponsible && isProcessStarted) {
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
