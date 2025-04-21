
import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDepartments } from "@/hooks/useDepartments";
import { useProcessTypes } from "@/hooks/useProcessTypes";
import { Department } from "@/types";
import { X, Search, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProcessFiltersProps {
  filters: {
    department?: string;
    status?: string;
    processType?: string;
    search?: string;
    excludeCompleted?: boolean;
    startDate?: string;
    endDate?: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    department?: string;
    status?: string;
    processType?: string;
    search?: string;
    excludeCompleted?: boolean;
    startDate?: string;
    endDate?: string;
  }>>;
  availableDepartments?: Department[];
}

const ProcessFilters = ({
  filters,
  setFilters,
  availableDepartments
}: ProcessFiltersProps) => {
  const { departments } = useDepartments();
  const { processTypes } = useProcessTypes();
  const [search, setSearch] = useState("");
  const [initialDate, setInitialDate] = useState<Date | undefined>(filters.startDate ? new Date(filters.startDate) : undefined);
  const [finalDate, setFinalDate] = useState<Date | undefined>(filters.endDate ? new Date(filters.endDate) : undefined);

  // Atualiza o estado local de busca quando os filtros mudam externamente
  useEffect(() => {
    setSearch(filters.search || "");
  }, [filters.search]);

  // Mantém controlados os DatePickers com base nos filtros externos
  useEffect(() => {
    setInitialDate(filters.startDate ? new Date(filters.startDate) : undefined);
    setFinalDate(filters.endDate ? new Date(filters.endDate) : undefined);
    // eslint-disable-next-line
  }, [filters.startDate, filters.endDate]);

  // Função de debounce
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return function (...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // Debounce para busca por texto
  const debouncedSearch = useCallback(debounce((value: string) => {
    setFilters(prev => ({
      ...prev,
      search: value.trim() === "" ? undefined : value
    }));
  }, 300), [setFilters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    debouncedSearch(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setFilters(prev => ({
        ...prev,
        search: search.trim() === "" ? undefined : search
      }));
    }
  };

  const handleClearFilters = () => {
    setFilters({ excludeCompleted: filters.excludeCompleted });
    setSearch("");
    setInitialDate(undefined);
    setFinalDate(undefined);
  };

  const handleSelectChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === "all" ? undefined : value
    }));
  };

  const toggleExcludeCompleted = () => {
    setFilters(prev => ({
      ...prev,
      excludeCompleted: !prev.excludeCompleted
    }));
  };

  // Mudança nos datepickers
  const handleInitialDateChange = (date: Date | undefined) => {
    setInitialDate(date);
    setFilters(prev => ({
      ...prev,
      startDate: date ? date.toISOString().slice(0, 10) : undefined,
    }));
  };
  const handleFinalDateChange = (date: Date | undefined) => {
    setFinalDate(date);
    setFilters(prev => ({
      ...prev,
      endDate: date ? date.toISOString().slice(0, 10) : undefined,
    }));
  };

  const deptsToShow = availableDepartments || departments;
  const hasActiveFilters = (Object.keys(filters).filter(k => !["excludeCompleted"].includes(k)).some(k => filters[k as keyof typeof filters] !== undefined)) || search;

  // Layout com títulos de grupos: Situação, Setor, Data, Tipo
  return (
    <div className="space-y-3">
      {/* Linha de pesquisa */}
      <div className="grid gap-3 grid-cols-1 md:grid-cols-4">
        <div className="relative col-span-1 md:col-span-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Buscar por número de protocolo" value={search} onChange={handleSearchChange} onKeyDown={handleKeyDown} className="pl-10" />
          </div>
        </div>
      </div>

      {/* Situação, Setor, Data, Tipo */}
      <div className="grid gap-3 grid-cols-1 md:grid-cols-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Situação</label>
          <Select value={filters.status || "all"} onValueChange={value => handleSelectChange("status", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Situação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="pending">Em andamento</SelectItem>
              <SelectItem value="overdue">Atrasado</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="not_started">Não iniciado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Setor</label>
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
        {/* Filtro de Datas */}
        <div>
          <label className="block text-sm font-semibold mb-1">Data de Entrada</label>
          <div className="flex gap-2">
            {/* Data inicial */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-[115px] justify-start text-left font-normal ${!initialDate && "text-muted-foreground"}`}
                >
                  <Calendar className="mr-2 h-4 w-4 opacity-70" />
                  {initialDate ? format(initialDate, "dd/MM/yyyy", { locale: ptBR }) : "Início"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <ShadcnCalendar
                  mode="single"
                  selected={initialDate}
                  onSelect={handleInitialDateChange}
                  initialFocus
                  className="p-3 pointer-events-auto"
                  locale={ptBR}
                  footer={null}
                  toDate={finalDate}
                />
              </PopoverContent>
            </Popover>
            {/* Data final */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-[115px] justify-start text-left font-normal ${!finalDate && "text-muted-foreground"}`}
                >
                  <Calendar className="mr-2 h-4 w-4 opacity-70" />
                  {finalDate ? format(finalDate, "dd/MM/yyyy", { locale: ptBR }) : "Fim"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <ShadcnCalendar
                  mode="single"
                  selected={finalDate}
                  onSelect={handleFinalDateChange}
                  initialFocus
                  className="p-3 pointer-events-auto"
                  locale={ptBR}
                  footer={null}
                  fromDate={initialDate}
                  // Não deixar escolher antes da inicial
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Tipo</label>
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
        </div>
      </div>

      {/* Checkbox Ocultar concluídos, botão limpar filtros */}
      <div className="grid gap-3 grid-cols-1 md:grid-cols-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="excludeCompleted"
            checked={filters.excludeCompleted}
            onCheckedChange={toggleExcludeCompleted}
          />
          <label
            htmlFor="excludeCompleted"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Ocultar processos concluídos
          </label>
        </div>
        {hasActiveFilters && <Button variant="outline" onClick={handleClearFilters} className="flex items-center gap-1 w-fit h-fit bg-green-600 hover:bg-green-500 px-[10px] text-white">
            <X className="h-4 w-4" />
            Limpar filtros
          </Button>}
      </div>
    </div>
  );
};

export default ProcessFilters;
