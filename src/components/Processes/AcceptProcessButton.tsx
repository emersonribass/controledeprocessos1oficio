
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";
import { useProcessResponsibility } from "@/hooks/useProcessResponsibility";

interface AcceptProcessButtonProps {
  processId: string;
  protocolNumber: string;
  hasResponsibleUser: boolean;
  onAccept: () => void;
}

const AcceptProcessButton = ({
  processId,
  protocolNumber,
  hasResponsibleUser,
  onAccept,
}: AcceptProcessButtonProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { acceptProcessResponsibility, isAccepting } = useProcessResponsibility();

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

export default AcceptProcessButton;
