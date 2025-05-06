
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabase } from "@/hooks/useSupabase";
import { useState, useEffect } from "react";
import { addBusinessDays, getRemainingBusinessDays } from "@/utils/dateUtils";

interface ProcessDeadlineCardProps {
  process: any;
}

const ProcessDeadlineCard = ({ process }: ProcessDeadlineCardProps) => {
  const [departmentTimeLimit, setDepartmentTimeLimit] = useState<number | null>(null);
  const { getSetorById } = useSupabase();

  // Buscar o limite de tempo do departamento atual
  useEffect(() => {
    const fetchDepartmentTimeLimit = async () => {
      if (!process.currentDepartment) return;
      
      try {
        const { data, error } = await getSetorById(process.currentDepartment);
        
        if (error) {
          console.error("Erro ao buscar prazo do setor:", error);
          return;
        }
        
        if (data) {
          setDepartmentTimeLimit(data.time_limit);
        }
      } catch (error) {
        console.error("Erro ao processar prazo do setor:", error);
      }
    };

    fetchDepartmentTimeLimit();
  }, [process.currentDepartment]);

  // Calcular dias úteis restantes
  const calculateRemainingBusinessDays = () => {
    if (!departmentTimeLimit || process.status === "not_started") return null;
    
    // Procurar a entrada atual no histórico (mais recente sem data de saída)
    const currentEntry = process.history?.find((h: any) => 
      h.departmentId === process.currentDepartment && !h.exitDate
    );
    
    if (!currentEntry) return null;
    
    // Compatibilidade com diferentes estruturas de dados
    const entryDate = new Date(currentEntry.entryDate || currentEntry.data_entrada || "");
    
    // Calcular a data limite considerando dias úteis
    const deadline = addBusinessDays(entryDate, departmentTimeLimit);
    
    // Calcular dias úteis restantes
    return getRemainingBusinessDays(deadline);
  };

  const remainingBusinessDays = calculateRemainingBusinessDays();
  const isOverdue = remainingBusinessDays !== null && remainingBusinessDays < 0;
  const daysOverdue = isOverdue ? Math.abs(remainingBusinessDays) : null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Prazo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Prazo no Setor Atual
            </h3>
            
            {departmentTimeLimit ? (
              <div className={`text-lg font-bold ${isOverdue ? "text-red-500" : ""}`}>
                {departmentTimeLimit} dias úteis
                {remainingBusinessDays !== null && !isOverdue && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({remainingBusinessDays} dias úteis restantes)
                  </span>
                )}
              </div>
            ) : (
              <div className="text-lg font-bold">
                Sem prazo definido
              </div>
            )}
            
            {isOverdue && daysOverdue && (
              <p className="text-sm text-red-500 mt-1">
                Prazo expirado há {daysOverdue} dias úteis
              </p>
            )}
          </div>
          
          {process.expectedEndDate && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Prazo Final do Processo
              </h3>
              <div className="text-lg font-bold">
                {new Date(process.expectedEndDate).toLocaleDateString('pt-BR')}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessDeadlineCard;
