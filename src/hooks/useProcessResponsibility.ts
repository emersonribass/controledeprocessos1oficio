
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';
import { toast } from 'sonner';

interface UseProcessResponsibilityProps {
  processId: string;
}

export const useProcessResponsibility = ({ processId }: UseProcessResponsibilityProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [hasResponsibleUser, setHasResponsibleUser] = useState(false);
  const [isMainResponsible, setIsMainResponsible] = useState(false);
  const [isSectorResponsible, setIsSectorResponsible] = useState(false);
  const [mainResponsibleUserName, setMainResponsibleUserName] = useState<string | undefined>();
  const [sectorResponsibleUserName, setSectorResponsibleUserName] = useState<string | undefined>();
  const [currentDepartmentId, setCurrentDepartmentId] = useState<string | null>(null);
  const [userNameMap, setUserNameMap] = useState<Record<string, string>>({});
  
  // Efeito para verificar a responsabilidade pelo processo
  const refreshResponsibility = async () => {
    if (!user || !processId) return;
    
    setIsLoading(true);
    
    try {
      // Buscar informações do processo
      const { data: processData, error: processError } = await supabase
        .from('processos')
        .select('usuario_responsavel, setor_atual')
        .eq('id', processId)
        .single();
      
      if (processError) throw processError;
      
      // Atualizar responsável principal
      if (processData?.usuario_responsavel) {
        setIsMainResponsible(processData.usuario_responsavel === user.id);
        await fetchUserName(processData.usuario_responsavel);
        setHasResponsibleUser(true);
      } else {
        setIsMainResponsible(false);
      }
      
      // Atualizar departamento atual
      if (processData?.setor_atual) {
        setCurrentDepartmentId(processData.setor_atual);
        
        // Verificar responsável pelo departamento atual
        const { data: historyData, error: historyError } = await supabase
          .from('processos_historico')
          .select('usuario_responsavel_setor')
          .eq('processo_id', processId)
          .eq('setor_id', processData.setor_atual)
          .is('data_saida', null)
          .maybeSingle();
        
        if (!historyError && historyData?.usuario_responsavel_setor) {
          setIsSectorResponsible(historyData.usuario_responsavel_setor === user.id);
          await fetchUserName(historyData.usuario_responsavel_setor, true);
          if (!processData.usuario_responsavel) {
            setHasResponsibleUser(true);
          }
        } else {
          setIsSectorResponsible(false);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar responsabilidade do processo:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Buscar o nome do usuário pelo ID
  const fetchUserName = async (userId: string, isSector: boolean = false) => {
    // Verificar se já está no mapa
    if (userNameMap[userId]) {
      if (isSector) {
        setSectorResponsibleUserName(userNameMap[userId]);
      } else {
        setMainResponsibleUserName(userNameMap[userId]);
      }
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('nome')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      if (data?.nome) {
        // Atualizar o mapa
        setUserNameMap(prev => ({
          ...prev,
          [userId]: data.nome
        }));
        
        // Definir o nome apropriado
        if (isSector) {
          setSectorResponsibleUserName(data.nome);
        } else {
          setMainResponsibleUserName(data.nome);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar nome do usuário:', error);
    }
  };
  
  // Aceitar responsabilidade pelo processo
  const acceptProcess = async () => {
    if (!user || !processId || !currentDepartmentId) return false;
    
    setIsLoading(true);
    try {
      // Atualizar o histórico do processo
      const { error: updateError } = await supabase
        .from('processos_historico')
        .update({
          usuario_responsavel_setor: user.id
        })
        .eq('processo_id', processId)
        .eq('setor_id', currentDepartmentId)
        .is('data_saida', null);
      
      if (updateError) throw updateError;
      
      toast.success('Processo aceito com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao aceitar processo:', error);
      toast.error('Erro ao aceitar processo');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Efeito para carregar os dados iniciais
  useEffect(() => {
    refreshResponsibility();
  }, [processId, user]);
  
  return {
    isLoading,
    isMainResponsible,
    isSectorResponsible,
    hasResponsibleUser,
    mainResponsibleUserName,
    sectorResponsibleUserName,
    refreshResponsibility,
    acceptProcess
  };
};
