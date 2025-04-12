
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Department, Process, ProcessType } from "@/types";
import ProcessTableHeader from "./ProcessTableHeader";
import ProcessTypePicker from "./ProcessTypePicker";
import ProcessDepartmentCell from "./ProcessDepartmentCell";
import ProcessActionButtons from "./ProcessActionButtons";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useProcessResponsibility } from "@/hooks/useProcessResponsibility";
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/hooks/use-toast";

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
  startProcess
}: ProcessTableProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { getSectorResponsible, acceptProcessResponsibility, isAccepting } = useProcessResponsibility();
  
  // Estado para armazenar os responsáveis de cada processo
  const [processesResponsibles, setProcessesResponsibles] = useState<Record<string, any>>({});
  const [loadingResponsibles, setLoadingResponsibles] = useState<Record<string, boolean>>({});

  const handleRowClick = (processId: string) => {
    navigate(`/processes/${processId}`);
  };

  // Função para carregar os responsáveis de todos os processos
  useEffect(() => {
    const loadAllResponsibles = async () => {
      const newLoadingState: Record<string, boolean> = {};
      
      for (const process of processes) {
        if (process.currentDepartment) {
          newLoadingState[process.id] = true;
        }
      }
      
      setLoadingResponsibles(newLoadingState);
      
      const newResponsibles: Record<string, any> = {};
      
      for (const process of processes) {
        if (process.currentDepartment) {
          try {
            const responsible = await getSectorResponsible(process.id, process.currentDepartment);
            newResponsibles[process.id] = responsible;
          } catch (error) {
            console.error(`Erro ao carregar responsável para processo ${process.id}:`, error);
          } finally {
            setLoadingResponsibles(prev => ({...prev, [process.id]: false}));
          }
        }
      }
      
      setProcessesResponsibles(newResponsibles);
    };
    
    loadAllResponsibles();
  }, [processes]);

  // Função para aceitar a responsabilidade pelo processo
  const handleAcceptResponsibility = async (processId: string, protocolNumber?: string) => {
    if (!user || !protocolNumber) return;
    
    try {
      const success = await acceptProcessResponsibility(processId, protocolNumber);
      if (success) {
        // Atualiza o estado local após aceitar a responsabilidade
        const responsible = await getSectorResponsible(processId, processes.find(p => p.id === processId)?.currentDepartment || '');
        setProcessesResponsibles(prev => ({...prev, [processId]: responsible}));
        
        toast({
          title: "Sucesso",
          description: "Você aceitou a responsabilidade pelo processo."
        });
      }
    } catch (error) {
      console.error("Erro ao aceitar responsabilidade:", error);
    }
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
    return "";
  };
  
  // Adaptadores para converter as funções para Promise<void>
  const handleMoveToNext = async (processId: string): Promise<void> => {
    await moveProcessToNextDepartment(processId);
  };
  
  const handleMoveToPrevious = async (processId: string): Promise<void> => {
    await moveProcessToPreviousDepartment(processId);
  };
  
  const handleStartProcess = async (processId: string): Promise<void> => {
    if (startProcess) {
      await startProcess(processId);
    }
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
            processes.map(process => (
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
                })}
                
                <TableCell onClick={e => e.stopPropagation()} className="text-center px-0">
                  <ProcessActionButtons 
                    processId={process.id}
                    protocolNumber={process.protocolNumber}
                    moveProcessToPreviousDepartment={handleMoveToPrevious} 
                    moveProcessToNextDepartment={handleMoveToNext} 
                    isFirstDepartment={process.currentDepartment === sortedDepartments[0]?.id}
                    isLastDepartment={process.currentDepartment === concludedDept?.id}
                    setIsEditing={() => {}} 
                    isEditing={false} 
                    status={process.status}
                    startProcess={handleStartProcess}
                    hasSectorResponsible={!!processesResponsibles[process.id]}
                    onAcceptResponsibility={() => handleAcceptResponsibility(process.id, process.protocolNumber)}
                    isAccepting={isAccepting}
                    sectorId={process.currentDepartment}
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
