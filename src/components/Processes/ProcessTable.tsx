
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Department, Process, ProcessType } from "@/types";
import ProcessTableHeader from "./ProcessTableHeader";
import ProcessTypePicker from "./ProcessTypePicker";
import ProcessDepartmentCell from "./ProcessDepartmentCell";
import ProcessActionButtons from "./ProcessActionButtons";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useProcessDepartmentsResponsibility } from "@/hooks/useProcessDepartmentsResponsibility";

interface ProcessTableProps {
  processes: Process[];
  sortField: keyof Process;
  sortDirection: "asc" | "desc";
  toggleSort: (field: keyof Process) => void;
  getDepartmentName: (id: string) => string;
  getProcessTypeName: (id: string) => string;
  moveProcessToNextDepartment: (processId: string) => Promise<void>;
  moveProcessToPreviousDepartment: (processId: string) => Promise<void>;
  processTypes: ProcessType[];
  updateProcessType: (processId: string, newTypeId: string) => Promise<void>;
  updateProcessStatus?: (processId: string, newStatus: 'Em andamento' | 'Concluído' | 'Não iniciado') => Promise<void>;
  departments: Department[];
  startProcess?: (processId: string) => Promise<void>;
  filterProcesses?: (
    filters: any, 
    processesToFilter?: Process[]
  ) => Process[];
  filters?: {
    department?: string;
    status?: string;
    processType?: string;
    search?: string;
    excludeCompleted?: boolean;
  };
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
  filterProcesses,
  filters
}: ProcessTableProps) => {
  const navigate = useNavigate();
  const handleRowClick = (processId: string) => {
    navigate(`/processes/${processId}`);
  };

  // Função para obter a data de entrada mais recente para um departamento
  const getMostRecentEntryDate = (process: Process, departmentId: string): string | null => {
    const departmentEntries = process.history
      .filter(h => h.departmentId === departmentId)
      .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
    return departmentEntries.length > 0 ? departmentEntries[0].entryDate : null;
  };

  // Ordenar departamentos por ordem e filtrar o departamento "Concluído(a)"
  const sortedDepartments = [...departments]
    .filter(dept => dept.name !== "Concluído(a)")
    .sort((a, b) => a.order - b.order);
    
  // Obter o departamento "Concluído(a)" para referência
  const concludedDept = departments.find(dept => dept.name === "Concluído(a)");

  // Função para definir a cor de fundo com base no status
  const getRowBackgroundColor = (status: string) => {
    if (status === "completed") return "bg-green-200";
    if (status === "overdue") return "bg-red-200";
    if (status === "pending") return "bg-blue-200";
    if (status === "not_started") return "bg-green-200";
    return "";
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
              <TableCell colSpan={departments.length + 3} className="h-24 text-center">
                Nenhum processo encontrado
              </TableCell>
            </TableRow>
          ) : (
            processes.map(process => {
              // Para cada processo, vamos usar o hook de responsabilidade para obter os responsáveis
              const { processResponsible, departmentResponsibles } = useProcessDepartmentsResponsibility(
                process.id,
                sortedDepartments,
                (deptId) => process.currentDepartment === deptId,
                (deptId) => process.history.some(h => h.departmentId === deptId)
              );
              
              return (
                <TableRow 
                  key={process.id} 
                  className={cn(
                    "cursor-pointer hover:bg-gray-100",
                    getRowBackgroundColor(process.status)
                  )}
                  onClick={() => handleRowClick(process.id)}
                >
                  <TableCell className="font-medium">
                    {process.protocolNumber}
                  </TableCell>
                  <TableCell onClick={e => e.stopPropagation()}>
                    <ProcessTypePicker 
                      processId={process.id} 
                      currentTypeId={process.processType} 
                      processTypes={processTypes} 
                      getProcessTypeName={getProcessTypeName} 
                      updateProcessType={updateProcessType} 
                    />
                  </TableCell>
                  
                  {/* Células para cada departamento */}
                  {sortedDepartments.map(dept => {
                    const entryDate = getMostRecentEntryDate(process, dept.id);
                    const isPastDept = process.history.some(h => h.departmentId === dept.id) && 
                      (departments.find(d => d.id === dept.id)?.order || 0) < 
                      (departments.find(d => d.id === process.currentDepartment)?.order || 0);
                    const isActive = process.currentDepartment === dept.id;

                    // Verifica se o departamento está com prazo expirado
                    let isOverdue = false;
                    if (isActive && process.status !== "not_started") {
                      if (dept.timeLimit > 0 && entryDate) {
                        const entryDateTime = new Date(entryDate).getTime();
                        const deadlineTime = entryDateTime + dept.timeLimit * 24 * 60 * 60 * 1000;
                        const currentTime = new Date().getTime();
                        isOverdue = currentTime > deadlineTime;
                      }
                    }
                    
                    // Obtém o responsável do setor
                    const sectorResponsible = departmentResponsibles ? departmentResponsibles[dept.id] : null;
                    
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
                          processResponsible={processResponsible}
                          sectorResponsible={sectorResponsible}
                        />
                      </TableCell>
                    );
                  })}
                  
                  <TableCell onClick={e => e.stopPropagation()} className="text-center px-0">
                    <ProcessActionButtons 
                      processId={process.id} 
                      moveProcessToPreviousDepartment={moveProcessToPreviousDepartment} 
                      moveProcessToNextDepartment={moveProcessToNextDepartment} 
                      isFirstDepartment={process.currentDepartment === sortedDepartments[0]?.id}
                      isLastDepartment={process.currentDepartment === concludedDept?.id}
                      setIsEditing={() => {}} 
                      isEditing={false} 
                      status={process.status}
                      startProcess={startProcess}
                    />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProcessTable;
