
import ProcessList from "@/components/Processes/ProcessList";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProcessesPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Processos</h2>
          <p className="text-muted-foreground">
            Gerencie e acompanhe o andamento de todos os processos.
          </p>
        </div>
        <Button 
          onClick={() => navigate("/admin/process-settings")}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-5 w-5" />
          Novo Processo
        </Button>
      </div>

      <ProcessList />
    </div>
  );
};

export default ProcessesPage;
