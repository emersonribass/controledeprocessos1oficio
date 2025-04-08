
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDepartments } from "@/hooks/useDepartments";
import { useProcessTypes } from "@/hooks/useProcessTypes";
import { Department } from "@/types";
import { X } from "lucide-react";

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
  availableDepartments?: Department[]; // Nova prop para departamentos disponíveis
}

const ProcessFilters = ({ filters, setFilters, availableDepartments }: ProcessFiltersProps) => {
  const { departments } = useDepartments();
  const { processTypes } = useProcessTypes();
  const [search, setSearch] = useState("");

  const deptsToShow = availableDepartments || departments;

  // Reset search when filters change
  useEffect(() => {
    setSearch(filters.search || "");
  }, [filters.search]);

  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      search,
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearch("");
  };

  const handleSelectChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
    }));
  };

  const hasActiveFilters =
    Object.values(filters).some((v) => v !== undefined) || search;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 grid-cols-1 md:grid-cols-4">
        <div className="flex gap-2 col-span-1 md:col-span-2">
          <Input
            placeholder="Buscar por número de protocolo"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button onClick={handleSearch}>Buscar</Button>
        </div>

        <Select
          value={filters.status || "all"}
          onValueChange={(value) => handleSelectChange("status", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Em andamento</SelectItem>
            <SelectItem value="overdue">Atrasado</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="not_started">Não iniciado</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.department || "all"}
          onValueChange={(value) => handleSelectChange("department", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Setor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {deptsToShow.map((department) => (
              <SelectItem key={department.id} value={department.id}>
                {department.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 grid-cols-1 md:grid-cols-4">
        <Select
          value={filters.processType || "all"}
          onValueChange={(value) => handleSelectChange("processType", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo de Processo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {processTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="outline"
            className="flex items-center gap-1 w-fit h-fit"
            onClick={handleClearFilters}
          >
            <X className="h-4 w-4" />
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProcessFilters;
