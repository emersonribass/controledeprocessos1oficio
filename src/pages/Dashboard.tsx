
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardSummary from "@/components/Dashboard/DashboardSummary";
import DepartmentStatusChart from "@/components/Dashboard/DepartmentStatusChart";
import RecentProcessList from "@/components/Dashboard/RecentProcessList";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral dos processos e estatísticas do sistema.
        </p>
      </div>

      <DashboardSummary />

      <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
        <DepartmentStatusChart />
        <RecentProcessList />
      </div>
    </div>
  );
};

export default Dashboard;
