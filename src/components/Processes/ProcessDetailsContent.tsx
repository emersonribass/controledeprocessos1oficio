
import { Process } from "@/types";
import ProcessCard from "./ProcessCard";
import ProcessHistory from "./ProcessHistory";

interface ProcessDetailsContentProps {
  process: Process;
  getDepartmentName: (id: string) => string;
  getProcessTypeName: (id: string) => string;
  moveProcessToNextDepartment: (processId: string) => void;
  moveProcessToPreviousDepartment: (processId: string) => void;
  getUserName: (userId: string) => string;
  responsibleUserName?: string;
  isRefreshing: boolean;
  onProcessAccepted: () => void;
  hasResponsibleUser: boolean;
}

const ProcessDetailsContent = ({
  process,
  getDepartmentName,
  getProcessTypeName,
  moveProcessToNextDepartment,
  moveProcessToPreviousDepartment,
  getUserName,
  responsibleUserName,
  isRefreshing,
  onProcessAccepted,
  hasResponsibleUser
}: ProcessDetailsContentProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <ProcessCard
        process={process}
        getDepartmentName={getDepartmentName}
        getProcessTypeName={getProcessTypeName}
        moveProcessToNextDepartment={moveProcessToNextDepartment}
        moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
        responsibleUserName={responsibleUserName}
      />

      <ProcessHistory 
        history={process.history} 
        getDepartmentName={getDepartmentName} 
        getUserName={getUserName}
        processId={process.id}
        protocolNumber={process.protocolNumber}
        hasResponsibleUser={hasResponsibleUser}
        onProcessAccepted={onProcessAccepted}
      />
    </div>
  );
};

export default ProcessDetailsContent;
