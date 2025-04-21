
import { useState, useEffect } from "react";
import { useSupabase } from "@/hooks/useSupabase";
import { isDepartmentOverdue } from "@/utils/processDeadlines";

/**
 * Hook para verificar se um processo pode ter seu prazo renovado.
 * Este hook é usado exclusivamente na tela de detalhes do processo.
 */
export const useDeadlineRenewalCondition = (
  process: any // Continua a receber o processo inteiro ao invés de campos quebrados
) => {
  const [canRenewDeadline, setCanRenewDeadline] = useState(false);
  const [historyId, setHistoryId] = useState<number | undefined>(undefined);
  const { getSetorById } = useSupabase();

  useEffect(() => {
    const checkRenewalCondition = async () => {
      if (!process?.id || !process?.currentDepartment) {
        setCanRenewDeadline(false);
        setHistoryId(undefined);
        console.log('[RenewDeadline] Processo ou setor não informado');
        return;
      }

      // Considera "Aguard. Doc." como ID 2, mas aceita tanto string quanto number
      const isAwaitingDocs =
        process.currentDepartment === "2" || process.currentDepartment === 2;

      console.log('[RenewDeadline] Processo', process.id, '| Setor atual:', process.currentDepartment, '| Aguardando doc:', isAwaitingDocs);

      if (!isAwaitingDocs) {
        setCanRenewDeadline(false);
        setHistoryId(undefined);
        console.log('[RenewDeadline] Processo não está no setor Aguard. Doc.');
        return;
      }

      try {
        // Busca limite de tempo do setor atual
        const { data: setor, error } = await getSetorById(process.currentDepartment);
        if (error || !setor) {
          setCanRenewDeadline(false);
          setHistoryId(undefined);
          console.log('[RenewDeadline] Erro ao buscar setor:', error);
          return;
        }
        
        // Corrige para o campo certo vindo do Supabase
        const timeLimit = setor.time_limit ?? null;

        // Usa utilitário para checar atraso REAL neste setor
        const atrasadoNoSetor = isDepartmentOverdue({
          history: process.history,
          currentDepartment: process.currentDepartment,
          departmentTimeLimit: timeLimit,
        });

        console.log('[RenewDeadline] atrasoDetectado:', atrasadoNoSetor, '| timeLimit:', timeLimit);

        if (!atrasadoNoSetor) {
          setCanRenewDeadline(false);
          setHistoryId(undefined);
          console.log('[RenewDeadline] Não está atrasado no setor Aguard. Doc.');
          return;
        }

        // Busca a entrada mais recente SEM saída do histórico DENTRO deste setor
        const entries = process.history
          .filter(
            (h: any) =>
              (h.departmentId === process.currentDepartment ||
               h.setor_id === process.currentDepartment ||
               h.setorId === process.currentDepartment) &&
              (h.exitDate === null || h.data_saida == null)
          )
          // Maior data de entrada primeiro
          .sort((a: any, b: any) => 
            new Date(b.entryDate || b.data_entrada).getTime()
                 - new Date(a.entryDate || a.data_entrada).getTime()
          );

        const entradaMaisRecente = entries[0];
        console.log('[RenewDeadline] Entrada mais recente no setor:', entradaMaisRecente);

        if (entradaMaisRecente) {
          // Procura o campo "id" direto ou, se não existir, tenta buscar por "historyId" ou procura pelo id real do registros históricos
          // Padrão real Supabase para processos_historico: campo inteiro chamado "id"
          // Como fallback adicional, busca no array original o item correspondente usando as datas/campos
          let histId: number | undefined = undefined;
          if (entradaMaisRecente.id) {
            histId = entradaMaisRecente.id;
          } else {
            // Procura na lista bruta do histórico o item equivalente com id
            const entradaOriginal = process.history.find(
              (h: any) =>
                // Confere entrada igual usada acima, mas restringe por campos + compara entryDate
                (h.departmentId === process.currentDepartment ||
                 h.setor_id === process.currentDepartment ||
                 h.setorId === process.currentDepartment) &&
                (h.exitDate === null || h.data_saida == null) &&
                ((h.entryDate && entradaMaisRecente.entryDate && h.entryDate === entradaMaisRecente.entryDate) ||
                 (h.data_entrada && entradaMaisRecente.data_entrada && h.data_entrada === entradaMaisRecente.data_entrada))
                && h.id
            );
            if (entradaOriginal && entradaOriginal.id) {
              histId = entradaOriginal.id;
            }
          }

          setHistoryId(histId);
          setCanRenewDeadline(!!histId);
          console.log('[RenewDeadline] Pode renovar prazo. History ID:', histId);
        } else {
          setHistoryId(undefined);
          setCanRenewDeadline(false);
          console.log('[RenewDeadline] Não achou histórico ativo do setor');
        }
      } catch (err) {
        setCanRenewDeadline(false);
        setHistoryId(undefined);
        console.log('[RenewDeadline] Exceção:', err);
      }
    };

    checkRenewalCondition();
  }, [process]);

  return { canRenewDeadline, historyId };
};
