
import { useParams } from "react-router-dom";
import { useProcesses } from "@/hooks/useProcesses";
import ProcessHeader from "./ProcessHeader";
import ProcessCard from "./ProcessCard";
import ProcessHistory from "./ProcessHistory";
import ProcessNotFound from "./ProcessNotFound";

const ProcessDetails = () => {
  const { id } = useParams<{ id: string }>();
  const {
    processes,
    getDepartmentName,
    getProcessTypeName,
    moveProcessToNextDepartment,
    moveProcessToPreviousDepartment,
  } = useProcesses();

  const process = processes.find((p) => p.id === id);

  if (!process) {
    return <ProcessNotFound />;
  }

  return (
    <div className="space-y-6">
      <ProcessHeader title="Detalhes do Processo" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ProcessCard
          process={process}
          getDepartmentName={getDepartmentName}
          getProcessTypeName={getProcessTypeName}
          moveProcessToNextDepartment={moveProcessToNextDepartment}
          moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
        />

        <ProcessHistory 
          history={process.history} 
          getDepartmentName={getDepartmentName} 
        />
      </div>
    </div>
  );
};

export default ProcessDetails;
