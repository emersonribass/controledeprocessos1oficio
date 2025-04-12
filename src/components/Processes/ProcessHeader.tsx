
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProcessHeader = ({ title }: { title: string }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigate("/processes")}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <h2 className="text-2xl font-bold">{title}</h2>
    </div>
  );
};

export default ProcessHeader;
