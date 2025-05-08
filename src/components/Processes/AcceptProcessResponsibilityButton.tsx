
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/auth";
import { memo, useCallback } from "react";
import { createLogger } from "@/utils/loggerUtils";
import { useProcessManager } from "@/hooks/useProcessManager";

const logger = createLogger("AcceptProcessButton");

interface AcceptProcessResponsibilityButtonProps {
  processId: string;
  protocolNumber: string;
  sectorId: string;
  hasResponsibleUser: boolean;
  onAccept: () => void;
}

const AcceptProcessResponsibilityButton = memo(({
  processId,
  protocolNumber,
  sectorId,
  hasResponsibleUser,
  onAccept,
}: AcceptProcessResponsibilityButtonProps) => {
  const { user } = useAuth();
  const { acceptResponsibility, isLoading } = useProcessManager({
    processes: [], // Fornecendo um array vazio como argumento para satisfazer a interface
    refreshProcessesCallback: async () => { /* função vazia */ }
  });
  
  logger.debug(`Button: processId=${processId}, sectorId=${sectorId}, hasResponsible=${hasResponsibleUser}`);

  const handleAcceptProcess = useCallback(async () => {
    if (!user || !sectorId) return;
    
    const success = await acceptResponsibility(processId, sectorId);
    if (success) {
      onAccept();
    }
  }, [processId, sectorId, acceptResponsibility, onAccept, user]);

  if (hasResponsibleUser) {
    return null;
  }

  return (
    <Button
      onClick={handleAcceptProcess}
      disabled={isLoading || !user}
      className="bg-green-600 hover:bg-green-700"
      size="sm"
    >
      <CheckCircle className="mr-2 h-4 w-4" />
      {isLoading ? "Processando..." : "Aceitar Processo"}
    </Button>
  );
});

AcceptProcessResponsibilityButton.displayName = 'AcceptProcessResponsibilityButton';

export default AcceptProcessResponsibilityButton;
