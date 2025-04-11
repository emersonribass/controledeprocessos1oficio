
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProcessHeaderProps {
  protocolNumber: string;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

const ProcessHeader = ({ 
  protocolNumber, 
  onRefresh, 
  isRefreshing = false 
}: ProcessHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/processes")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold">Protocolo: {protocolNumber}</h2>
      </div>
      
      <Button
        variant="outline"
        size="icon"
        onClick={onRefresh}
        disabled={isRefreshing}
      >
        <RotateCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
};

export default ProcessHeader;
