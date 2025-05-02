
import { useState } from "react";
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
  isUserProcessOwner?: boolean;
}

const AcceptProcessButton = ({
  processId,
  protocolNumber,
  hasResponsibleUser,
  onAccept,
  isUserProcessOwner = false
}: AcceptProcessButtonProps) => {
  const { acceptProcessResponsibility, isAccepting } = useProcessResponsibility();
  const { user } = useAuth();
  const { refreshProcesses } = useProcesses();

  const handleAcceptProcess = async () => {
    const success = await acceptProcessResponsibility(processId, protocolNumber);
    if (success) {
      onAccept();
      await refreshProcesses();
    }
  };

  // Se já tiver um responsável, não mostra o botão
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
};

export default AcceptProcessButton;
