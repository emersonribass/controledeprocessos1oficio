
import { TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Process, Department, ProcessType } from "@/types";
import ProcessTableRow from "./ProcessTableRow";
import { useProcessResponsibility } from "@/hooks/useProcessResponsibility";
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface ProcessTableBodyProps {
  processes: Process[];
  departments: Department[];
  processTypes: ProcessType[];
  moveProcessToNextDepartment: (processId: string) => Promise<void>;
  moveProcessToPreviousDepartment: (processId: string) => Promise<void>;
  getProcessTypeName: (id: string) => string;
  updateProcessType: (processId: string, newTypeId: string) => Promise<void>;
  startProcess?: (processId: string) => Promise<void>;
  processesResponsibles: Record<string, any>;
  isUserInAttendanceSector?: () => boolean;
  sortField: keyof Process;
  sortDirection: "asc" | "desc";
  queueSectorForLoading: (processId: string, sectorId: string) => void;
  isLoading: boolean;
  canInitiateProcesses?: boolean;
}

const ProcessTableBody = ({
  processes,
  departments,
  processTypes,
  moveProcessToNextDepartment,
  moveProcessToPreviousDepartment,
  getProcessTypeName,
  updateProcessType,
  startProcess,
  processesResponsibles,
  isUserInAttendanceSector = () => false,
  sortField,
  sortDirection,
  queueSectorForLoading,
  isLoading
}: ProcessTableBodyProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { acceptProcessResponsibility, isAccepting } = useProcessResponsibility();
  const [acceptingProcessId, setAcceptingProcessId] = useState<string | null>(null);
  
  // Função para aceitar a responsabilidade pelo processo
  const handleAcceptResponsibility = async (processId: string, protocolNumber?: string) => {
    if (!user || !protocolNumber) return;
    
    setAcceptingProcessId(processId);
    try {
      const success = await acceptProcessResponsibility(processId, protocolNumber);
      
      if (success) {
        toast({
          title: "Sucesso",
          description: "Você aceitou a responsabilidade pelo processo."
        });
        // Atualizar cache de responsáveis
        queueSectorForLoading(processId, processes.find(p => p.id === processId)?.currentDepartment || "");
      }
    } catch (error) {
      console.error("Erro ao aceitar responsabilidade:", error);
    } finally {
      setAcceptingProcessId(null);
    }
  };

  // Função para verificar se existe um responsável para o processo no setor atual
  const hasSectorResponsible = (processId: string, currentDepartment: string) => {
    return !!(
      processesResponsibles[processId] && 
      processesResponsibles[processId][currentDepartment]
    );
  };

  if (isLoading) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={departments.length + 3} className="h-24 text-center">
            <div className="flex justify-center items-center">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Carregando processos...
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  if (processes.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={departments.length + 3} className="h-24 text-center">
            Nenhum processo encontrado
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {processes.map(process => (
        <ProcessTableRow
          key={process.id}
          process={process}
          departments={departments}
          processTypes={processTypes}
          moveProcessToNextDepartment={moveProcessToNextDepartment}
          moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
          getProcessTypeName={getProcessTypeName}
          updateProcessType={updateProcessType}
          startProcess={startProcess}
          hasSectorResponsible={hasSectorResponsible(process.id, process.currentDepartment)}
          onAcceptResponsibility={() => handleAcceptResponsibility(process.id, process.protocolNumber)}
          isAccepting={isAccepting && acceptingProcessId === process.id}
          canInitiateProcesses={isUserInAttendanceSector()}
          processResponsibles={processesResponsibles[process.id]}
        />
      ))}
    </TableBody>
  );
};

export default ProcessTableBody;
