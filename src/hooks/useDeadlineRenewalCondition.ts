
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
        
        // Log completo do objeto para depuração
        console.log('[RenewDeadline] Entrada mais recente (objeto completo):', JSON.stringify(entradaMaisRecente));
        console.log('[RenewDeadline] Estrutura do objeto:', Object.keys(entradaMaisRecente || {}));
        
        if (entradaMaisRecente) {
          // Log para depurar os campos específicos que estamos procurando
          console.log('[RenewDeadline] ID direto:', entradaMaisRecente.id);
          console.log('[RenewDeadline] historyId:', entradaMaisRecente.historyId);
          console.log('[RenewDeadline] Outros campos potenciais:', { 
            id_historico: entradaMaisRecente.id_historico,
            historico_id: entradaMaisRecente.historico_id
          });
          
          // Tenta encontrar o ID usando várias estratégias
          let histId: number | undefined = undefined;
          
          // Estratégia 1: Buscar o ID diretamente do objeto atual
          if (typeof entradaMaisRecente.id === 'number') {
            histId = entradaMaisRecente.id;
            console.log('[RenewDeadline] ID encontrado diretamente:', histId);
          } 
          // Estratégia 2: Verificar campos alternativos de ID
          else if (typeof entradaMaisRecente.historyId === 'number') {
            histId = entradaMaisRecente.historyId;
            console.log('[RenewDeadline] ID encontrado em historyId:', histId);
          } 
          else if (typeof entradaMaisRecente.id_historico === 'number') {
            histId = entradaMaisRecente.id_historico;
            console.log('[RenewDeadline] ID encontrado em id_historico:', histId);
          }
          else if (typeof entradaMaisRecente.historico_id === 'number') {
            histId = entradaMaisRecente.historico_id;
            console.log('[RenewDeadline] ID encontrado em historico_id:', histId);
          }
          // Estratégia 3: Se o ID existir como string, converter para número
          else if (typeof entradaMaisRecente.id === 'string' && !isNaN(Number(entradaMaisRecente.id))) {
            histId = Number(entradaMaisRecente.id);
            console.log('[RenewDeadline] ID convertido de string:', histId);
          }
          
          // Estratégia 4: Buscar o registro original no histórico completo usando correspondência de campos
          if (histId === undefined) {
            console.log('[RenewDeadline] Buscando no histórico completo...');
            
            // Primeiro, vamos fazer um log de todos os registros históricos para debug
            console.log('[RenewDeadline] Todos os registros históricos:', 
                       process.history.map((h: any) => ({ 
                         id: h.id, 
                         departmentId: h.departmentId || h.setor_id || h.setorId,
                         entryDate: h.entryDate || h.data_entrada,
                         exitDate: h.exitDate || h.data_saida
                       })));
            
            const entradaOriginal = process.history.find(
              (h: any) => {
                const matchDepartment = (
                  h.departmentId === process.currentDepartment ||
                  h.setor_id === process.currentDepartment ||
                  h.setorId === process.currentDepartment
                );
                
                const noExit = (
                  h.exitDate === null || 
                  h.data_saida === null
                );
                
                const matchEntryDate = (
                  (h.entryDate && entradaMaisRecente.entryDate && 
                   h.entryDate === entradaMaisRecente.entryDate) ||
                  (h.data_entrada && entradaMaisRecente.data_entrada && 
                   h.data_entrada === entradaMaisRecente.data_entrada)
                );
                
                const hasId = (
                  typeof h.id === 'number' || 
                  (typeof h.id === 'string' && !isNaN(Number(h.id)))
                );
                
                console.log('[RenewDeadline] Comparando registro:', { 
                  id: h.id, 
                  matchDepartment, 
                  noExit, 
                  matchEntryDate, 
                  hasId 
                });
                
                return matchDepartment && noExit && matchEntryDate && hasId;
              }
            );
            
            if (entradaOriginal) {
              console.log('[RenewDeadline] Entrada original encontrada:', entradaOriginal);
              if (typeof entradaOriginal.id === 'number') {
                histId = entradaOriginal.id;
              } else if (typeof entradaOriginal.id === 'string' && !isNaN(Number(entradaOriginal.id))) {
                histId = Number(entradaOriginal.id);
              }
              console.log('[RenewDeadline] ID encontrado no registro original:', histId);
            }
          }

          // Finalmente, depois de tentar todas as estratégias, usamos o ID encontrado
          setHistoryId(histId);
          setCanRenewDeadline(histId !== undefined);
          console.log('[RenewDeadline] Resultado final - Pode renovar prazo:', !!histId, '| History ID:', histId);
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
