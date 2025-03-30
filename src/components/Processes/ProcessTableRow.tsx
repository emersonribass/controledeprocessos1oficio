import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Process, ProcessType } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, MoveLeft, MoveRight, PencilIcon, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import ProcessStatusBadge from "./ProcessStatusBadge";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ProcessTableRowProps {
  process: Process;
  getDepartmentName: (id: string) => string;
  getProcessTypeName: (id: string) => string;
  moveProcessToNextDepartment: (processId: string) => void;
  moveProcessToPreviousDepartment: (processId: string) => void;
  processTypes: ProcessType[];
  updateProcessType: (processId: string, newTypeId: string) => Promise<void>;
  updateProcessStatus?: (processId: string, newStatus: 'Em andamento' | 'Concluído' | 'Não iniciado') => Promise<void>;
}

const ProcessTableRow = ({
  process,
  getDepartmentName,
  getProcessTypeName,
  moveProcessToNextDepartment,
  moveProcessToPreviousDepartment,
  processTypes,
  updateProcessType,
  updateProcessStatus,
}: ProcessTableRowProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedType, setSelectedType] = useState(process.processType);

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para realizar esta ação",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateProcessType(process.id, selectedType);
      setIsEditing(false);
      toast({
        title: "Sucesso",
        description: "Tipo de processo atualizado com sucesso"
      });
    } catch (error) {
      console.error("Erro ao atualizar tipo de processo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o tipo de processo",
        variant: "destructive"
      });
    }
  };

  return (
    <TableRow
      key={process.id}
      className={cn(
        process.status === "overdue" ? "bg-destructive/5" : ""
      )}
    >
      <TableCell className="font-medium">
        {process.protocolNumber}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {processTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleSave}
              title="Salvar"
            >
              <Save className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          getProcessTypeName(process.processType)
        )}
      </TableCell>
      <TableCell>{getDepartmentName(process.currentDepartment)}</TableCell>
      <TableCell>
        {format(new Date(process.startDate), "dd/MM/yyyy", { locale: ptBR })}
      </TableCell>
      <TableCell><ProcessStatusBadge status={process.status} /></TableCell>
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
          {!isEditing && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              title="Editar tipo"
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
          )}
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
  );
};

export default ProcessTableRow;
