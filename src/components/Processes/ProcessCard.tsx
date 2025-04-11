
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
  responsibleUserName?: string;
};

const ProcessCard = ({
  process,
  getProcessTypeName,
  getDepartmentName,
  moveProcessToNextDepartment,
  moveProcessToPreviousDepartment,
  responsibleUserName
}: ProcessCardProps) => {
  const [hasResponsibleUser, setHasResponsibleUser] = useState(!!responsibleUserName);

  useEffect(() => {
    setHasResponsibleUser(!!responsibleUserName);
  }, [responsibleUserName]);
  
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
        responsibleUserName={responsibleUserName}
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
      />
    </Card>
  );
};

export default ProcessCard;
