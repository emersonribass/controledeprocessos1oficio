
import { Process } from "@/types";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import ProcessCardHeader from "./ProcessCardHeader";
import ProcessCardContent from "./ProcessCardContent";
import ProcessCardFooter from "./ProcessCardFooter";

type ProcessCardProps = {
  process: Process;
  getProcessTypeName: (id: string) => string;
  getDepartmentName: (id: string) => string;
  moveProcessToNextDepartment: (processId: string) => void;
  moveProcessToPreviousDepartment: (processId: string) => void;
  mainResponsibleUserName?: string;
  sectorResponsibleUserName?: string;
  isMainResponsible?: boolean;
  isSectorResponsible?: boolean;
  showLabels?: boolean;
};

const ProcessCard = ({
  process,
  getProcessTypeName,
  getDepartmentName,
  moveProcessToNextDepartment,
  moveProcessToPreviousDepartment,
  mainResponsibleUserName,
  sectorResponsibleUserName,
  isMainResponsible = false,
  isSectorResponsible = false,
  showLabels = false
}: ProcessCardProps) => {
  const [hasResponsibleUser, setHasResponsibleUser] = useState(!!mainResponsibleUserName || !!sectorResponsibleUserName);

  useEffect(() => {
    setHasResponsibleUser(!!mainResponsibleUserName || !!sectorResponsibleUserName);
  }, [mainResponsibleUserName, sectorResponsibleUserName]);
  
  // Verificar se o processo está no setor "Concluído(a)" usando o ID 10
  const isLastDepartment = process.currentDepartment === "10";
  const isFirstDepartment = process.currentDepartment === "1";
  
  const handleProcessAccepted = () => {
    setHasResponsibleUser(true);
  };

  return (
    <Card className="md:col-span-2">
      <ProcessCardHeader
        protocolNumber={process.protocolNumber}
        status={process.status}
        processTypeName={getProcessTypeName(process.processType)}
      />
      <ProcessCardContent
        startDate={process.startDate}
        expectedEndDate={process.expectedEndDate}
        currentDepartmentName={getDepartmentName(process.currentDepartment)}
        mainResponsibleUserName={mainResponsibleUserName}
        sectorResponsibleUserName={sectorResponsibleUserName}
      />
      <ProcessCardFooter
        processId={process.id}
        protocolNumber={process.protocolNumber}
        hasResponsibleUser={hasResponsibleUser}
        isFirstDepartment={isFirstDepartment}
        isLastDepartment={isLastDepartment}
        moveProcessToNextDepartment={moveProcessToNextDepartment}
        moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
        onProcessAccepted={handleProcessAccepted}
        isMainResponsible={isMainResponsible}
        isSectorResponsible={isSectorResponsible}
        currentDepartmentId={process.currentDepartment}
        status={process.status}
        showLabels={showLabels}
      />
    </Card>
  );
};

export default ProcessCard;
