
import { TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Department, Process, ProcessType } from "@/types";
import ProcessTableRow from "./ProcessTableRow";
import { useEffect, useMemo } from "react";

interface ProcessTableBodyProps {
  processes: Process[];
  departments: Department[];
  sortField: keyof Process;
  sortDirection: "asc" | "desc";
  getDepartmentName: (id: string) => string;
  getProcessTypeName: (id: string) => string;
  moveProcessToNextDepartment: (processId: string) => Promise<void>;
  moveProcessToPreviousDepartment: (processId: string) => Promise<void>;
  processTypes: ProcessType[];
  updateProcessType: (processId: string, newTypeId: string) => Promise<void>;
  startProcess?: (processId: string) => Promise<void>;
  getProcessResponsible: (processId: string) => any;
  getSectorResponsible: (processId: string, sectorId: string) => any;
  queueProcessForLoading: (processId: string) => void;
  queueSectorForLoading: (processId: string, sectorId: string) => void;
}

const ProcessTableBody = ({
  processes,
  departments,
  sortField,
  sortDirection,
  getDepartmentName,
  getProcessTypeName,
  moveProcessToNextDepartment,
  moveProcessToPreviousDepartment,
  processTypes,
  updateProcessType,
  startProcess,
  getProcessResponsible,
  getSectorResponsible,
  queueProcessForLoading,
  queueSectorForLoading
}: ProcessTableBodyProps) => {
  // Ordenar departamentos por ordem e filtrar o departamento "Concluído(a)"
  const sortedDepartments = useMemo(() => {
    return [...departments]
      .filter(dept => dept.name !== "Concluído(a)")
      .sort((a, b) => a.order - b.order);
  }, [departments]);
    
  // Obter o departamento "Concluído(a)" para referência
  const concludedDept = useMemo(() => departments.find(dept => dept.name === "Concluído(a)"), [departments]);

  // Função para obter a data de entrada mais recente para um departamento
  const getMostRecentEntryDate = (process: Process, departmentId: string): string | null => {
    const departmentEntries = process.history
      .filter(h => h.departmentId === departmentId)
      .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
    return departmentEntries.length > 0 ? departmentEntries[0].entryDate : null;
  };

  // Pré-carrega todos os processos e setores relevantes quando a tabela é montada
  useEffect(() => {
    if (!processes.length) return;
    
    // Prepara lotes para todas as combinações necessárias
    processes.forEach(process => {
      // Carrega o responsável pelo processo
      queueProcessForLoading(process.id);
      
      // Carrega os responsáveis pelos setores relevantes
      departments.forEach(dept => {
        const isPastDept = process.history.some(h => h.departmentId === dept.id);
        const isActive = process.currentDepartment === dept.id;
        
        if (isActive || isPastDept) {
          queueSectorForLoading(process.id, dept.id);
        }
      });
    });
  }, [processes, departments, queueProcessForLoading, queueSectorForLoading]);

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
          sortedDepartments={sortedDepartments}
          getMostRecentEntryDate={getMostRecentEntryDate}
          getProcessTypeName={getProcessTypeName}
          getProcessResponsible={getProcessResponsible}
          getSectorResponsible={getSectorResponsible}
          departments={departments}
          concludedDept={concludedDept}
          processTypes={processTypes}
          updateProcessType={updateProcessType}
          moveProcessToNextDepartment={moveProcessToNextDepartment}
          moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
          startProcess={startProcess}
        />
      ))}
    </TableBody>
  );
};

export default ProcessTableBody;
