
import { Process } from "@/types";
import ProcessCard from "./ProcessCard";
import ProcessHistory from "./ProcessHistory";
import { useProcessResponsibility } from "@/hooks/useProcessResponsibility";
import { useState } from "react";

interface ProcessDetailsContentProps {
  process: Process;
  getDepartmentName: (id: string) => string;
  getProcessTypeName: (id: string) => string;
  moveProcessToNextDepartment: (processId: string) => void;
  moveProcessToPreviousDepartment: (processId: string) => void;
  getUserName: (userId: string) => string;
  isRefreshing: boolean;
}

const ProcessDetailsContent = ({
  process,
  getDepartmentName,
  getProcessTypeName,
  moveProcessToNextDepartment,
  moveProcessToPreviousDepartment,
  getUserName,
  isRefreshing,
}: ProcessDetailsContentProps) => {
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Usar o hook de responsabilidade
  const {
    isMainResponsible,
    isSectorResponsible,
    hasResponsibleUser,
    mainResponsibleUserName,
    sectorResponsibleUserName,
    refreshResponsibility,
    acceptProcess
  } = useProcessResponsibility({ processId: process.id });

  const handleProcessAccepted = async () => {
    const success = await acceptProcess();
    if (success) {
      await refreshResponsibility();
      setRefreshKey(prev => prev + 1);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <ProcessCard
        process={process}
        getDepartmentName={getDepartmentName}
        getProcessTypeName={getProcessTypeName}
        moveProcessToNextDepartment={moveProcessToNextDepartment}
        moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
        mainResponsibleUserName={mainResponsibleUserName}
        sectorResponsibleUserName={sectorResponsibleUserName}
        isMainResponsible={isMainResponsible}
        isSectorResponsible={isSectorResponsible}
        showLabels={true}
      />

      <ProcessHistory 
        key={refreshKey}
        history={process.history} 
        getDepartmentName={getDepartmentName} 
        getUserName={getUserName}
        processId={process.id}
        protocolNumber={process.protocolNumber}
        hasResponsibleUser={hasResponsibleUser}
        onProcessAccepted={handleProcessAccepted}
        currentDepartmentId={process.currentDepartment}
      />
    </div>
  );
};

export default ProcessDetailsContent;
