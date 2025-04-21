
import { Process } from "@/types";
import { Table, TableBody, TableHeader } from "@/components/ui/table";
import ProcessTableHeader from "./ProcessTableHeader";
import ProcessTableBody from "./ProcessTableBody";

interface ProcessTableProps {
  processes: Process[];
  processesResponsibles?: Record<string, any>;
}

const ProcessTable = ({ processes, processesResponsibles = {} }: ProcessTableProps) => {
  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <ProcessTableHeader />
        </TableHeader>
        <TableBody>
          <ProcessTableBody 
            processes={processes} 
            processesResponsibles={processesResponsibles} 
          />
        </TableBody>
      </Table>
    </div>
  );
};

export default ProcessTable;
