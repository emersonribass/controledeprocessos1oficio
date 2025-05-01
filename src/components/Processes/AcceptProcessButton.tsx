
import { memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useProcessResponsibility } from "@/hooks/useProcessResponsibility";
import { useAuth } from "@/hooks/auth";
import { useProcesses } from "@/hooks/useProcesses";

interface AcceptProcessButtonProps {
  processId: string;
  protocolNumber: string;
  hasResponsibleUser: boolean;
  onAccept: () => void;
}

const AcceptProcessButton = memo(({
  processId,
  protocolNumber,
  hasResponsibleUser,
  onAccept,
}: AcceptProcessButtonProps) => {
  const { acceptProcessResponsibility, isAccepting } = useProcessResponsibility();
  const { user } = useAuth();
  const { refreshProcesses } = useProcesses();

  const handleAcceptProcess = useCallback(async () => {
    const success = await acceptProcessResponsibility(processId, protocolNumber, true);
    if (success) {
      await refreshProcesses();
      onAccept();
    }
  }, [processId, protocolNumber, acceptProcessResponsibility, refreshProcesses, onAccept]);

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

AcceptProcessButton.displayName = 'AcceptProcessButton';

export default AcceptProcessButton;
