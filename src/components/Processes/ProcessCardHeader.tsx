
import ProcessStatusBadge from "./ProcessStatusBadge";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProcessStatus } from "@/types";
import { ReactNode } from "react";

interface ProcessCardHeaderProps {
  protocolNumber: string;
  status: ProcessStatus;
  processTypeName: string;
  icon?: ReactNode;
  actionButtons?: ReactNode;
  subtitle?: string;
}

/**
 * Componente de cabeçalho para cards de processos
 * Exibe o número de protocolo, status e tipo do processo
 * Permite adicionar ícones personalizados e botões de ação
 */
const ProcessCardHeader = ({
  protocolNumber,
  status,
  processTypeName,
  icon,
  actionButtons,
  subtitle,
}: ProcessCardHeaderProps) => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <span className="text-primary">{icon}</span>}
          <span>Protocolo: {protocolNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          {actionButtons}
          <ProcessStatusBadge status={status} />
        </div>
      </CardTitle>
      <CardDescription className="flex flex-col space-y-1">
        <span>Tipo: {processTypeName}</span>
        {subtitle && <span>{subtitle}</span>}
      </CardDescription>
    </CardHeader>
  );
};

export default ProcessCardHeader;
