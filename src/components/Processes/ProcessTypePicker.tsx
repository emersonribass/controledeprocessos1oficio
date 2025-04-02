
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { ProcessType } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface ProcessTypePickerProps {
  processId: string;
  currentTypeId: string;
  processTypes: ProcessType[];
  getProcessTypeName: (id: string) => string;
  updateProcessType: (processId: string, newTypeId: string) => Promise<void>;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
}

const ProcessTypePicker = ({
  processId,
  currentTypeId,
  processTypes,
  getProcessTypeName,
  updateProcessType,
  isEditing,
  setIsEditing,
}: ProcessTypePickerProps) => {
  const [selectedType, setSelectedType] = useState(currentTypeId);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      await updateProcessType(processId, selectedType);
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

  if (isEditing) {
    return (
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
    );
  }

  return <>{getProcessTypeName(currentTypeId)}</>;
};

export default ProcessTypePicker;
