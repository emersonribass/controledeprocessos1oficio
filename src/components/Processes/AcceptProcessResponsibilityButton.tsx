
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useProcessResponsibility } from "@/hooks/useProcessResponsibility";
import { useAuth } from "@/hooks/auth";
import { useProcesses } from "@/hooks/useProcesses";
import { memo, useCallback } from "react";
import { useProcessTableState } from "@/hooks/useProcessTableState";

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
  const { acceptProcessResponsibility, isAccepting } = useProcessResponsibility();
  const { user } = useAuth();
  const { refreshProcesses } = useProcesses();
  const { queueSectorForLoading } = useProcessTableState([]);

  const handleAcceptProcess = useCallback(async () => {
    // Não exibir toast durante a aceitação
    const success = await acceptProcessResponsibility(processId, protocolNumber, false);
    if (success) {
      // Atualizar o setor específico
      queueSectorForLoading(processId, sectorId);
      // Atualizar a lista de processos
      await refreshProcesses();
      // Chamar o callback de onAccept
      onAccept();
    }
  }, [processId, protocolNumber, sectorId, acceptProcessResponsibility, queueSectorForLoading, refreshProcesses, onAccept]);

  if (hasResponsibleUser) {
    return null;
  }

  return (
    <Button
      onClick={handleAcceptProcess}
      disabled={isAccepting || !user}
      className="bg-green-600 hover:bg-green-700"
      size="sm"
    >
      <CheckCircle className="mr-2 h-4 w-4" />
      {isAccepting ? "Processando..." : "Aceitar Processo"}
    </Button>
  );
});

AcceptProcessResponsibilityButton.displayName = 'AcceptProcessResponsibilityButton';

export default AcceptProcessResponsibilityButton;
