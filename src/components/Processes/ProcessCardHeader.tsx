
import ProcessStatusBadge from "./ProcessStatusBadge";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProcessStatus } from "@/types";

interface ProcessCardHeaderProps {
  protocolNumber: string;
  status: ProcessStatus;
  processTypeName: string;
}

const ProcessCardHeader = ({
  protocolNumber,
  status,
  processTypeName,
}: ProcessCardHeaderProps) => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <span>Protocolo: {protocolNumber}</span>
        <ProcessStatusBadge status={status} />
      </CardTitle>
      <CardDescription>
        Tipo: {processTypeName}
      </CardDescription>
    </CardHeader>
  );
};

export default ProcessCardHeader;
