
import { Card } from "@/components/ui/card";
import DashboardSummary from "@/components/Dashboard/DashboardSummary";
import DepartmentStatusChart from "@/components/Dashboard/DepartmentStatusChart";
import RecentProcessList from "@/components/Dashboard/RecentProcessList";
import { ProcessesProvider } from "@/hooks/useProcesses";
import { memo } from "react";

// Usando memo para evitar renderizações desnecessárias
const MemoizedDashboardSummary = memo(DashboardSummary);
const MemoizedDepartmentStatusChart = memo(DepartmentStatusChart);
const MemoizedRecentProcessList = memo(RecentProcessList);

const Dashboard = () => {
  return (
    <ProcessesProvider>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Visão geral dos processos e estatísticas do sistema.
          </p>
        </div>

        <MemoizedDashboardSummary />

        <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
          <MemoizedDepartmentStatusChart />
          <MemoizedRecentProcessList />
        </div>
      </div>
    </ProcessesProvider>
  );
};

export default Dashboard;
