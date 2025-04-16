
import { Table } from "@/components/ui/table";
import ProcessTableHeader from "./ProcessTableHeader";
import ProcessTableBody from "./ProcessTableBody";
import { Process, Department, ProcessType } from "@/types";

interface ProcessTableProps {
  processes: Process[];
  filteredProcesses: Process[];
  sortField?: keyof Process;
  sortDirection?: "asc" | "desc";
  toggleSort: (field: keyof Process) => void;
  getDepartmentName: (id: string) => string;
  getProcessTypeName: (id: string) => string;
  moveProcessToNextDepartment: (processId: string) => Promise<void>;
  moveProcessToPreviousDepartment: (processId: string) => Promise<void>;
  departments: Department[];
  processTypes: ProcessType[];
  updateProcessType: (processId: string, newTypeId: string) => Promise<void>;
  startProcess?: (processId: string) => Promise<void>;
  isUserInAttendanceSector: () => boolean;
  responsiblesData?: Record<string, Record<string, any>>;
}

const ProcessTable = ({
  filteredProcesses,
  sortField,
  sortDirection,
  toggleSort,
  getDepartmentName,
  getProcessTypeName,
  moveProcessToNextDepartment,
  moveProcessToPreviousDepartment,
  departments,
  processTypes,
  updateProcessType,
  startProcess,
  isUserInAttendanceSector,
  responsiblesData
}: ProcessTableProps) => {
  const isEmpty = filteredProcesses.length === 0;

  return (
    <div className="rounded-md border">
      <Table>
        <ProcessTableHeader
          sortField={sortField}
          sortDirection={sortDirection}
          toggleSort={toggleSort}
          departments={departments}
          getDepartmentName={getDepartmentName}
        />
        {!isEmpty ? (
          <ProcessTableBody
            filteredProcesses={filteredProcesses}
            departments={departments}
            processTypes={processTypes}
            moveProcessToNextDepartment={moveProcessToNextDepartment}
            moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
            getProcessTypeName={getProcessTypeName}
            updateProcessType={updateProcessType}
            startProcess={startProcess}
            isUserInAttendanceSector={isUserInAttendanceSector}
            responsiblesData={responsiblesData}
          />
        ) : null}
      </Table>
      {isEmpty && (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="text-muted-foreground text-sm">
            Nenhum processo encontrado
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Tente ajustar os filtros ou criar um novo processo
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessTable;
