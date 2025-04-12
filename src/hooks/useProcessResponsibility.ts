
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth';
import { supabase } from '@/integrations/supabase/client';
import { ProcessResponsibleType } from '@/hooks/auth';

interface UseProcessResponsibilityProps {
  processId: string;
}

interface ProcessResponsibilityResult {
  isMainResponsible: boolean;
  isSectorResponsible: boolean;
  hasResponsibleUser: boolean;
  mainResponsibleUserName: string | undefined;
  sectorResponsibleUserName: string | undefined;
  responsibilityType: ProcessResponsibleType;
  loading: boolean;
  refreshResponsibility: () => Promise<void>;
  acceptProcess: () => Promise<boolean>;
}

export const useProcessResponsibility = ({ 
  processId 
}: UseProcessResponsibilityProps): ProcessResponsibilityResult => {
  const { user } = useAuth();
  const [mainResponsibleId, setMainResponsibleId] = useState<string | null>(null);
  const [sectorResponsibleId, setSectorResponsibleId] = useState<string | null>(null);
  const [mainResponsibleUserName, setMainResponsibleUserName] = useState<string | undefined>(undefined);
  const [sectorResponsibleUserName, setSectorResponsibleUserName] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const isMainResponsible = !!user && !!mainResponsibleId && user.id === mainResponsibleId;
  const isSectorResponsible = !!user && !!sectorResponsibleId && user.id === sectorResponsibleId;
  const hasResponsibleUser = !!mainResponsibleId || !!sectorResponsibleId;

  // Determinar o tipo de responsabilidade
  let responsibilityType = ProcessResponsibleType.NONE;
  if (isMainResponsible) {
    responsibilityType = ProcessResponsibleType.MAIN;
  } else if (isSectorResponsible) {
    responsibilityType = ProcessResponsibleType.SECTOR;
  }

  const fetchProcessResponsibility = async () => {
    if (!processId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Buscar informações do processo
      const { data: processData, error: processError } = await supabase
        .from('processos')
        .select('usuario_responsavel, resp_departamento_atual')
        .eq('id', processId)
        .single();
      
      if (processError) {
        console.error('Erro ao buscar responsáveis do processo:', processError);
        setLoading(false);
        return;
      }

      setMainResponsibleId(processData.usuario_responsavel);
      setSectorResponsibleId(processData.resp_departamento_atual);

      // Buscar nomes dos responsáveis
      if (processData.usuario_responsavel) {
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('nome')
          .eq('id', processData.usuario_responsavel)
          .single();
        
        if (!userError && userData) {
          setMainResponsibleUserName(userData.nome);
        }
      } else {
        setMainResponsibleUserName(undefined);
      }

      if (processData.resp_departamento_atual) {
        const { data: sectorUserData, error: sectorUserError } = await supabase
          .from('usuarios')
          .select('nome')
          .eq('id', processData.resp_departamento_atual)
          .single();
        
        if (!sectorUserError && sectorUserData) {
          setSectorResponsibleUserName(sectorUserData.nome);
        }
      } else {
        setSectorResponsibleUserName(undefined);
      }

    } catch (error) {
      console.error('Erro ao verificar responsabilidade do processo:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para aceitar um processo
  const acceptProcess = async (): Promise<boolean> => {
    if (!user || !processId) return false;
    
    try {
      const { error } = await supabase
        .from('processos')
        .update({ resp_departamento_atual: user.id })
        .eq('id', processId);
      
      if (error) {
        console.error('Erro ao aceitar responsabilidade pelo processo:', error);
        return false;
      }
      
      // Atualizar o estado local
      setSectorResponsibleId(user.id);
      setSectorResponsibleUserName(user.name);
      
      return true;
    } catch (error) {
      console.error('Erro ao aceitar responsabilidade pelo processo:', error);
      return false;
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    fetchProcessResponsibility();
  }, [processId, user?.id]);

  return {
    isMainResponsible,
    isSectorResponsible,
    hasResponsibleUser,
    mainResponsibleUserName,
    sectorResponsibleUserName,
    responsibilityType,
    loading,
    refreshResponsibility: fetchProcessResponsibility,
    acceptProcess
  };
};
