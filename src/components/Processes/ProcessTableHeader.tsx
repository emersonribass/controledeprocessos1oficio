
import { ArrowUpDown } from "lucide-react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Process } from "@/types";
import { Department } from "@/types";

interface ProcessTableHeaderProps {
  sortField: keyof Process;
  sortDirection: "asc" | "desc";
  toggleSort: (field: keyof Process) => void;
  departments: Department[];
}

const ProcessTableHeader = ({ 
  sortField, 
  sortDirection, 
  toggleSort,
  departments
}: ProcessTableHeaderProps) => {
  // Ordenar departamentos por ordem e filtrar o departamento "Concluído"
  const sortedDepartments = [...departments]
    .filter(dept => dept.name !== "Concluído(a)")
    .sort((a, b) => a.order - b.order);

  return (
    <TableHeader>
      <TableRow>
        <TableHead
          className="cursor-pointer whitespace-nowrap"
          onClick={() => toggleSort("protocolNumber")}
        >
          <div className="flex items-center">
            Protocolo
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        </TableHead>
        <TableHead className="whitespace-nowrap">Tipo</TableHead>
        
        {/* Colunas dinâmicas para cada departamento */}
        {sortedDepartments.map((dept) => (
          <TableHead key={dept.id} className="text-center whitespace-nowrap">
            {dept.name}
          </TableHead>
        ))}
        
        {/* Adicionando a coluna de status explicitamente */}
        <TableHead className="whitespace-nowrap">Status</TableHead>
        <TableHead className="text-right whitespace-nowrap">Ações</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default ProcessTableHeader;
