
import { Process } from "@/types";
import { Table, TableBody, TableHeader } from "@/components/ui/table";
import ProcessTableHeader from "./ProcessTableHeader";
import ProcessTableBody from "./ProcessTableBody";
import { useProcessListSorting } from "@/hooks/useProcessListSorting";
import { useProcesses } from "@/hooks/useProcesses";
import { useDepartmentsData } from "@/hooks/useDepartmentsData";
import { useProcessTypes } from "@/hooks/useProcessTypes";
import { useState } from "react";

interface ProcessTableProps {
  processes: Process[];
  processesResponsibles?: Record<string, any>;
  isLoading?: boolean;
}

const ProcessTable = ({ 
  processes, 
  processesResponsibles = {}, 
  isLoading = false 
}: ProcessTableProps) => {
  const { sortField, sortDirection, toggleSort } = useProcessListSorting();
  const { departments, getDepartmentName } = useDepartmentsData();
  const { processTypes, getProcessTypeName } = useProcessTypes();
  const { 
    moveProcessToNextDepartment, 
    moveProcessToPreviousDepartment,
    updateProcessType,
    startProcess,
    isUserInAttendanceSector
  } = useProcesses();
  
  const [loadingSector, setLoadingSector] = useState<{processId: string, sectorId: string} | null>(null);
  
  const queueSectorForLoading = (processId: string, sectorId: string) => {
    setLoadingSector({ processId, sectorId });
    // Atualizará automaticamente quando o responsável mudar
    setTimeout(() => setLoadingSector(null), 2000);
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <ProcessTableHeader 
            sortField={sortField}
            sortDirection={sortDirection}
            toggleSort={toggleSort}
            departments={departments}
            getDepartmentName={getDepartmentName}
          />
        </TableHeader>
        <TableBody>
          <ProcessTableBody 
            processes={processes} 
            departments={departments}
            processTypes={processTypes}
            moveProcessToNextDepartment={moveProcessToNextDepartment}
            moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
            getProcessTypeName={getProcessTypeName}
            updateProcessType={updateProcessType}
            startProcess={startProcess}
            processesResponsibles={processesResponsibles}
            isUserInAttendanceSector={isUserInAttendanceSector}
            sortField={sortField}
            sortDirection={sortDirection}
            queueSectorForLoading={queueSectorForLoading}
            isLoading={isLoading}
            canInitiateProcesses={isUserInAttendanceSector()}
          />
        </TableBody>
      </Table>
    </div>
  );
};

export default ProcessTable;
