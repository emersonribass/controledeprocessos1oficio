
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ProcessNotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center h-48">
      <h2 className="text-xl font-bold mb-2">Processo não encontrado</h2>
      <p className="text-muted-foreground mb-4">
        O processo que você está procurando não existe.
      </p>
      <Button onClick={() => navigate("/processes")}>
        Voltar para a lista
      </Button>
    </div>
  );
};

export default ProcessNotFound;
