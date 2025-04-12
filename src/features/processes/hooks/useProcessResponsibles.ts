
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth";
import { toast } from "sonner";

// Definindo a interface do resultado do hook
export interface ProcessResponsiblesHookResult {
  mainResponsibleUserName: string | null;
  sectorResponsibleUserName: string | null;
  isMainResponsible: boolean;
  isSectorResponsible: boolean;
  hasResponsibleUser: boolean;
  processResponsibles: Record<string, unknown>;
  setProcessResponsibles?: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  hasProcessResponsible: (processId: string) => boolean;
  isUserProcessResponsible: (processId: string) => boolean;
  refreshResponsibility: () => Promise<void>;
  acceptProcess: () => Promise<boolean>;
}

interface ProcessResponsiblesProps {
  processId?: string;
  processes?: Array<{ id: string }>;
}

export const useProcessResponsibles = ({ processId, processes }: ProcessResponsiblesProps): ProcessResponsiblesHookResult => {
  const { user } = useAuth();
  const [mainResponsibleUserName, setMainResponsibleUserName] = useState<string | null>(null);
  const [sectorResponsibleUserName, setSectorResponsibleUserName] = useState<string | null>(null);
  const [isMainResponsible, setIsMainResponsible] = useState(false);
  const [isSectorResponsible, setIsSectorResponsible] = useState(false);
  const [hasResponsibleUser, setHasResponsibleUser] = useState(false);
  const [processResponsibles, setProcessResponsibles] = useState<Record<string, unknown>>({});

  // Verificar responsáveis para um único processo
  const checkProcessResponsibles = useCallback(async () => {
    if (!processId || !user) return;

    try {
      // Verificar responsável principal do processo
      const { data: process } = await supabase
        .from('processos')
        .select('usuario_responsavel_id')
        .eq('id', processId)
        .single();

      if (process?.usuario_responsavel_id) {
        setIsMainResponsible(process.usuario_responsavel_id === user.id);
        setHasResponsibleUser(true);

        // Buscar nome do responsável principal
        const { data: mainUser } = await supabase
          .from('usuarios')
          .select('nome_completo')
          .eq('id', process.usuario_responsavel_id)
          .single();

        setMainResponsibleUserName(mainUser?.nome_completo || null);
      } else {
        setIsMainResponsible(false);
        setHasResponsibleUser(false);
        setMainResponsibleUserName(null);
      }

      // Verificar responsável de setor atual
      const { data: historico } = await supabase
        .from('processos_historico')
        .select('usuario_responsavel_setor, setor_id')
        .eq('processo_id', processId)
        .is('data_saida', null)
        .single();

      if (historico?.usuario_responsavel_setor) {
        setIsSectorResponsible(historico.usuario_responsavel_setor === user.id);
        
        // Buscar nome do responsável do setor
        const { data: sectorUser } = await supabase
          .from('usuarios')
          .select('nome_completo')
          .eq('id', historico.usuario_responsavel_setor)
          .single();

        setSectorResponsibleUserName(sectorUser?.nome_completo || null);
      } else {
        setIsSectorResponsible(false);
        setSectorResponsibleUserName(null);
      }
    } catch (error) {
      console.error("Erro ao verificar responsáveis do processo:", error);
      setIsMainResponsible(false);
      setIsSectorResponsible(false);
    }
  }, [processId, user]);

  // Verificar responsáveis para múltiplos processos
  const checkMultipleProcessResponsibles = useCallback(async () => {
    if (!processes || !processes.length || !user) return;

    try {
      const newResponsibles: Record<string, unknown> = {};

      for (const process of processes) {
        const { data: historico } = await supabase
          .from('processos_historico')
          .select('usuario_responsavel_setor')
          .eq('processo_id', process.id)
          .is('data_saida', null)
          .maybeSingle();

        if (historico?.usuario_responsavel_setor) {
          newResponsibles[process.id] = historico.usuario_responsavel_setor;
        }
      }

      setProcessResponsibles(newResponsibles);
    } catch (error) {
      console.error("Erro ao verificar responsáveis dos processos:", error);
    }
  }, [processes, user]);

  // Verificar se um processo específico tem um responsável
  const hasProcessResponsible = useCallback((processId: string): boolean => {
    return !!processResponsibles[processId];
  }, [processResponsibles]);

  // Verificar se o usuário atual é responsável por um processo específico
  const isUserProcessResponsible = useCallback((processId: string): boolean => {
    return processResponsibles[processId] === user?.id;
  }, [processResponsibles, user]);

  // Aceitar responsabilidade por um processo
  const acceptProcess = useCallback(async (): Promise<boolean> => {
    if (!processId || !user) return false;

    try {
      const { data: historico, error: findError } = await supabase
        .from('processos_historico')
        .select('*')
        .eq('processo_id', processId)
        .is('data_saida', null)
        .single();

      if (findError) {
        console.error("Erro ao encontrar histórico do processo:", findError);
        toast.error("Erro ao aceitar processo", {
          description: "Não foi possível encontrar o histórico atual do processo."
        });
        return false;
      }

      if (historico.usuario_responsavel_setor) {
        toast.warning("Processo já possui um responsável", {
          description: "Este processo já possui um responsável neste setor."
        });
        return false;
      }

      const { error: updateError } = await supabase
        .from('processos_historico')
        .update({ usuario_responsavel_setor: user.id })
        .eq('id', historico.id);

      if (updateError) {
        console.error("Erro ao atualizar responsável do processo:", updateError);
        toast.error("Erro ao aceitar processo", {
          description: "Não foi possível atualizar o responsável do processo."
        });
        return false;
      }

      toast.success("Processo aceito com sucesso", {
        description: "Você agora é responsável por este processo neste setor."
      });

      return true;
    } catch (error) {
      console.error("Erro ao aceitar processo:", error);
      toast.error("Erro ao aceitar processo", {
        description: "Ocorreu um erro ao tentar aceitar o processo."
      });
      return false;
    }
  }, [processId, user]);

  // Atualizar os dados de responsabilidade
  const refreshResponsibility = useCallback(async () => {
    if (processId) {
      await checkProcessResponsibles();
    } else if (processes && processes.length) {
      await checkMultipleProcessResponsibles();
    }
  }, [processId, processes, checkProcessResponsibles, checkMultipleProcessResponsibles]);

  // Efeito para inicializar dados
  useEffect(() => {
    refreshResponsibility();
  }, [refreshResponsibility]);

  return {
    mainResponsibleUserName,
    sectorResponsibleUserName,
    isMainResponsible,
    isSectorResponsible,
    hasResponsibleUser,
    processResponsibles,
    setProcessResponsibles,
    hasProcessResponsible,
    isUserProcessResponsible,
    refreshResponsibility,
    acceptProcess
  };
};
