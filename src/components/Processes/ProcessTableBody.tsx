
import { TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Process, Department, ProcessType } from "@/types";
import ProcessTableRow from "./ProcessTableRow";
import { useProcessResponsibility } from "@/hooks/useProcessResponsibility";
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface ProcessTableBodyProps {
  processes: Process[];
  departments: Department[];
  processTypes: ProcessType[];
  moveProcessToNextDepartment: (processId: string) => Promise<void>;
  moveProcessToPreviousDepartment: (processId: string) => Promise<void>;
  getProcessTypeName: (id: string) => string;
  updateProcessType: (processId: string, newTypeId: string) => Promise<void>;
  startProcess?: (processId: string) => Promise<void>;
  isUserInAttendanceSector?: () => boolean;
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
  isUserInAttendanceSector = () => false
}: ProcessTableBodyProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { acceptProcessResponsibility, isAccepting, getProcessResponsible, getSectorResponsible } = useProcessResponsibility();
  const [acceptingProcessId, setAcceptingProcessId] = useState<string | null>(null);
  
  // Estado para armazenar responsáveis de processos
  const [processesResponsibles, setProcessesResponsibles] = useState<Record<string, any>>({});
  
  // Efeito para carregar responsáveis quando a lista de processos mudar
  useEffect(() => {
    const loadResponsibles = async () => {
      // Inicializa o objeto para armazenar os responsáveis
      const responsibleData: Record<string, any> = {};
      
      // Para cada processo, busca seu responsável e os responsáveis do setor atual
      for (const process of processes) {
        responsibleData[process.id] = {};
        
        // Busca o responsável do processo
        const processResp = await getProcessResponsible(process.id);
        responsibleData[process.id].processResponsible = processResp;
        
        // Busca o responsável do setor atual
        if (process.currentDepartment) {
          const sectorResp = await getSectorResponsible(process.id, process.currentDepartment);
          responsibleData[process.id][process.currentDepartment] = sectorResp;
        }
      }
      
      setProcessesResponsibles(responsibleData);
    };
    
    if (processes.length > 0) {
      loadResponsibles();
    }
  }, [processes, getProcessResponsible, getSectorResponsible]);
  
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
        
        // Atualiza os responsáveis após a aceitação
        const processResp = await getProcessResponsible(processId);
        const process = processes.find(p => p.id === processId);
        
        if (process) {
          const sectorResp = await getSectorResponsible(processId, process.currentDepartment);
          
          setProcessesResponsibles(prev => ({
            ...prev,
            [processId]: {
              ...prev[processId],
              processResponsible: processResp,
              [process.currentDepartment]: sectorResp
            }
          }));
        }
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
          sectorResponsible={processesResponsibles[process.id]?.[process.currentDepartment]}
          processResponsible={processesResponsibles[process.id]?.processResponsible}
        />
      ))}
    </TableBody>
  );
};

export default ProcessTableBody;
