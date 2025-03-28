
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Eye, MoveRight, MoveLeft } from "lucide-react";
import { useProcesses } from "@/hooks/useProcesses";
import { Process } from "@/types";
import { format } from "date-fns";
import ProcessFilters from "./ProcessFilters";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const ProcessList = () => {
  const navigate = useNavigate();
  const {
    filterProcesses,
    getDepartmentName,
    getProcessTypeName,
    moveProcessToNextDepartment,
    moveProcessToPreviousDepartment,
  } = useProcesses();

  const [filters, setFilters] = useState<{
    department?: string;
    status?: string;
    processType?: string;
    search?: string;
  }>({});

  const [sortField, setSortField] = useState<keyof Process>("protocolNumber");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const filteredProcesses = filterProcesses(filters);

  // Sort processes
  const sortedProcesses = [...filteredProcesses].sort((a, b) => {
    if (sortField === "startDate" || sortField === "expectedEndDate") {
      const dateA = new Date(a[sortField]).getTime();
      const dateB = new Date(b[sortField]).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    }

    if (a[sortField] < b[sortField]) {
      return sortDirection === "asc" ? -1 : 1;
    }
    if (a[sortField] > b[sortField]) {
      return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });

  const toggleSort = (field: keyof Process) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Concluído</Badge>;
      case "overdue":
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Atrasado</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Em andamento</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <div>
      <ProcessFilters filters={filters} setFilters={setFilters} />

      <div className="rounded-md border">
        <Table>
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
          <TableBody>
            {sortedProcesses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Nenhum processo encontrado
                </TableCell>
              </TableRow>
            ) : (
              sortedProcesses.map((process) => (
                <TableRow
                  key={process.id}
                  className={cn(
                    process.status === "overdue" ? "bg-destructive/5" : ""
                  )}
                >
                  <TableCell className="font-medium">
                    {process.protocolNumber}
                  </TableCell>
                  <TableCell>{getProcessTypeName(process.processType)}</TableCell>
                  <TableCell>{getDepartmentName(process.currentDepartment)}</TableCell>
                  <TableCell>
                    {format(new Date(process.startDate), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>{getStatusBadge(process.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveProcessToPreviousDepartment(process.id)}
                        disabled={process.currentDepartment === "1"}
                      >
                        <MoveLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveProcessToNextDepartment(process.id)}
                        disabled={process.currentDepartment === "10"}
                      >
                        <MoveRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/processes/${process.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProcessList;
