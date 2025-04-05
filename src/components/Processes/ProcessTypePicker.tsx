
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProcessType } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface ProcessTypePickerProps {
  processId: string;
  currentTypeId: string;
  processTypes: ProcessType[];
  getProcessTypeName: (id: string) => string;
  updateProcessType: (processId: string, newTypeId: string) => Promise<void>;
}

const ProcessTypePicker = ({
  processId,
  currentTypeId,
  processTypes,
  getProcessTypeName,
  updateProcessType,
}: ProcessTypePickerProps) => {
  const [selectedType, setSelectedType] = useState(currentTypeId);
  const { toast } = useToast();
  
  // Atualizar selectedType quando currentTypeId mudar
  useEffect(() => {
    setSelectedType(currentTypeId);
  }, [currentTypeId]);

  const handleChange = async (value: string) => {
    if (value === currentTypeId) return;
    
    setSelectedType(value);
    try {
      await updateProcessType(processId, value);
      toast({
        title: "Sucesso",
        description: "Tipo de processo atualizado com sucesso"
      });
    } catch (error) {
      console.error("Erro ao atualizar tipo de processo:", error);
      setSelectedType(currentTypeId); // Reverter para o valor original em caso de erro
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o tipo de processo",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-[180px]">
      <Select value={selectedType} onValueChange={handleChange}>
        <SelectTrigger>
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
    </div>
  );
};

export default ProcessTypePicker;
