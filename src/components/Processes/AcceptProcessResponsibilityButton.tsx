
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
  onAccept: () => void;
  isAccepting?: boolean; // Adicionando essa propriedade como opcional
}

const AcceptProcessResponsibilityButton = memo(({
  processId,
  protocolNumber,
  sectorId,
  hasResponsibleUser = false,
  onAccept,
  isAccepting = false, // Definindo um valor padrão
}: AcceptProcessResponsibilityButtonProps) => {
  const { acceptProcessResponsibility } = useProcessResponsibility();
  const { user } = useAuth();

  const handleAcceptProcess = useCallback(async () => {
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
      className="bg-green-600 hover:bg-green-700"
      size="sm"
    >
      <CheckCircle className="mr-2 h-4 w-4" />
      {isAccepting ? "Processando..." : "Aceitar Processo"}
    </Button>
  );
});

// Adicionando displayName para facilitar debugging
AcceptProcessResponsibilityButton.displayName = 'AcceptProcessResponsibilityButton';

export default AcceptProcessResponsibilityButton;
