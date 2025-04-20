
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useProcessDeadlineRenewal } from "@/hooks/useProcessDeadlineRenewal";

interface RenewDeadlineButtonProps {
  processId: string;
  historyId: number;
  onRenewalComplete?: () => void;
}

const RenewDeadlineButton = ({ 
  processId, 
  historyId, 
  onRenewalComplete 
}: RenewDeadlineButtonProps) => {
  const { renewDeadline, isRenewing } = useProcessDeadlineRenewal(onRenewalComplete);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => renewDeadline(processId, historyId)}
      disabled={isRenewing}
      className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300 flex items-center gap-1"
    >
      <RefreshCw className="h-3 w-3" />
      {isRenewing ? "Renovando..." : "Renovar Prazo"}
    </Button>
  );
};

export default RenewDeadlineButton;
