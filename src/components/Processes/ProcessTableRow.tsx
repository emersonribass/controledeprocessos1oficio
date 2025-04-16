
import { TableRow, TableCell } from "@/components/ui/table";
import { Process, Department, ProcessType } from "@/types";
import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import ProcessDepartmentsSection from "./ProcessDepartmentsSection";
import ProcessActionButtons from "./ProcessActionButtons";
import { useProcessDepartmentInfo } from "@/hooks/useProcessDepartmentInfo";
import ProcessStatusBadge from "./ProcessStatusBadge";
import { useProcessResponsibility } from "@/hooks/useProcessResponsibility";
import { ProcessResponsible } from "@/hooks/process-responsibility/types";

interface ProcessTableRowProps {
  process: Process;
  departments: Department[];
  processTypes: ProcessType[];
  moveProcessToNextDepartment: (processId: string) => Promise<void>;
  moveProcessToPreviousDepartment: (processId: string) => Promise<void>;
  getProcessTypeName: (id: string) => string;
  updateProcessType: (processId: string, newTypeId: string) => Promise<void>;
  startProcess?: (processId: string) => Promise<void>;
  hasSectorResponsible?: boolean;
  onAcceptResponsibility?: () => Promise<void>;
  isAccepting?: boolean;
  canInitiateProcesses?: boolean;
  sectorResponsible?: any;
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
  hasSectorResponsible = false,
  onAcceptResponsibility,
  isAccepting = false,
  canInitiateProcesses = false,
  sectorResponsible
}: ProcessTableRowProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { getProcessResponsible, getSectorResponsible } = useProcessResponsibility();
  const [departmentResponsibles, setDepartmentResponsibles] = useState<Record<string, ProcessResponsible | null>>({});
  const [processResponsible, setProcessResponsible] = useState<ProcessResponsible | null>(null);
  const [isLoadingResponsibles, setIsLoadingResponsibles] = useState(false);

  // Extrair informações sobre departamentos
  const {
    sortedDepartments,
    isFirstDepartment,
    isLastDepartment,
    getMostRecentEntryDate,
    hasPassedDepartment,
    isCurrentDepartment,
    isPreviousDepartment,
    isDepartmentOverdue
  } = useProcessDepartmentInfo(process, departments);

  // Função para buscar responsáveis, otimizada para evitar chamadas desnecessárias
  const fetchResponsibles = useCallback(async () => {
    if (isLoadingResponsibles || !process.id) return;
    
    setIsLoadingResponsibles(true);
    console.log(`Buscando responsáveis para o processo: ${process.id}`);
    
    try {
      // Buscar o responsável pelo processo
      const responsible = await getProcessResponsible(process.id);
      setProcessResponsible(responsible);
      console.log("Responsável pelo processo:", responsible?.nome || "Nenhum");
      
      // Buscar responsáveis por departamento
      const deptResp: Record<string, ProcessResponsible | null> = {};
      
      // Buscar apenas para os departamentos relevantes
      const departmentsToFetch = sortedDepartments.filter(dept => 
        isCurrentDepartment(dept.id) || hasPassedDepartment(dept.id)
      );
      
      // Usar Promise.all para buscar em paralelo e melhorar a performance
      const promises = departmentsToFetch.map(async (dept) => {
        try {
          const sectorResp = await getSectorResponsible(process.id, dept.id);
          console.log(`Responsável do setor ${dept.id}:`, sectorResp?.nome || "Nenhum");
          return { deptId: dept.id, responsible: sectorResp };
        } catch (error) {
          console.error(`Erro ao buscar responsável do setor ${dept.id}:`, error);
          return { deptId: dept.id, responsible: null };
        }
      });
      
      const results = await Promise.all(promises);
      
      // Preencher o objeto com os resultados
      results.forEach(result => {
        deptResp[result.deptId] = result.responsible;
      });
      
      console.log("Departamentos e responsáveis:", deptResp);
      setDepartmentResponsibles(deptResp);
    } catch (error) {
      console.error("Erro ao buscar responsáveis:", error);
    } finally {
      setIsLoadingResponsibles(false);
    }
  }, [process.id, getProcessResponsible, getSectorResponsible, sortedDepartments, isCurrentDepartment, hasPassedDepartment, isLoadingResponsibles]);

  // Buscar responsáveis quando o componente é montado
  useEffect(() => {
    fetchResponsibles();
  }, [fetchResponsibles]);

  const isProcessStarted = process.status !== 'not_started';

  return (
    <TableRow className="cursor-pointer hover:bg-gray-50">
      <TableCell>
        <Link to={`/processes/${process.id}`} className="block w-full h-full">
          {process.protocolNumber}
        </Link>
      </TableCell>
      <TableCell>
        {isEditing ? (
          <select
            value={process.processType}
            onChange={(e) => {
              updateProcessType(process.id, e.target.value);
              setIsEditing(false);
            }}
            className="w-full p-2 border rounded"
          >
            {processTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        ) : (
          <Link to={`/processes/${process.id}`} className="block w-full h-full">
            {getProcessTypeName(process.processType)}
          </Link>
        )}
      </TableCell>
      <TableCell>
        <Link to={`/processes/${process.id}`} className="block w-full h-full">
          <ProcessStatusBadge status={process.status} />
        </Link>
      </TableCell>

      <ProcessDepartmentsSection
        sortedDepartments={sortedDepartments}
        isProcessStarted={isProcessStarted}
        getMostRecentEntryDate={getMostRecentEntryDate}
        hasPassedDepartment={hasPassedDepartment}
        isCurrentDepartment={isCurrentDepartment}
        isPreviousDepartment={isPreviousDepartment}
        isDepartmentOverdue={isDepartmentOverdue}
        processResponsible={processResponsible}
        departmentResponsibles={departmentResponsibles}
      />

      <TableCell>
        <ProcessActionButtons
          processId={process.id}
          moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
          moveProcessToNextDepartment={moveProcessToNextDepartment}
          isFirstDepartment={isFirstDepartment}
          isLastDepartment={isLastDepartment}
          setIsEditing={setIsEditing}
          isEditing={isEditing}
          status={process.status}
          startProcess={startProcess}
          hasSectorResponsible={hasSectorResponsible}
          protocolNumber={process.protocolNumber}
          onAcceptResponsibility={onAcceptResponsibility}
          isAccepting={isAccepting}
          sectorId={process.currentDepartment}
          sectorResponsible={sectorResponsible}
        />
      </TableCell>
    </TableRow>
  );
};

export default ProcessTableRow;
