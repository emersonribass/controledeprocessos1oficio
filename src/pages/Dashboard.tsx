
import { Card } from "@/components/ui/card";
import DashboardSummary from "@/components/Dashboard/DashboardSummary";
import DepartmentStatusChart from "@/components/Dashboard/DepartmentStatusChart";
import RecentProcessList from "@/components/Dashboard/RecentProcessList";
import { ProcessesProvider, useProcesses } from "@/hooks/useProcesses";
import DashboardFilters from "@/components/Dashboard/DashboardFilters";
import { useProcessListFilters } from "@/hooks/useProcessListFilters";
import { createLogger } from "@/utils/loggerUtils";

const logger = createLogger("Dashboard");

const Dashboard = () => {
  logger.debug("Renderizando Dashboard");
  const { filters, setFilters } = useProcessListFilters({});

  return (
    <ProcessesProvider>
      <DashboardContentWrapper filters={filters} setFilters={setFilters} />
    </ProcessesProvider>
  );
};

// Componente que realmente usa o contexto de processos
const DashboardContentWrapper = ({ 
  filters, 
  setFilters 
}: { 
  filters: any; 
  setFilters: React.Dispatch<React.SetStateAction<any>> 
}) => {
  logger.debug("Renderizando DashboardContentWrapper");
  return <DashboardContent filters={filters} setFilters={setFilters} />;
};

// Componente interno que usa o contexto de processos
const DashboardContent = ({ 
  filters, 
  setFilters 
}: { 
  filters: any; 
  setFilters: React.Dispatch<React.SetStateAction<any>> 
}) => {
  const { departments } = useProcesses();
  logger.debug(`DashboardContent recebeu ${departments?.length || 0} departamentos`);
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral dos processos e estatísticas do sistema.
        </p>
      </div>

      <DashboardFilters 
        filters={filters}
        setFilters={setFilters}
        availableDepartments={departments}
      />

      <DashboardSummary filters={filters} />

      <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
        <DepartmentStatusChart />
        <RecentProcessList />
      </div>
    </div>
  );
};

export default Dashboard;
