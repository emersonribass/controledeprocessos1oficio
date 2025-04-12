
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { useSupabase } from "@/hooks/useSupabase";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";

export const useProcessResponsibility = () => {
  const [isAssigning, setIsAssigning] = useState<boolean>(false);
  const [isAccepting, setIsAccepting] = useState<boolean>(false);
  const { toast: uiToast } = useToast();
  const { user } = useAuth();

  /**
   * Atribui um usuário como responsável por um processo
   */
  const assignResponsible = async (processId: string, userId: string) => {
    if (!userId) {
      uiToast({
        title: "Erro",
        description: "ID do usuário não informado.",
        variant: "destructive",
      });
      return false;
    }

    setIsAssigning(true);

    try {
      const { error } = await supabase
        .from('processos')
        .update({ usuario_responsavel: userId })
        .eq('id', processId);

      if (error) {
        throw error;
      }

      toast.success("Responsável atribuído com sucesso!");
      return true;
    } catch (error) {
      console.error("Erro ao atribuir responsável:", error);
      uiToast({
        title: "Erro",
        description: "Não foi possível atribuir o responsável.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsAssigning(false);
    }
  };

  /**
   * Aceita a responsabilidade por um processo em um setor
   */
  const acceptProcessResponsibility = async (processId: string, protocolNumber: string) => {
    if (!user) {
      uiToast({
        title: "Erro",
        description: "Você precisa estar logado para aceitar processos.",
        variant: "destructive",
      });
      return false;
    }

    setIsAccepting(true);

    try {
      // Verificar se o processo já tem um responsável no setor atual
      const { data: processData, error: processError } = await supabase
        .from('processos')
        .select('*')
        .eq('id', processId)
        .single();

      if (processError) {
        throw processError;
      }

      if (!processData) {
        throw new Error("Processo não encontrado");
      }

      // Obter o departamento atual do processo
      const currentDepartmentId = processData.setor_atual;
      
      // Verificar se já existe um responsável para este setor
      const { data: existingResponsibles, error: responsibleError } = await supabase
        .from('setor_responsaveis')
        .select('*')
        .eq('processo_id', processId)
        .eq('setor_id', currentDepartmentId);

      if (responsibleError) {
        throw responsibleError;
      }

      const existingResponsible = existingResponsibles && existingResponsibles.length > 0 ? existingResponsibles[0] : null;

      if (existingResponsible) {
        // Se o usuário atual já é o responsável, apenas retornar
        if (existingResponsible.usuario_id === user.id) {
          uiToast({
            title: "Informação",
            description: "Você já é o responsável por este processo neste setor.",
          });
          return true;
        }
        
        // Se outro usuário é responsável, atualizar
        const { error: updateError } = await supabase
          .from('setor_responsaveis')
          .update({ 
            usuario_id: user.id,
            data_atribuicao: new Date().toISOString()
          })
          .eq('id', existingResponsible.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        // Se não existe responsável, criar novo
        const { error: insertError } = await supabase
          .from('setor_responsaveis')
          .insert({ 
            processo_id: processId,
            setor_id: currentDepartmentId,
            usuario_id: user.id,
            data_atribuicao: new Date().toISOString()
          });

        if (insertError) {
          throw insertError;
        }
      }

      // Marcar notificações como respondidas
      const { error: notificationError } = await supabase
        .from('notificacoes')
        .update({ respondida: true })
        .eq('processo_id', processId)
        .eq('usuario_id', user.id)
        .eq('tipo', 'processo_movido');

      if (notificationError) {
        console.error("Erro ao atualizar notificações:", notificationError);
      }

      toast.success(`Você aceitou a responsabilidade pelo processo ${protocolNumber} neste setor.`);
      return true;
    } catch (error) {
      console.error("Erro ao aceitar processo:", error);
      uiToast({
        title: "Erro",
        description: "Não foi possível aceitar o processo.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsAccepting(false);
    }
  };

  /**
   * Verifica se um usuário específico é responsável por um processo
   */
  const isUserResponsibleForProcess = async (processId: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('processos')
        .select('usuario_responsavel')
        .eq('id', processId)
        .single();

      if (error) {
        throw error;
      }

      return data && data.usuario_responsavel === userId;
    } catch (error) {
      console.error("Erro ao verificar responsabilidade pelo processo:", error);
      return false;
    }
  };

  /**
   * Verifica se um usuário é responsável por um processo em um setor específico
   */
  const isUserResponsibleForSector = async (processId: string, sectorId: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('setor_responsaveis')
        .select('*')
        .eq('processo_id', processId)
        .eq('setor_id', sectorId)
        .eq('usuario_id', userId);

      if (error) {
        throw error;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error("Erro ao verificar responsabilidade pelo setor:", error);
      return false;
    }
  };

  /**
   * Obtém o usuário responsável pelo processo
   */
  const getProcessResponsible = async (processId: string) => {
    try {
      const { data: process, error: processError } = await supabase
        .from('processos')
        .select('usuario_responsavel')
        .eq('id', processId)
        .single();

      if (processError) {
        throw processError;
      }

      if (!process || !process.usuario_responsavel) {
        return null;
      }

      const { data: user, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', process.usuario_responsavel)
        .single();

      if (userError) {
        throw userError;
      }

      return user;
    } catch (error) {
      console.error("Erro ao obter responsável pelo processo:", error);
      return null;
    }
  };

  /**
   * Obtém o usuário responsável pelo processo em um setor específico
   */
  const getSectorResponsible = async (processId: string, sectorId: string) => {
    try {
      const { data, error } = await supabase
        .from('setor_responsaveis')
        .select('usuario_id')
        .eq('processo_id', processId)
        .eq('setor_id', sectorId);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return null;
      }

      const { data: user, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', data[0].usuario_id)
        .single();

      if (userError) {
        throw userError;
      }

      return user;
    } catch (error) {
      console.error("Erro ao obter responsável pelo setor:", error);
      return null;
    }
  };

  return {
    isAssigning,
    isAccepting,
    assignResponsible,
    acceptProcessResponsibility,
    isUserResponsibleForProcess,
    isUserResponsibleForSector,
    getProcessResponsible,
    getSectorResponsible
  };
};
