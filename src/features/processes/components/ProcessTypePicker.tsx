
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProcessType } from "@/types";
import { useState } from "react";

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
  updateProcessType
}: ProcessTypePickerProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChange = async (newTypeId: string) => {
    if (newTypeId === currentTypeId) return;
    
    setIsUpdating(true);
    try {
      await updateProcessType(processId, newTypeId);
    } catch (error) {
      console.error("Erro ao atualizar tipo de processo:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Select
      value={currentTypeId}
      onValueChange={handleChange}
      disabled={isUpdating}
    >
      <SelectTrigger className="h-8 w-full">
        <SelectValue>
          {isUpdating ? "Atualizando..." : getProcessTypeName(currentTypeId)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {processTypes.map(type => (
          <SelectItem key={type.id} value={type.id}>
            {type.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ProcessTypePicker;
