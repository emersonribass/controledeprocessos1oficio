
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/hooks/use-toast";
import { useProcessResponsibleFetching } from "./process-responsibility/useProcessResponsibleFetching";

export const useProcessResponsibility = () => {
  const [isAccepting, setIsAccepting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { getProcessResponsible, getSectorResponsible } = useProcessResponsibleFetching();
  
  /**
   * Verifica se o usuário atual é responsável por um processo em um setor específico
   */
  const isUserResponsibleForSector = useCallback(async (
    processId: string, 
    sectorId: string
  ): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Otimizado para verificar apenas o processo e setor específicos
      const { data, error } = await supabase
        .from('setor_responsaveis')
        .select('*')
        .eq('processo_id', processId)
        .eq('setor_id', sectorId)
        .eq('usuario_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error(`Erro ao verificar responsabilidade para processo ${processId}, setor ${sectorId}:`, error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error(`Erro ao verificar responsabilidade para processo ${processId}, setor ${sectorId}:`, error);
      return false;
    }
  }, [user]);
  
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
        .select('setor_atual')
        .eq('id', processId)
        .single();
      
      if (processError) {
        console.error(`Erro ao buscar processo ${processId}:`, processError);
        throw processError;
      }
      
      if (!process) {
        throw new Error(`Processo ${processId} não encontrado`);
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
      
      console.log("Perfil do usuário carregado:", userProfile);
      
      const userSectors = userProfile?.setores_atribuidos || [];
      
      if (!userSectors.includes(currentSectorId)) {
        toast({
          title: "Erro",
          description: "Você não pertence ao setor atual deste processo.",
          variant: "destructive"
        });
        return false;
      }
      
      console.log("Usuário pertence ao setor, verificando se já existe um responsável");
      
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
        console.log("Usuário já é responsável por este processo neste setor");
        toast({
          title: "Informação",
          description: "Você já é responsável por este processo."
        });
        return true;
      }
      
      // Se existe outro responsável, não podemos aceitar
      if (existingResponsible) {
        console.log("Já existe outro responsável para este processo neste setor");
        toast({
          title: "Erro",
          description: "Este processo já possui um responsável neste setor.",
          variant: "destructive"
        });
        return false;
      }
      
      console.log("Nenhum responsável encontrado, atribuindo responsabilidade ao usuário atual");
      
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
      
      console.log("Responsabilidade atribuída com sucesso");
      
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
        // Não é crítico, podemos continuar
      } else {
        console.log("Responsável principal do processo atualizado");
      }
      
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
  }, [user, toast]);
  
  return {
    isUserResponsibleForSector,
    acceptProcessResponsibility,
    isAccepting,
    getProcessResponsible,
    getSectorResponsible
  };
};
