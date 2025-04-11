import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDepartments } from "@/hooks/useDepartments";
import { useProcessTypes } from "@/hooks/useProcessTypes";
import { Department } from "@/types";
import { X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
interface ProcessFiltersProps {
  filters: {
    department?: string;
    status?: string;
    processType?: string;
    search?: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    department?: string;
    status?: string;
    processType?: string;
    search?: string;
  }>>;
  availableDepartments?: Department[];
}
const ProcessFilters = ({
  filters,
  setFilters,
  availableDepartments
}: ProcessFiltersProps) => {
  const {
    departments
  } = useDepartments();
  const {
    processTypes
  } = useProcessTypes();
  const [search, setSearch] = useState("");

  // Atualiza o estado local de busca quando os filtros mudam externamente
  useEffect(() => {
    setSearch(filters.search || "");
  }, [filters.search]);

  // Função de debounce para evitar muitas requisições enquanto o usuário digita
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return function (...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // Aplicar debounce na função de busca (300ms)
  const debouncedSearch = useCallback(debounce((value: string) => {
    setFilters(prev => ({
      ...prev,
      search: value.trim() === "" ? undefined : value
    }));
  }, 300), [setFilters]);

  // Atualiza a busca quando o usuário digita
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    debouncedSearch(value);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // Aplicar a busca imediatamente sem debounce ao pressionar Enter
      setFilters(prev => ({
        ...prev,
        search: search.trim() === "" ? undefined : search
      }));
    }
  };
  const handleClearFilters = () => {
    setFilters({});
    setSearch("");
  };
  const handleSelectChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === "all" ? undefined : value
    }));
  };
  const deptsToShow = availableDepartments || departments;
  const hasActiveFilters = Object.values(filters).some(v => v !== undefined) || search;
  return <div className="space-y-3">
      <div className="grid gap-3 grid-cols-1 md:grid-cols-4">
        <div className="relative col-span-1 md:col-span-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Buscar por número de protocolo" value={search} onChange={handleSearchChange} onKeyDown={handleKeyDown} className="pl-10" />
          </div>
        </div>

        <Select value={filters.status || "all"} onValueChange={value => handleSelectChange("status", value)}>
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

        <Select value={filters.department || "all"} onValueChange={value => handleSelectChange("department", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Setor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {deptsToShow.map(department => <SelectItem key={department.id} value={department.id}>
                {department.name}
              </SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 grid-cols-1 md:grid-cols-4">
        <Select value={filters.processType || "all"} onValueChange={value => handleSelectChange("processType", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Tipo de Processo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {processTypes.map(type => <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>)}
          </SelectContent>
        </Select>

        {hasActiveFilters && <Button variant="outline" onClick={handleClearFilters} className="flex items-center gap-1 w-fit h-fit bg-green-600 hover:bg-green-500 px-[10px] text-white">
            <X className="h-4 w-4" />
            Limpar filtros
          </Button>}
      </div>
    </div>;
};
export default ProcessFilters;