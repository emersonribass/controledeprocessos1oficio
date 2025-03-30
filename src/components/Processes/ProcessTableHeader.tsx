
import { ArrowUpDown } from "lucide-react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Process } from "@/types";

interface ProcessTableHeaderProps {
  sortField: keyof Process;
  sortDirection: "asc" | "desc";
  toggleSort: (field: keyof Process) => void;
}

const ProcessTableHeader = ({ 
  sortField, 
  sortDirection, 
  toggleSort 
}: ProcessTableHeaderProps) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          className="cursor-pointer"
          onClick={() => toggleSort("protocolNumber")}
        >
          <div className="flex items-center">
            Protocolo
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        </TableHead>
        <TableHead>Tipo</TableHead>
        <TableHead>Departamento</TableHead>
        <TableHead
          className="cursor-pointer"
          onClick={() => toggleSort("startDate")}
        >
          <div className="flex items-center">
            Data Início
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        </TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="text-right">Ações</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default ProcessTableHeader;
