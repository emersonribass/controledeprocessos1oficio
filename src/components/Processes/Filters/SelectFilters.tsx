
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Department, ProcessType } from "@/types";
import { UsuarioSupabase } from "@/types/usuario";

interface SelectFiltersProps {
  filters: {
    status?: string;
    department?: string;
    responsibleUser?: string;
    processType?: string;
  };
  onSelectChange: (key: string, value: string) => void;
  departments: Department[];
  processTypes: ProcessType[];
  usuarios: UsuarioSupabase[];
}

const SelectFilters = ({ 
  filters, 
  onSelectChange, 
  departments,
  processTypes,
  usuarios
}: SelectFiltersProps) => {
  console.log("Usuários disponíveis para filtro:", usuarios);
  
  return (
    <>
      <div>
        <label className="block text-sm font-semibold mb-1">Situação</label>
        <Select value={filters.status || "all"} onValueChange={value => onSelectChange("status", value)}>
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
        <Select value={filters.department || "all"} onValueChange={value => onSelectChange("department", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Setor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {departments.map(department => (
              <SelectItem key={department.id} value={department.id}>
                {department.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Responsável</label>
        <Select value={filters.responsibleUser || "all"} onValueChange={value => onSelectChange("responsibleUser", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Responsável" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {usuarios && usuarios.length > 0 ? (
              usuarios.filter(u => u.ativo).map(usuario => (
                <SelectItem key={usuario.id} value={usuario.id}>
                  {usuario.nome}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="none" disabled>Nenhum usuário encontrado</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Tipo</label>
        <Select value={filters.processType || "all"} onValueChange={value => onSelectChange("processType", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Tipo de Processo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {processTypes.map(type => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default SelectFilters;
