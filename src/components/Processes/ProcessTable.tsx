
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Department, Process, ProcessType } from "@/types";
import ProcessTableHeader from "./ProcessTableHeader";
import ProcessTypePicker from "./ProcessTypePicker";
import ProcessDepartmentCell from "./ProcessDepartmentCell";
import ProcessActionButtons from "./ProcessActionButtons";
import ProcessStatusBadge from "./ProcessStatusBadge";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

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

  // Ordenar departamentos por ordem e filtrar o departamento "Concluído(a)"
  const sortedDepartments = [...departments]
    .filter(dept => dept.name !== "Concluído(a)")
    .sort((a, b) => a.order - b.order);

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
              <TableCell colSpan={departments.length + 3} className="h-24 text-center">
                Nenhum processo encontrado
              </TableCell>
            </TableRow>
          ) : (
            processes.map((process) => (
              <TableRow 
                key={process.id} 
                className={cn(
                  "cursor-pointer hover:bg-gray-100",
                  process.status === "overdue" ? "bg-destructive/5" : "",
                  process.status === "not_started" ? "bg-blue-50" : ""
                )}
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
                {sortedDepartments.map((dept) => {
                  const historyEntry = process.history.find(h => h.departmentId === dept.id);
                  const entryDate = historyEntry ? historyEntry.entryDate : null;
                  const isPastDept = process.history.some(h => h.departmentId === dept.id) && 
                    ((departments.find(d => d.id === dept.id)?.order || 0) < 
                    (departments.find(d => d.id === process.currentDepartment)?.order || 0));
                  const isActive = process.currentDepartment === dept.id;
                  
                  // Usar a propriedade isDepartmentOverdue para verificar se o prazo está expirado
                  const isOverdue = isActive && process.isDepartmentOverdue;
                  
                  return (
                    <TableCell key={dept.id} onClick={(e) => e.stopPropagation()}>
                      <ProcessDepartmentCell
                        departmentId={dept.id}
                        isCurrentDepartment={isActive}
                        hasPassedDepartment={isPastDept}
                        entryDate={entryDate}
                        showDate={isActive || isPastDept}
                        isDepartmentOverdue={isOverdue}
                        departmentTimeLimit={dept.timeLimit}
                        isProcessStarted={process.status !== "not_started"}
                      />
                    </TableCell>
                  );
                })}
                
                {/* Célula para o status do processo */}
                <TableCell>
                  <ProcessStatusBadge status={process.status} />
                </TableCell>
                
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
