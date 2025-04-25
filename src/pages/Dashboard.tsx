
import { Card } from "@/components/ui/card";
import DashboardSummary from "@/components/Dashboard/DashboardSummary";
import DepartmentStatusChart from "@/components/Dashboard/DepartmentStatusChart";
import RecentProcessList from "@/components/Dashboard/RecentProcessList";
import { ProcessesProvider } from "@/hooks/useProcesses";
import DashboardFilters from "@/components/Dashboard/DashboardFilters";
import { useProcessListFilters } from "@/hooks/useProcessListFilters";
import { useProcesses } from "@/hooks/useProcesses";

const Dashboard = () => {
  const { departments } = useProcesses();
  const { filters, setFilters } = useProcessListFilters({});

  return (
    <ProcessesProvider>
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
    </ProcessesProvider>
  );
};

export default Dashboard;
