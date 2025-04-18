
import { ArrowUpDown } from "lucide-react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Process, Department } from "@/types";

interface ProcessTableHeaderProps {
  sortField: keyof Process;
  sortDirection: "asc" | "desc";
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
  const sortedDepartments = [...departments]
    .filter(dept => dept.name !== "Concluído(a)")
    .sort((a, b) => a.order - b.order);
  
  const handleSortClick = (field: keyof Process, event: React.MouseEvent) => {
    event.stopPropagation();
    toggleSort(field);
  };
  
  return (
    <TableHeader>
      <TableRow>
        <TableHead 
          className="w-[70px] whitespace-nowrap" 
          onClick={(e) => handleSortClick("protocolNumber", e)}
        >
          <div className="flex items-center">
            Protocolo
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        </TableHead>
        
        <TableHead className="w-[150px] text-center whitespace-nowrap">Tipo</TableHead>
        
        {sortedDepartments.map(dept => (
          <TableHead 
            key={dept.id} 
            className="text-center whitespace-nowrap min-w-[150px]"
          >
            {dept.name}
          </TableHead>
        ))}
        
        <TableHead className="w-[120px] text-right whitespace-nowrap">Ações</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default ProcessTableHeader;
