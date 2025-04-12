
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useErrorHandler } from "@/hooks/useErrorHandler";

export const useProcessResponsibles = ({ processId }: { processId: string }) => {
  const [mainResponsible, setMainResponsible] = useState<string | null>(null);
  const [sectorResponsible, setSectorResponsible] = useState<string | null>(null);
  const [isMainResponsible, setIsMainResponsible] = useState(false);
  const [isSectorResponsible, setIsSectorResponsible] = useState(false);
  const [mainResponsibleUserName, setMainResponsibleUserName] = useState<string | null>(null);
  const [sectorResponsibleUserName, setSectorResponsibleUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasResponsibleUser, setHasResponsibleUser] = useState(false);
  
  const { handleError } = useErrorHandler();

  const refreshResponsibility = async () => {
    try {
      setIsLoading(true);

      // Buscar informação do processo
      const { data: process, error: processError } = await supabase
        .from('processos')
        .select('usuario_responsavel, setor_atual')
        .eq('id', processId)
        .single();

      if (processError) throw processError;

      // Verificar se possui responsável principal
      if (process?.usuario_responsavel) {
        setMainResponsible(process.usuario_responsavel);
        setHasResponsibleUser(true);
        
        // Buscar informação do usuário responsável principal
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('nome')
          .eq('id', process.usuario_responsavel)
          .maybeSingle();
          
        if (userError) throw userError;
        
        if (userData) {
          setMainResponsibleUserName(userData.nome);
        }
      }

      // Buscar o último histórico do processo para ver quem é o responsável pelo setor atual
      const { data: history, error: historyError } = await supabase
        .from('processos_historico')
        .select('*')
        .eq('processo_id', processId)
        .eq('setor_id', process?.setor_atual)
        .is('data_saida', null)
        .order('data_entrada', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (historyError) throw historyError;

      if (history?.usuario_responsavel_setor) {
        setSectorResponsible(history.usuario_responsavel_setor);
        
        // Buscar informação do usuário responsável pelo setor
        const { data: sectorUserData, error: sectorUserError } = await supabase
          .from('usuarios')
          .select('nome')
          .eq('id', history.usuario_responsavel_setor)
          .maybeSingle();
          
        if (sectorUserError) throw sectorUserError;
        
        if (sectorUserData) {
          setSectorResponsibleUserName(sectorUserData.nome);
        }
      }

      // Verificar sessão atual
      const { data: session } = await supabase.auth.getSession();
      const currentUser = session?.session?.user?.id;

      if (currentUser) {
        // Verificar se o usuário atual é o responsável principal
        setIsMainResponsible(currentUser === process?.usuario_responsavel);
        
        // Verificar se o usuário atual é o responsável pelo setor
        setIsSectorResponsible(currentUser === history?.usuario_responsavel_setor);
      }

    } catch (error) {
      handleError(error, { 
        showToast: true, 
        toastDuration: 5000,
        logError: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const acceptProcess = async () => {
    try {
      // Verificar sessão atual
      const { data: session } = await supabase.auth.getSession();
      const currentUser = session?.session?.user?.id;
      
      if (!currentUser) {
        throw new Error("Usuário não autenticado");
      }
      
      // Buscar informação do processo
      const { data: process, error: processError } = await supabase
        .from('processos')
        .select('setor_atual')
        .eq('id', processId)
        .single();
        
      if (processError) throw processError;

      // Atualizar responsável pelo setor no histórico atual
      const { error: updateError } = await supabase
        .from('processos_historico')
        .update({ usuario_responsavel_setor: currentUser })
        .eq('processo_id', processId)
        .eq('setor_id', process.setor_atual)
        .is('data_saida', null);
        
      if (updateError) throw updateError;
      
      toast.success("Processo aceito com sucesso", { 
        description: "Você agora é o responsável por este processo neste setor." 
      });
      
      return true;
    } catch (error) {
      handleError(error);
      return false;
    }
  };

  // Carregar responsabilidades ao montar
  useEffect(() => {
    refreshResponsibility();
  }, [processId]);

  return {
    mainResponsible,
    sectorResponsible,
    isMainResponsible,
    isSectorResponsible,
    mainResponsibleUserName,
    sectorResponsibleUserName,
    isLoading,
    hasResponsibleUser,
    refreshResponsibility,
    acceptProcess
  };
};
