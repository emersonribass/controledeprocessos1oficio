
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProcessType } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { createLogger } from "@/utils/loggerUtils";

const logger = createLogger("ProcessTypePicker");

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
  const [selectedType, setSelectedType] = useState(currentTypeId || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    setSelectedType(currentTypeId || "");
  }, [currentTypeId]);

  logger.debug(`ProcessTypePicker - processId=${processId}, currentTypeId=${currentTypeId}, selectedType=${selectedType}`);

  const handleChange = async (value: string) => {
    if (value === currentTypeId) return;
    
    setIsUpdating(true);
    logger.debug(`Alterando tipo do processo ${processId}: ${currentTypeId} -> ${value}`);
    
    try {
      setSelectedType(value);
      await updateProcessType(processId, value);
      logger.debug(`Tipo do processo ${processId} atualizado com sucesso para ${value}`);
    } catch (error) {
      logger.error("Erro ao atualizar tipo de processo:", error);
      setSelectedType(currentTypeId || "");
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o tipo de processo",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const activeProcessTypes = processTypes.filter(type => type.active !== false);

  return (
    <div className="w-full max-w-[160px] mx-auto">
      <Select value={selectedType} onValueChange={handleChange} disabled={isUpdating}>
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
