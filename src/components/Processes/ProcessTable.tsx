
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Department, Process, ProcessType } from "@/types";
import ProcessTableHeader from "./ProcessTableHeader";
import ProcessTableRow from "./ProcessTableRow";

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
  updateProcessStatus,
  departments,
}: ProcessTableProps) => {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <ProcessTableHeader
          sortField={sortField}
          sortDirection={sortDirection}
          toggleSort={toggleSort}
          departments={departments}
        />
        <TableBody>
          {processes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={departments.length + 4} className="h-24 text-center">
                Nenhum processo encontrado
              </TableCell>
            </TableRow>
          ) : (
            processes.map((process) => (
              <ProcessTableRow
                key={process.id}
                process={process}
                departments={departments}
                getDepartmentName={getDepartmentName}
                getProcessTypeName={getProcessTypeName}
                moveProcessToNextDepartment={moveProcessToNextDepartment}
                moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
                processTypes={processTypes}
                updateProcessType={updateProcessType}
                updateProcessStatus={updateProcessStatus}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProcessTable;
