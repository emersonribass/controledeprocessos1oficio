
import { Card } from "@/components/ui/card";
import DashboardSummary from "@/components/Dashboard/DashboardSummary";
import DepartmentStatusChart from "@/components/Dashboard/DepartmentStatusChart";
import RecentProcessList from "@/components/Dashboard/RecentProcessList";
import { ProcessesProvider } from "@/hooks/useProcesses";
import DashboardFilters from "@/components/Dashboard/DashboardFilters";
import { useProcessListFilters } from "@/hooks/useProcessListFilters";

const Dashboard = () => {
  const { filters, setFilters } = useProcessListFilters({});
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral dos processos e estatísticas do sistema.
        </p>
      </div>

      <ProcessesProvider>
        <DashboardFilters 
          filters={filters} 
          setFilters={setFilters} 
          availableDepartments={[]}
        />
        <DashboardSummary filters={filters} />

        <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
          <DepartmentStatusChart />
          <RecentProcessList />
        </div>
      </ProcessesProvider>
    </div>
  );
};

export default Dashboard;
