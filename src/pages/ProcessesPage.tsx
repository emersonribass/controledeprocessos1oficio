import { useEffect, useState } from "react";
import ProcessList from "@/components/Processes/ProcessList";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
const ProcessesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    isAdmin
  } = useAuth();
  const [initialFilters, setInitialFilters] = useState({});
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setInitialFilters({
        status: statusParam
      });
    } else {
      // Quando não há status na URL, resetamos os filtros
      setInitialFilters({});
    }
  }, [location.search]);
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Processos</h2>
          <p className="text-muted-foreground">
            Gerencie e acompanhe o andamento de todos os processos.
          </p>
        </div>
        {(isAdmin(user?.email || "") || user?.departments?.length === 0) && <Button onClick={() => navigate("/admin/process-settings")} className="flex items-center gap-1 px-[10px] text-sm text-center rounded-lg bg-sky-700 hover:bg-sky-600">
            <PlusCircle className="h-5 w-5" />
            Novo Processo
          </Button>}
      </div>

      <ProcessList initialFilters={initialFilters} />
    </div>;
};
export default ProcessesPage;