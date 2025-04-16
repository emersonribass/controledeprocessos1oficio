
import { Department, Process } from "@/types";
import ProcessDepartmentCell from "../ProcessDepartmentCell";
import { ProcessResponsible } from "@/hooks/process-responsibility/types";

interface ProcessDepartmentCellComponentProps {
  process: Process;
  department: Department;
  getMostRecentEntryDate: (process: Process, departmentId: string) => string | null;
  getProcessResponsible: (processId: string) => ProcessResponsible | null | undefined;
  getSectorResponsible: (processId: string, sectorId: string) => ProcessResponsible | null | undefined;
  departments: Department[];
}

const ProcessDepartmentCellComponent = ({
  process,
  department,
  getMostRecentEntryDate,
  getProcessResponsible,
  getSectorResponsible,
  departments
}: ProcessDepartmentCellComponentProps) => {
  const entryDate = getMostRecentEntryDate(process, department.id);
  const isActive = process.currentDepartment === department.id;
  
  const isPastDept = process.history.some(h => h.departmentId === department.id) && 
    (departments.find(d => d.id === department.id)?.order || 0) < 
    (departments.find(d => d.id === process.currentDepartment)?.order || 0);
  
  // Verifica se o departamento está com prazo expirado
  let isOverdue = false;
  if (isActive && process.status !== "not_started") {
    if (department.timeLimit > 0 && entryDate) {
      const entryDateTime = new Date(entryDate).getTime();
      const deadlineTime = entryDateTime + department.timeLimit * 24 * 60 * 60 * 1000;
      const currentTime = new Date().getTime();
      isOverdue = currentTime > deadlineTime;
    }
  }
  
  // Obtém o responsável do setor
  const sectorResponsible = getSectorResponsible(process.id, department.id);
  const processResponsible = getProcessResponsible(process.id);
  
  return (
    <ProcessDepartmentCell 
      departmentId={department.id}
      isCurrentDepartment={isActive}
      hasPassedDepartment={isPastDept}
      entryDate={entryDate}
      showDate={isActive || isPastDept}
      isDepartmentOverdue={isActive && isOverdue}
      departmentTimeLimit={department.timeLimit}
      isProcessStarted={process.status !== "not_started"}
      processResponsible={processResponsible || null}
      sectorResponsible={sectorResponsible || null}
    />
  );
};

export default ProcessDepartmentCellComponent;
