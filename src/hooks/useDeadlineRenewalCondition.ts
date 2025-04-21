
import { useState, useEffect } from "react";
import { useSupabase } from "@/hooks/useSupabase";

/**
 * Hook para verificar se um processo pode ter seu prazo renovado
 * Este hook é usado exclusivamente na tela de detalhes do processo
 */
export const useDeadlineRenewalCondition = (processId: string, currentDepartment: string, isOverdue: boolean) => {
  const [canRenewDeadline, setCanRenewDeadline] = useState(false);
  const [historyId, setHistoryId] = useState<number | undefined>(undefined);
  const { getProcessoHistorico } = useSupabase();

  useEffect(() => {
    const checkRenewalCondition = async () => {
      // Setor "Aguard. Doc." tem ID 2 no sistema
      const isAwaitingDocs = currentDepartment === "2";
      
      // Se não estiver atrasado ou não for o setor certo, não pode renovar
      if (!isOverdue || !isAwaitingDocs) {
        setCanRenewDeadline(false);
        return;
      }
      
      try {
        // Buscar o registro mais recente do histórico para o processo no departamento atual
        const { data, error } = await getProcessoHistorico(processId, currentDepartment);
        
        if (error || !data || data.length === 0) {
          console.error("Erro ao buscar histórico do processo:", error);
          setCanRenewDeadline(false);
          return;
        }
        
        // Ordenar por mais recente e pegar o primeiro
        const sortedHistory = data.sort((a, b) => 
          new Date(b.data_entrada).getTime() - new Date(a.data_entrada).getTime()
        );
        
        const latestEntry = sortedHistory[0];
        
        if (latestEntry && latestEntry.data_saida === null) {
          setHistoryId(latestEntry.id);
          setCanRenewDeadline(true);
        } else {
          setCanRenewDeadline(false);
        }
      } catch (err) {
        console.error("Erro ao verificar condição de renovação:", err);
        setCanRenewDeadline(false);
      }
    };
    
    if (processId && currentDepartment) {
      checkRenewalCondition();
    }
  }, [processId, currentDepartment, isOverdue]);
  
  return { canRenewDeadline, historyId };
};
