
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/hooks/use-toast";
import { useResponsibleBatchLoader } from "./process-responsibility/useResponsibleBatchLoader";
import { useProcessResponsibleFetching } from "./process-responsibility/useProcessResponsibleFetching";
import { ProcessResponsible } from "./process-responsibility/types";

/**
 * Hook centralizado para gerenciar responsabilidades de processos
 * Usa o sistema de carregamento em lote para otimização
 */
export const useProcessResponsibility = () => {
  const [isAccepting, setIsAccepting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Utiliza o hook de carregamento em lote
  const { 
    hasResponsibleForSector,
    isUserResponsibleForSector,
    queueProcessForLoading
  } = useResponsibleBatchLoader();
  
  // Utiliza o hook especializado para busca de responsáveis específicos
  const { 
    getProcessResponsible, 
    getSectorResponsible
  } = useProcessResponsibleFetching();
  
  /**
   * Aceita a responsabilidade por um processo em seu setor atual
   */
  const acceptProcessResponsibility = useCallback(async (
    processId: string,
    protocolNumber?: string
  ): Promise<boolean> => {
    if (!user) return false;
    
    setIsAccepting(true);
    try {
      // Primeiro, buscar o setor atual do processo específico
      const { data: process, error: processError } = await supabase
        .from('processos')
        .select('setor_atual, status')
        .eq('id', processId)
        .single();
      
      if (processError) {
        console.error(`Erro ao buscar processo ${processId}:`, processError);
        throw processError;
      }
      
      if (!process) {
        throw new Error(`Processo ${processId} não encontrado`);
      }
      
      // Não permitir aceitar processos não iniciados
      if (process.status === 'not_started') {
        toast({
          title: "Erro",
          description: "Não é possível aceitar processos não iniciados.",
          variant: "destructive"
        });
        return false;
      }
      
      const currentSectorId = process.setor_atual;
      console.log(`Aceitando responsabilidade para o processo ${processId} no setor ${currentSectorId}`);
      
      // Verificar se o usuário pertence ao setor
      const { data: userProfile, error: userError } = await supabase
        .from('usuarios')
        .select('setores_atribuidos')
        .eq('id', user.id)
        .single();
      
      if (userError) {
        console.error("Erro ao buscar perfil do usuário:", userError);
        throw userError;
      }
      
      const userSectors = userProfile?.setores_atribuidos || [];
      
      if (!userSectors.includes(currentSectorId)) {
        toast({
          title: "Erro",
          description: "Você não pertence ao setor atual deste processo.",
          variant: "destructive"
        });
        return false;
      }
      
      // Verificar se já existe um responsável para o processo neste setor
      const { data: existingResponsible, error: respError } = await supabase
        .from('setor_responsaveis')
        .select('usuario_id')
        .eq('processo_id', processId)
        .eq('setor_id', currentSectorId)
        .maybeSingle();
      
      if (respError) {
        console.error("Erro ao verificar responsável existente:", respError);
        throw respError;
      }
      
      // Se já existe um responsável e é o usuário atual, apenas retornar sucesso
      if (existingResponsible && existingResponsible.usuario_id === user.id) {
        toast({
          title: "Informação",
          description: "Você já é responsável por este processo."
        });
        return true;
      }
      
      // Se existe outro responsável, não podemos aceitar
      if (existingResponsible) {
        toast({
          title: "Erro",
          description: "Este processo já possui um responsável neste setor.",
          variant: "destructive"
        });
        return false;
      }
      
      // Inserir nova responsabilidade
      const { error: insertError } = await supabase
        .from('setor_responsaveis')
        .insert({
          processo_id: processId,
          setor_id: currentSectorId,
          usuario_id: user.id,
          data_atribuicao: new Date().toISOString()
        });
      
      if (insertError) {
        console.error("Erro ao inserir responsabilidade:", insertError);
        throw insertError;
      }
      
      // Atualizar o usuário responsável no registro principal do processo
      const { error: updateError } = await supabase
        .from('processos')
        .update({
          usuario_responsavel: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', processId);
      
      if (updateError) {
        console.error("Erro ao atualizar responsável principal do processo:", updateError);
      }
      
      // Adicionar à fila de carregamento para atualizar o cache
      queueProcessForLoading(processId, process.status);
      
      toast({
        title: "Sucesso",
        description: `Você é agora responsável pelo processo ${protocolNumber || processId}.`
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao aceitar responsabilidade:", error);
      toast({
        title: "Erro",
        description: "Não foi possível aceitar a responsabilidade pelo processo.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsAccepting(false);
    }
  }, [user, toast, queueProcessForLoading]);
  
  return {
    // Estado
    isAccepting,
    
    // Verificação de responsabilidade (do batch loader)
    hasResponsibleForSector,
    isUserResponsibleForSector,
    
    // Ações de responsabilidade
    acceptProcessResponsibility,
    
    // Busca de responsáveis específicos (quando necessário)
    getProcessResponsible,
    getSectorResponsible,
    
    // Para compatibilidade com código existente
    getBulkResponsibles: useCallback(async () => {
      console.warn('getBulkResponsibles está obsoleto, use o hook useResponsibleBatchLoader');
      return {};
    }, [])
  };
};
