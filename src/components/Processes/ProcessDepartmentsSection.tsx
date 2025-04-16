
import { TableCell } from "@/components/ui/table";
import ProcessDepartmentCell from "./ProcessDepartmentCell";
import { Department } from "@/types";
import { ProcessResponsible } from "@/hooks/process-responsibility/types";

interface ProcessDepartmentsSectionProps {
  sortedDepartments: Department[];
  isProcessStarted: boolean;
  getMostRecentEntryDate: (departmentId: string) => string | null;
  hasPassedDepartment: (departmentId: string) => boolean;
  isCurrentDepartment: (departmentId: string) => boolean;
  isPreviousDepartment: (departmentId: string) => boolean;
  isDepartmentOverdue: (departmentId: string, isProcessStarted: boolean) => boolean;
  processResponsible?: ProcessResponsible | null;
  departmentResponsibles?: Record<string, ProcessResponsible | null>;
}

const ProcessDepartmentsSection = ({
  sortedDepartments,
  isProcessStarted,
  getMostRecentEntryDate,
  hasPassedDepartment,
  isCurrentDepartment,
  isPreviousDepartment,
  isDepartmentOverdue,
  processResponsible = null,
  departmentResponsibles = {}
}: ProcessDepartmentsSectionProps) => {
  // Função para garantir que não passamos undefined para os componentes filhos
  const getSafeResponsible = (deptId: string): ProcessResponsible | null => {
    return departmentResponsibles[deptId] || null;
  };

  return (
    <>
      {sortedDepartments.map((dept) => {
        const entryDate = getMostRecentEntryDate(dept.id);
        const isPastDept = hasPassedDepartment(dept.id) && isPreviousDepartment(dept.id);
        const isActive = isCurrentDepartment(dept.id);
        const isOverdue = isDepartmentOverdue(dept.id, isProcessStarted);
        const sectorResponsible = getSafeResponsible(dept.id);
        
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
};

export default ProcessDepartmentsSection;
