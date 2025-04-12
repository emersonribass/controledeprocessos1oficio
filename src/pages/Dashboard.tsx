
import { useState } from "react";
import { Card } from "@/components/ui/card";
import DashboardSummary from "@/components/Dashboard/DashboardSummary";
import DepartmentStatusChart from "@/components/Dashboard/DepartmentStatusChart";
import RecentProcessList from "@/components/Dashboard/RecentProcessList";
import { ProcessesProvider } from "@/features/processes";
import { ProcessAutoRefresher } from "@/components/Processes/ProcessAutoRefresher";
import { useProcesses } from "@/hooks/useProcesses";

const DashboardContent = () => {
  const { refreshProcesses } = useProcesses();
  const [autoRefreshEnabled] = useState(true);
  
  return (
    <>
      <ProcessAutoRefresher 
        refreshFunction={refreshProcesses}
        intervalSeconds={60} // Atualizar a cada 60 segundos em vez de 30
        enabled={autoRefreshEnabled}
      />
      
      <div className="space-y-6">
        <DashboardSummary />

        <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
          <DepartmentStatusChart />
          <RecentProcessList />
        </div>
      </div>
    </>
  );
};

const Dashboard = () => {
  return (
    <ProcessesProvider>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral dos processos e estatísticas do sistema.
        </p>

        <DashboardContent />
      </div>
    </ProcessesProvider>
  );
};

export default Dashboard;
