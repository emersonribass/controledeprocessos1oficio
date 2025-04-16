
import { ProcessType } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export interface ProcessFiltersProps {
  filters: {
    department?: string;
    status?: string;
    processType?: string;
    search?: string;
    excludeCompleted?: boolean;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      department?: string;
      status?: string;
      processType?: string;
      search?: string;
      excludeCompleted?: boolean;
    }>
  >;
  departments: { id: string; name: string }[];
  getDepartmentName: (id: string) => string;
  processTypes: ProcessType[];
  getProcessTypeName: (id: string) => string;
}

const ProcessFilters = ({
  filters,
  setFilters,
  departments,
  getDepartmentName,
  processTypes,
  getProcessTypeName,
}: ProcessFiltersProps) => {
  const handleToggleCompleted = (checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      excludeCompleted: checked,
    }));
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
      <Select
        value={filters.department || ""}
        onValueChange={(value) =>
          setFilters((prev) => ({ ...prev, department: value || undefined }))
        }
      >
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="Setor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todos os setores</SelectItem>
          {departments.map((department) => (
            <SelectItem key={department.id} value={department.id}>
              {department.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.status || ""}
        onValueChange={(value) =>
          setFilters((prev) => ({ ...prev, status: value || undefined }))
        }
      >
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todos os status</SelectItem>
          <SelectItem value="pending">Em andamento</SelectItem>
          <SelectItem value="completed">Concluído</SelectItem>
          <SelectItem value="overdue">Atrasado</SelectItem>
          <SelectItem value="not_started">Não iniciado</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.processType || ""}
        onValueChange={(value) =>
          setFilters((prev) => ({ ...prev, processType: value || undefined }))
        }
      >
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="Tipo de Processo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todos os tipos</SelectItem>
          {processTypes.map((type) => (
            <SelectItem key={type.id} value={type.id}>
              {type.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center space-x-2">
        <Switch
          id="exclude-completed"
          checked={filters.excludeCompleted}
          onCheckedChange={handleToggleCompleted}
        />
        <Label htmlFor="exclude-completed" className="cursor-pointer">
          Ocultar concluídos
        </Label>
      </div>
    </div>
  );
};

export default ProcessFilters;
