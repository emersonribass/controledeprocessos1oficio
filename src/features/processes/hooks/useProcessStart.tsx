
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProcessStart = () => {
  const [isStarting, setIsStarting] = useState(false);

  const startProcess = async (processId: string): Promise<void> => {
    try {
      setIsStarting(true);

      // 1. Obter o primeiro departamento (ordem = 1)
      const { data: firstDept, error: deptError } = await supabase
        .from("setores")
        .select("id")
        .order("order_num", { ascending: true })
        .limit(1)
        .single();

      if (deptError || !firstDept) {
        console.error("Erro ao buscar o primeiro departamento:", deptError);
        toast.error("Erro ao iniciar processo: não foi possível determinar o primeiro departamento");
        return;
      }

      const firstDeptId = firstDept.id.toString();

      // 2. Atualizar o processo para status "Em andamento" e definir o setor atual
      const now = new Date().toISOString();
      const { error: updateError } = await supabase
        .from("processos")
        .update({
          status: "Em andamento",
          setor_atual: firstDeptId,
          data_inicio: now,
        })
        .eq("id", processId);

      if (updateError) {
        console.error("Erro ao atualizar status do processo:", updateError);
        toast.error("Erro ao iniciar processo");
        return;
      }

      // 3. Adicionar registro ao histórico do processo
      const { error: historicoError } = await supabase
        .from("processos_historico")
        .insert({
          processo_id: processId,
          setor_id: firstDeptId,
          data_entrada: now
        });

      if (historicoError) {
        console.error("Erro ao registrar histórico do processo:", historicoError);
        toast.error("Erro ao registrar histórico do processo");
        // Não retornar aqui para evitar processo em estado inconsistente
      }

      toast.success("Processo iniciado com sucesso");
    } catch (error) {
      console.error("Erro ao iniciar processo:", error);
      toast.error("Erro ao iniciar processo");
    } finally {
      setIsStarting(false);
    }
  };

  return {
    isStarting,
    startProcess
  };
};
