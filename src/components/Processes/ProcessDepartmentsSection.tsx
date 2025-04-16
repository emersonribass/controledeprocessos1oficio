
import { TableCell } from "@/components/ui/table";
import ProcessDepartmentCell from "./ProcessDepartmentCell";
import { Department } from "@/types";
import { ProcessResponsible } from "@/hooks/process-responsibility/types";
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
  processResponsible?: ProcessResponsible | null;
  sectorResponsible?: ProcessResponsible | null;
}

const ProcessDepartmentsSection = memo(({
  processId,
  sortedDepartments,
  isProcessStarted,
  getMostRecentEntryDate,
  hasPassedDepartment,
  isCurrentDepartment,
  isPreviousDepartment,
  isDepartmentOverdue,
  processResponsible = null,
  sectorResponsible = null
}: ProcessDepartmentsSectionProps) => {
  return (
    <>
      {sortedDepartments.map((dept) => {
        const entryDate = getMostRecentEntryDate(dept.id);
        const isPastDept = hasPassedDepartment(dept.id);
        const isActive = isCurrentDepartment(dept.id);
        const isOverdue = isDepartmentOverdue(dept.id, isProcessStarted);
        
        return (
          <TableCell key={dept.id} className="p-2">
            <ProcessDepartmentCell
              departmentId={dept.id}
              isCurrentDepartment={isActive}
              hasPassedDepartment={isPastDept}
              entryDate={entryDate}
              showDate={isActive || isPastDept}
              isDepartmentOverdue={isActive && isOverdue}
              departmentTimeLimit={dept.timeLimit}
              isProcessStarted={isProcessStarted}
              processResponsible={isActive ? processResponsible : null}
              sectorResponsible={isActive ? sectorResponsible : null}
            />
          </TableCell>
        );
      })}
    </>
  );
});

ProcessDepartmentsSection.displayName = 'ProcessDepartmentsSection';
export default ProcessDepartmentsSection;
