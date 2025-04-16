
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Process, Department } from "@/types";

export interface ProcessTableHeaderProps {
  sortField?: keyof Process;
  sortDirection?: "asc" | "desc";
  toggleSort: (field: keyof Process) => void;
  departments: Department[];
  getDepartmentName: (id: string) => string;
}

const ProcessTableHeader = ({
  sortField,
  sortDirection,
  toggleSort,
  departments,
  getDepartmentName
}: ProcessTableHeaderProps) => {
  const renderSortIcon = (fieldName: keyof Process) => {
    if (sortField !== fieldName) return null;

    return sortDirection === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  return (
    <TableHeader>
      <TableRow>
        <TableHead
          className={cn(
            "cursor-pointer",
            sortField === "protocolNumber" && "text-primary"
          )}
          onClick={() => toggleSort("protocolNumber")}
        >
          <div className="flex items-center">
            Nº Protocolo
            {renderSortIcon("protocolNumber")}
          </div>
        </TableHead>
        <TableHead>Tipo</TableHead>
        
        {departments.slice(0, 5).map((dept) => (
          <TableHead key={dept.id} className="whitespace-nowrap">
            {getDepartmentName(dept.id)}
          </TableHead>
        ))}
        
        <TableHead>Ações</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default ProcessTableHeader;
