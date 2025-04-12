
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { User } from "lucide-react";

interface ProcessResponsibleInfoProps {
  mainResponsibleUserName?: string;
  sectorResponsibleUserName?: string;
  showSectorResponsible?: boolean;
}

/**
 * Componente que exibe informações sobre os responsáveis pelo processo
 * Suporta exibição de responsável principal e do setor com tooltips
 */
const ProcessResponsibleInfo = ({
  mainResponsibleUserName,
  sectorResponsibleUserName,
  showSectorResponsible = true
}: ProcessResponsibleInfoProps) => {
  const hasMainResponsible = !!mainResponsibleUserName;
  const hasSectorResponsible = !!sectorResponsibleUserName && showSectorResponsible;
  
  if (!hasMainResponsible && !hasSectorResponsible) {
    return (
      <div className="flex items-center text-muted-foreground text-sm">
        <User className="h-4 w-4 mr-1" />
        <span>Nenhum responsável atribuído</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {hasMainResponsible && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="default" className="cursor-help flex items-center">
                <User className="h-3.5 w-3.5 mr-1" />
                <span className="truncate max-w-[180px]">{mainResponsibleUserName}</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Responsável principal</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {hasSectorResponsible && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="cursor-help flex items-center">
                <User className="h-3.5 w-3.5 mr-1" />
                <span className="truncate max-w-[180px]">{sectorResponsibleUserName}</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Responsável do setor</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default ProcessResponsibleInfo;
