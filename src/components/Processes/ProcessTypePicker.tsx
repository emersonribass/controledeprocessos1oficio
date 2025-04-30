
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
  isDisabled?: boolean;
}

const ProcessTypePicker = ({
  processId,
  currentTypeId,
  processTypes,
  getProcessTypeName,
  updateProcessType,
  isDisabled = false
}: ProcessTypePickerProps) => {
  const [selectedType, setSelectedType] = useState(currentTypeId);
  const { toast } = useToast();
  
  useEffect(() => {
    setSelectedType(currentTypeId);
  }, [currentTypeId]);

  const handleChange = async (value: string) => {
    if (value === currentTypeId || isDisabled) return;
    
    setSelectedType(value);
    try {
      await updateProcessType(processId, value);
      toast({
        title: "Sucesso",
        description: "Tipo de processo atualizado com sucesso"
      });
    } catch (error) {
      console.error("Erro ao atualizar tipo de processo:", error);
      setSelectedType(currentTypeId);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o tipo de processo",
        variant: "destructive"
      });
    }
  };

  const activeProcessTypes = processTypes.filter(type => type.active !== false);

  return (
    <div className="w-full max-w-[160px] mx-auto">
      <Select value={selectedType} onValueChange={handleChange} disabled={isDisabled}>
        <SelectTrigger className="h-8">
          <SelectValue placeholder="Selecione o tipo" />
        </SelectTrigger>
        <SelectContent>
          {activeProcessTypes.map((type) => (
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
