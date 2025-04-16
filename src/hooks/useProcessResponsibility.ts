
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/hooks/use-toast";

export const useProcessResponsibility = () => {
  const [isAccepting, setIsAccepting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  /**
   * Verifica se o usuário atual é responsável por um processo em um setor específico
   */
  const isUserResponsibleForSector = useCallback(async (
    processId: string, 
    sectorId: string
  ): Promise<boolean> => {
    if (!user) return false;
    
    try {
      console.log(`Verificando responsabilidade para processo ${processId} no setor ${sectorId}`);
      
      const { data, error } = await supabase
        .from('setor_responsaveis')
        .select('*')
        .eq('processo_id', processId)
        .eq('setor_id', sectorId)
        .eq('usuario_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Erro ao verificar responsabilidade:", error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error("Erro ao verificar responsabilidade:", error);
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
      // Primeiro, buscar o setor atual do processo
      const { data: process, error: processError } = await supabase
        .from('processos')
        .select('setor_atual')
        .eq('id', processId)
        .single();
      
      if (processError) {
        console.error("Erro ao buscar processo:", processError);
        throw processError;
      }
      
      if (!process) {
        throw new Error("Processo não encontrado");
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
  
  /**
   * Busca o responsável principal de um processo
   */
  const getProcessResponsible = useCallback(async (processId: string) => {
    if (!user) return null;
    
    try {
      // Buscar o processo para obter o ID do responsável
      const { data: process, error: processError } = await supabase
        .from('processos')
        .select('usuario_responsavel')
        .eq('id', processId)
        .maybeSingle();
      
      if (processError) {
        console.error("Erro ao buscar processo:", processError);
        return null;
      }
      
      if (!process || !process.usuario_responsavel) {
        return null;
      }
      
      // Buscar dados do usuário responsável
      const { data: responsibleUser, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', process.usuario_responsavel)
        .maybeSingle();
      
      if (userError) {
        console.error("Erro ao buscar usuário responsável:", userError);
        return null;
      }
      
      return responsibleUser;
    } catch (error) {
      console.error("Erro ao buscar responsável do processo:", error);
      return null;
    }
  }, [user]);

  /**
   * Busca o responsável de um processo em um setor específico
   */
  const getSectorResponsible = useCallback(async (processId: string, sectorId: string) => {
    if (!user) return null;
    
    try {
      // Buscar o responsável do setor
      const { data, error } = await supabase
        .from('setor_responsaveis')
        .select('usuario_id')
        .eq('processo_id', processId)
        .eq('setor_id', sectorId)
        .maybeSingle();
      
      if (error) {
        console.error("Erro ao buscar responsável do setor:", error);
        return null;
      }
      
      if (!data || !data.usuario_id) {
        return null;
      }
      
      // Buscar dados do usuário responsável
      const { data: responsibleUser, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', data.usuario_id)
        .maybeSingle();
      
      if (userError) {
        console.error("Erro ao buscar usuário responsável pelo setor:", userError);
        return null;
      }
      
      return responsibleUser;
    } catch (error) {
      console.error("Erro ao buscar responsável do setor:", error);
      return null;
    }
  }, [user]);
  
  return {
    isUserResponsibleForSector,
    acceptProcessResponsibility,
    isAccepting,
    getProcessResponsible,
    getSectorResponsible
  };
};
