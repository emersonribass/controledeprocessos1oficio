
import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useProcesses } from "@/hooks/useProcesses";

interface ProcessFiltersProps {
  filters: {
    department?: string;
    status?: string;
    processType?: string;
    search?: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      department?: string;
      status?: string;
      processType?: string;
      search?: string;
    }>
  >;
}

const ProcessFilters = ({ filters, setFilters }: ProcessFiltersProps) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const { departments, processTypes } = useProcesses();
  const [search, setSearch] = useState(filters.search || "");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search });
  };

  const handleStatusChange = (status: string) => {
    setFilters({ ...filters, status: status || undefined });
  };

  const handleDepartmentChange = (departmentId: string) => {
    setFilters({ ...filters, department: departmentId || undefined });
  };

  const handleProcessTypeChange = (typeId: string) => {
    setFilters({ ...filters, processType: typeId || undefined });
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearch("");
    setFilterOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 md:items-center mb-6">
      <form
        className="relative w-full md:max-w-sm"
        onSubmit={handleSearchSubmit}
      >
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar por protocolo..."
          className="pl-8"
          value={search}
          onChange={handleSearchChange}
        />
      </form>

      <div className="flex gap-2 ml-auto">
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
              {Object.keys(filters).some(
                (key) => key !== "search" && filters[key as keyof typeof filters]
              ) && (
                <span className="ml-1 rounded-full bg-primary w-2 h-2" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-4" align="end">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Status</h4>
                <Select
                  value={filters.status || "todos_status"}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos_status">Todos</SelectItem>
                    <SelectItem value="pending">Em andamento</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="overdue">Atrasado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Departamento</h4>
                <Select
                  value={filters.department || "todos_departamentos"}
                  onValueChange={handleDepartmentChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos_departamentos">Todos</SelectItem>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Tipo de Ato</h4>
                <Select
                  value={filters.processType || "todos_tipos"}
                  onValueChange={handleProcessTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos_tipos">Todos</SelectItem>
                    {processTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={handleClearFilters}
              >
                Limpar filtros
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default ProcessFilters;
