
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useProcessResponsibility } from "@/hooks/useProcessResponsibility";
import { useAuth } from "@/hooks/auth";

interface AcceptProcessResponsibilityButtonProps {
  processId: string;
  protocolNumber: string;
  sectorId: string;
  hasResponsibleUser: boolean;
  onAccept: () => void;
}

const AcceptProcessResponsibilityButton = ({
  processId,
  protocolNumber,
  sectorId,
  hasResponsibleUser,
  onAccept,
}: AcceptProcessResponsibilityButtonProps) => {
  const { acceptProcessResponsibility, isAccepting } = useProcessResponsibility();
  const { user } = useAuth();

  const handleAcceptProcess = async () => {
    const success = await acceptProcessResponsibility(processId, protocolNumber);
    if (success) {
      onAccept();
    }
  };

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

export default AcceptProcessResponsibilityButton;

