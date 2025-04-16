
import { TableBody } from "@/components/ui/table";
import { Process, Department, ProcessType } from "@/types";
import ProcessTableRow from "./ProcessTableRow";
import { useProcessResponsibility } from "@/hooks/useProcessResponsibility";

interface ProcessTableBodyProps {
  filteredProcesses: Process[];
  departments: Department[];
  processTypes: ProcessType[];
  moveProcessToNextDepartment: (processId: string) => Promise<void>;
  moveProcessToPreviousDepartment: (processId: string) => Promise<void>;
  getProcessTypeName: (id: string) => string;
  updateProcessType: (processId: string, newTypeId: string) => Promise<void>;
  startProcess?: (processId: string) => Promise<void>;
  isUserInAttendanceSector: () => boolean;
  responsiblesData?: Record<string, Record<string, any>>;
}

const ProcessTableBody = ({
  filteredProcesses,
  departments,
  processTypes,
  moveProcessToNextDepartment,
  moveProcessToPreviousDepartment,
  getProcessTypeName,
  updateProcessType,
  startProcess,
  isUserInAttendanceSector,
  responsiblesData = {}
}: ProcessTableBodyProps) => {
  const { acceptProcessResponsibility, isAccepting } = useProcessResponsibility();
  
  // Se não houver processos, retornar null para que a tabela possa mostrar uma mensagem personalizada
  if (filteredProcesses.length === 0) {
    return null;
  }

  return (
    <TableBody>
      {filteredProcesses.map((process) => {
        // Determinar se o usuário está no setor de atendimento para iniciar processos
        const canInitiateProcesses = isUserInAttendanceSector();
        
        // Verificar se há um responsável designado para o setor atual
        const hasSectorResponsible = !!(
          process.currentDepartment && 
          responsiblesData[process.id]?.[process.currentDepartment]
        );
        
        // Criar função de aceitação de responsabilidade para este processo específico
        const handleAcceptResponsibility = async () => {
          if (!process.protocolNumber) return;
          await acceptProcessResponsibility(process.id, process.protocolNumber);
        };
        
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
            onAcceptResponsibility={handleAcceptResponsibility}
            isAccepting={isAccepting}
            hasSectorResponsible={hasSectorResponsible}
            canInitiateProcesses={canInitiateProcesses}
            responsiblesData={responsiblesData}
          />
        );
      })}
    </TableBody>
  );
};

export default ProcessTableBody;
