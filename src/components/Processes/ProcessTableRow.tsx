
import { TableRow, TableCell } from "@/components/ui/table";
import { Process, Department, ProcessType } from "@/types";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import ProcessTypePicker from "./ProcessTypePicker";
import ProcessDepartmentsSection from "./ProcessDepartmentsSection";
import ProcessRowActions from "./ProcessRowActions";
import { useProcessDepartmentInfo } from "@/hooks/useProcessDepartmentInfo";
import { useProcessRowResponsibility } from "@/hooks/useProcessRowResponsibility";
import { useAuth } from "@/hooks/auth";

interface ProcessTableRowProps {
  process: Process;
  departments: Department[];
  processTypes: ProcessType[];
  moveProcessToNextDepartment: (processId: string) => Promise<void>;
  moveProcessToPreviousDepartment: (processId: string) => Promise<void>;
  getProcessTypeName: (id: string) => string;
  updateProcessType: (processId: string, newTypeId: string) => Promise<void>;
  startProcess?: (processId: string) => Promise<void>;
  onAcceptResponsibility: () => Promise<void>;
  isAccepting: boolean;
  hasSectorResponsible?: boolean; 
  canInitiateProcesses?: boolean; 
}

const ProcessTableRow = ({
  process,
  departments,
  processTypes,
  moveProcessToNextDepartment,
  moveProcessToPreviousDepartment,
  getProcessTypeName,
  updateProcessType,
  startProcess,
  onAcceptResponsibility,
  isAccepting,
  hasSectorResponsible = false,
  canInitiateProcesses = false
}: ProcessTableRowProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Usar o hook para obter informações sobre responsabilidade
  const { sectorResponsible, isSectorResponsible } = useProcessRowResponsibility(process.id, process.currentDepartment);
  
  // Verificar se o usuário é responsável pelo processo
  const isProcessResponsible = user && (process.userId === user.id || process.responsibleUserId === user.id);
  
  // Verificar se há um responsável para o setor atual
  // Importante: verificamos tanto o hasSectorResponsible (que pode vir de um contexto mais amplo)
  // quanto o sectorResponsible (que é buscado diretamente por este componente)
  const hasResponsible = hasSectorResponsible || !!sectorResponsible;
  
  const {
    sortedDepartments,
    concludedDept,
    isFirstDepartment,
    isLastDepartment,
    getMostRecentEntryDate,
    hasPassedDepartment,
    isCurrentDepartment,
    isPreviousDepartment,
    isDepartmentOverdue
  } = useProcessDepartmentInfo(process, departments);

  // Função para definir a cor de fundo com base no status
  const getRowBackgroundColor = (status: string) => {
    if (status === "completed") return "bg-green-200";
    if (status === "overdue") return "bg-red-200";
    if (status === "pending") return "bg-blue-200";
    return "";
  };

  const handleRowClick = (e: React.MouseEvent) => {
    // Não navegar se o clique foi em um elemento de ação (botões, selects, etc)
    if ((e.target as HTMLElement).closest('.process-action')) {
      e.stopPropagation();
      return;
    }
    
    navigate(`/processes/${process.id}`);
  };

  // Adicionar highlight para linhas onde o usuário é responsável
  const getRowHighlight = () => {
    if (isSectorResponsible) return "border-l-4 border-primary";
    return "";
  };

  // Verificar se o usuário é administrador - usando o email atual
  // Precisamos passar o email do usuário como argumento para isAdmin
  const userEmail = user?.email || "";
  const isUserAdmin = user ? user.isAdmin || false : false;

  return (
    <TableRow 
      className={cn(
        "cursor-pointer hover:bg-gray-100",
        getRowBackgroundColor(process.status),
        getRowHighlight()
      )}
      onClick={handleRowClick}
    >
      <TableCell className="font-medium">
        {process.protocolNumber}
      </TableCell>
      <TableCell className="process-action" onClick={e => e.stopPropagation()}>
        <ProcessTypePicker 
          processId={process.id} 
          currentTypeId={process.processType} 
          processTypes={processTypes} 
          getProcessTypeName={getProcessTypeName} 
          updateProcessType={updateProcessType} 
        />
      </TableCell>
      
      <ProcessDepartmentsSection 
        sortedDepartments={sortedDepartments}
        isProcessStarted={process.status !== "not_started"}
        getMostRecentEntryDate={(departmentId) => getMostRecentEntryDate(departmentId)}
        hasPassedDepartment={(departmentId) => hasPassedDepartment(departmentId)}
        isCurrentDepartment={(departmentId) => isCurrentDepartment(departmentId)}
        isPreviousDepartment={(departmentId) => isPreviousDepartment(departmentId)}
        isDepartmentOverdue={(departmentId, isProcessStarted) => isDepartmentOverdue(departmentId, isProcessStarted)}
      />
      
      <ProcessRowActions 
        processId={process.id}
        protocolNumber={process.protocolNumber}
        moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
        moveProcessToNextDepartment={moveProcessToNextDepartment}
        isFirstDepartment={isFirstDepartment}
        isLastDepartment={isLastDepartment}
        status={process.status}
        startProcess={canInitiateProcesses || process.status !== "not_started" ? startProcess : undefined}
        hasSectorResponsible={hasResponsible}
        onAcceptResponsibility={onAcceptResponsibility}
        isAccepting={isAccepting}
        sectorId={process.currentDepartment}
        isSectorResponsible={isSectorResponsible}
        isProcessResponsible={isProcessResponsible}
        isAdmin={isUserAdmin}
      />
    </TableRow>
  );
};

export default ProcessTableRow;
