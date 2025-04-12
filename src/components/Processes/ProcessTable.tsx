
import { Table } from "@/components/ui/table";
import { Department, Process, ProcessType } from "@/types";
import ProcessTableHeader from "./ProcessTableHeader";
import { useNavigate } from "react-router-dom";
import { useProcessTableUtilities } from "./ProcessTableUtilities";
import ProcessTableBody from "./ProcessTableBody";
import ProcessTableResponsibles from "./ProcessTableResponsibles";

interface ProcessTableProps {
  processes: Process[];
  sortField: keyof Process;
  sortDirection: "asc" | "desc";
  toggleSort: (field: keyof Process) => void;
  getDepartmentName: (id: string) => string;
  getProcessTypeName: (id: string) => string;
  moveProcessToNextDepartment: (processId: string) => void;
  moveProcessToPreviousDepartment: (processId: string) => void;
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
  departments,
  startProcess
}: ProcessTableProps) => {
  const navigate = useNavigate();
  const { sortedDepartments, concludedDept } = useProcessTableUtilities(departments);
  
  // Use o hook que gerencia os responsáveis dos processos
  const responsiblesManager = ProcessTableResponsibles({ processes });

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <ProcessTableHeader 
          sortField={sortField} 
          sortDirection={sortDirection} 
          toggleSort={toggleSort} 
          departments={departments} 
        />
        <ProcessTableBody
          processes={processes}
          departments={departments}
          sortedDepartments={sortedDepartments}
          concludedDept={concludedDept}
          getDepartmentName={getDepartmentName}
          getProcessTypeName={getProcessTypeName}
          moveProcessToNextDepartment={moveProcessToNextDepartment}
          moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
          processTypes={processTypes}
          updateProcessType={updateProcessType}
          startProcess={startProcess}
          responsiblesManager={responsiblesManager}
        />
      </Table>
    </div>
  );
};

export default ProcessTable;
