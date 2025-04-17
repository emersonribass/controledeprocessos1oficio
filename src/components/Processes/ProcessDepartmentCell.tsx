
interface ProcessDepartmentCellProps {
    departmentId: string;
    isCurrentDepartment: boolean;
    hasPassedDepartment: boolean;
    entryDate: string | null;
    showDate: boolean;
    isDepartmentOverdue?: boolean;
    departmentTimeLimit?: number;
    isProcessStarted?: boolean;
    responsible?: {
      nome: string;
      email: string;
    };
    isFirstDepartment?: boolean;
  }
  
  const ProcessDepartmentCell = ({
    // ... props existentes ...
    responsible,
    isFirstDepartment
  }: ProcessDepartmentCellProps) => {
    return (
      <div className="text-center">
        {showDate && entryDate && (
          <div className="text-xs text-black">
            {format(new Date(entryDate), "dd/MM/yyyy", {
              locale: ptBR
            })}
          </div>
        )}
  
        {/* Adicionar exibição do responsável */}
        {responsible && (
          <div className="text-xs text-gray-600 mt-1">
            <span className="font-medium">
              {isFirstDepartment ? "Resp. Processo:" : "Resp. Setor:"}
            </span>
            <br />
            <span className="text-primary">{responsible.nome}</span>
          </div>
        )}
  
        {isCurrentDepartment && isProcessStarted && (
          <div className={cn(
            "text-xs font-medium",
            isDepartmentOverdue ? "text-red-600" : "text-blue-600"
          )}>
            {isDepartmentOverdue ? (
              <span className="flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" /> Prazo expirado
              </span>
            ) : (
              <span>Em andamento</span>
            )}
            {!isDepartmentOverdue && departmentTimeLimit > 0 && (
              <div className="text-xs mt-1">
                {remainingDays > 0 ? `${remainingDays} dia(s) restante(s)` : "Vence hoje"}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };