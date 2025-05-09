
import { TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Process, Department, ProcessType } from "@/types";
import ProcessTableRow from "./ProcessTableRow";
import { useProcessResponsibility } from "@/hooks/useProcessResponsibility";
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createLogger } from "@/utils/loggerUtils";

const logger = createLogger("ProcessTableBody");

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
  
  logger.debug("ProcessTableBody renderizado com", processes.length, "processos");
  logger.debug("processesResponsibles recebido:", 
    processesResponsibles ? Object.keys(processesResponsibles).length : 0, 
    "processos com responsáveis"
  );

  // Log detalhado da estrutura de responsáveis
  if (processesResponsibles) {
    Object.keys(processesResponsibles).forEach(processId => {
      const setoresList = Object.keys(processesResponsibles[processId] || {})
        .filter(key => key !== 'initial');
      logger.debug(`Processo ${processId}: ${setoresList.length} setores com responsáveis: ${setoresList.join(', ')}`);
    });
  }
  
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
        const currentProcess = processes.find(p => p.id === processId);
        if (currentProcess) {
          logger.info(`Atualizando responsáveis após aceite para processo ${processId}, setor ${currentProcess.currentDepartment}`);
          queueSectorForLoading(processId, currentProcess.currentDepartment);
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
    // Verificar se o processId e o currentDepartment existem
    if (!processId || !currentDepartment) {
      logger.warn(`hasSectorResponsible chamado com valores inválidos: processId=${processId}, setor=${currentDepartment}`);
      return false;
    }
    
    // Verificar se temos dados para este processo
    if (!processesResponsibles || !processesResponsibles[processId]) {
      logger.debug(`Sem dados de responsáveis para processo ${processId}`);
      return false;
    }
    
    // Verificar se temos um responsável para este setor
    const hasResponsible = !!processesResponsibles[processId][currentDepartment];
    
    logger.debug(`[hasSectorResponsible] Processo ${processId}, Setor ${currentDepartment}: ${hasResponsible ? "TEM" : "NÃO TEM"} responsável`);
    
    // Log dos setores disponíveis
    const availableSectors = Object.keys(processesResponsibles[processId])
      .filter(key => key !== 'initial');
      
    if (availableSectors.length > 0) {
      logger.debug(`Setores disponíveis para processo ${processId}: ${availableSectors.join(', ')}`);
    }
    
    return hasResponsible;
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
      {processes.map(process => {
        // Verificar se temos os dados necessários para esta linha
        logger.debug(`Renderizando linha para processo ${process.id} (${process.protocolNumber}), setor atual: ${process.currentDepartment}`);
        
        // Adicionar log para verificar os valores para cada processo
        const hasResponsible = hasSectorResponsible(process.id, process.currentDepartment);
        
        // Verificar quais responsáveis estão disponíveis para este processo
        const processResponsibles = processesResponsibles[process.id] || {};
        logger.debug(
          `Processo ${process.id}: ` +
          `${Object.keys(processResponsibles).length} responsáveis disponíveis, ` +
          `hasSectorResponsible=${hasResponsible}, ` + 
          `currentDepartment=${process.currentDepartment}`
        );
        
        return (
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
            hasSectorResponsible={hasResponsible}
            onAcceptResponsibility={() => handleAcceptResponsibility(process.id, process.protocolNumber)}
            isAccepting={isAccepting && acceptingProcessId === process.id}
            canInitiateProcesses={isUserInAttendanceSector()}
            processResponsibles={processesResponsibles[process.id]}
          />
        );
      })}
    </TableBody>
  );
};

export default ProcessTableBody;
