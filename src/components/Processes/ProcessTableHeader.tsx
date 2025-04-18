
import { ArrowUpDown } from "lucide-react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Process } from "@/types";
import { Department } from "@/types";

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
  // Ordenar departamentos por ordem e filtrar o departamento "Concluído"
  const sortedDepartments = [...departments].filter(dept => dept.name !== "Concluído(a)").sort((a, b) => a.order - b.order);
  
  // Handler de clique para ordenação
  const handleSortClick = (field: keyof Process, event: React.MouseEvent) => {
    event.stopPropagation(); // Impede a propagação do evento para células
    toggleSort(field);
  };
  
  return <TableHeader>
      <TableRow>
        <TableHead 
          className="cursor-pointer w-[180px] px-2" 
          onClick={(e) => handleSortClick("protocolNumber", e)}
        >
          <div className="flex items-center">
            Protocolo
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        </TableHead>
        <TableHead className="w-[180px] px-2">Tipo</TableHead>
        
        {sortedDepartments.map(dept => (
          <TableHead key={dept.id} className="text-center px-2">
            {dept.name}
          </TableHead>
        ))}
        
        <TableHead className="text-right w-[120px] px-2">Ações</TableHead>
      </TableRow>
    </TableHeader>;
};

export default ProcessTableHeader;
