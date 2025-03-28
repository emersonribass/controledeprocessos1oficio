
import ProcessList from "@/components/Processes/ProcessList";

const ProcessesPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Processos</h2>
        <p className="text-muted-foreground">
          Gerencie e acompanhe o andamento de todos os processos.
        </p>
      </div>

      <ProcessList />
    </div>
  );
};

export default ProcessesPage;
