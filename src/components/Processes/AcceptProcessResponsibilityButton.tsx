
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useProcessResponsibility } from "@/hooks/useProcessResponsibility";
import { useAuth } from "@/hooks/auth";
import { memo, useCallback } from "react";

interface AcceptProcessResponsibilityButtonProps {
  processId?: string;
  protocolNumber?: string;
  sectorId?: string;
  hasResponsibleUser?: boolean;
  onAccept: () => Promise<void>;
  isAccepting?: boolean;
}

const AcceptProcessResponsibilityButton = memo(({
  processId,
  protocolNumber,
  sectorId,
  hasResponsibleUser = false,
  onAccept,
  isAccepting = false,
}: AcceptProcessResponsibilityButtonProps) => {
  const { acceptProcessResponsibility } = useProcessResponsibility();
  const { user } = useAuth();

  const handleAcceptProcess = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (processId && protocolNumber) {
      const success = await acceptProcessResponsibility(processId, protocolNumber);
      if (success) {
        onAccept();
      }
    } else {
      // Se não tiver processId e protocolNumber, apenas chama a função onAccept
      onAccept();
    }
  }, [processId, protocolNumber, acceptProcessResponsibility, onAccept]);

  if (hasResponsibleUser) {
    return null;
  }

  return (
    <Button
      onClick={handleAcceptProcess}
      disabled={isAccepting || !user}
      className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300 flex items-center gap-1 process-action"
      size="sm"
      variant="outline"
    >
      <CheckCircle className="mr-2 h-3 w-3" />
      {isAccepting ? "Processando..." : "Aceitar Processo"}
    </Button>
  );
});

// Adicionando displayName para facilitar debugging
AcceptProcessResponsibilityButton.displayName = 'AcceptProcessResponsibilityButton';

export default AcceptProcessResponsibilityButton;
