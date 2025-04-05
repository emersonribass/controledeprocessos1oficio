
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Department, Process, ProcessType } from "@/types";
import ProcessTableHeader from "./ProcessTableHeader";
import ProcessTableRow from "./ProcessTableRow";
import { useNavigate } from "react-router-dom";

interface ProcessTableProps {
  processes: Process[];
  sortField: keyof Process;
  sortDirection: "asc" | "desc";
  toggleSort: (field: keyof Process) => void;
  getDepartmentName: (id: string) => string;
  getProcessTypeName: (id: string) => string;
  moveProcessToNextDepartment: (processId: string) => void;
  moveProcessToPreviousDepartment: (processId: string) => void;
  processTypes: ProcessType[];
  updateProcessType: (processId: string, newTypeId: string) => Promise<void>;
  updateProcessStatus?: (processId: string, newStatus: 'Em andamento' | 'Concluído' | 'Não iniciado') => Promise<void>;
  departments: Department[];
  startProcess?: (processId: string) => Promise<void>;
}

const ProcessTable = ({
  processes,
  sortField,
  sortDirection,
  toggleSort,
  getDepartmentName,
  getProcessTypeName,
  moveProcessToNextDepartment,
  moveProcessToPreviousDepartment,
  processTypes,
  updateProcessType,
  updateProcessStatus,
  departments,
  startProcess,
}: ProcessTableProps) => {
  const navigate = useNavigate();
  
  const handleRowClick = (processId: string) => {
    navigate(`/processes/${processId}`);
  };

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <ProcessTableHeader
          sortField={sortField}
          sortDirection={sortDirection}
          toggleSort={toggleSort}
          departments={departments}
        />
        <TableBody>
          {processes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={departments.length + 4} className="h-24 text-center">
                Nenhum processo encontrado
              </TableCell>
            </TableRow>
          ) : (
            processes.map((process) => (
              <TableRow 
                key={process.id} 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handleRowClick(process.id)}
              >
                <TableCell className="font-medium">
                  {process.protocolNumber}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <ProcessTypePicker
                    processId={process.id}
                    currentTypeId={process.processType}
                    processTypes={processTypes}
                    getProcessTypeName={getProcessTypeName}
                    updateProcessType={updateProcessType}
                  />
                </TableCell>
                
                {/* Células para cada departamento */}
                {departments
                  .filter(dept => dept.name !== "Concluído(a)")
                  .sort((a, b) => a.order - b.order)
                  .map((dept) => {
                    const historyEntry = process.history.find(h => h.departmentId === dept.id);
                    const entryDate = historyEntry ? historyEntry.entryDate : null;
                    const isPastDept = process.history.some(h => h.departmentId === dept.id) && 
                      ((departments.find(d => d.id === dept.id)?.order || 0) < 
                      (departments.find(d => d.id === process.currentDepartment)?.order || 0));
                    const isActive = process.currentDepartment === dept.id;
                    
                    // Verifica se o departamento está com prazo expirado
                    let isOverdue = false;
                    if (isActive && process.status !== "not_started") {
                      const department = departments.find(d => d.id === dept.id);
                      if (department && department.timeLimit > 0 && entryDate) {
                        const entryDateTime = new Date(entryDate).getTime();
                        const deadlineTime = entryDateTime + (department.timeLimit * 24 * 60 * 60 * 1000);
                        const currentTime = new Date().getTime();
                        isOverdue = currentTime > deadlineTime;
                      }
                    }
                    
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
                          isProcessStarted={process.status !== "not_started"}
                        />
                      </TableCell>
                    );
                  })
                }
                
                <TableCell><ProcessStatusBadge status={process.status} /></TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <ProcessActionButtons
                    processId={process.id}
                    moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
                    moveProcessToNextDepartment={moveProcessToNextDepartment}
                    isFirstDepartment={process.currentDepartment === sortedDepartments[0]?.id}
                    isLastDepartment={process.currentDepartment === sortedDepartments[sortedDepartments.length - 1]?.id}
                    setIsEditing={() => {}}
                    isEditing={false}
                    status={process.status}
                    startProcess={startProcess}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProcessTable;
