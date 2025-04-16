
import { Process } from "@/types";
import { useProcessMovement } from "@/hooks/useProcessMovement";
import { useProcessUpdate } from "@/hooks/useProcessUpdate";
import { supabaseService } from "@/services/supabase";
import { useAuth } from "@/hooks/auth";
import { toast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/auth/useUserProfile";

/**
 * Hook que centraliza operações de processos: movimentação, atualização e busca individual
 */
export const useProcessOperations = (onProcessUpdated: () => void) => {
  const { user } = useAuth();
  const { userProfile, isAdmin } = useUserProfile();
  
  // Operações de movimentação
  const { 
    moveProcessToNextDepartment, 
    moveProcessToPreviousDepartment, 
    startProcess,
    deleteProcess,
    deleteManyProcesses,
    isMoving,
    isStarting
  } = useProcessMovement(onProcessUpdated);

  // Operações de atualização
  const { 
    updateProcessType,
    updateProcessStatus
  } = useProcessUpdate();

  // Busca um processo específico
  const getProcess = async (processId: string): Promise<Process | null> => {
    try {
      // Verificar se o usuário está autenticado
      if (!user) {
        console.error("Usuário não autenticado ao tentar acessar processo");
        toast({
          title: "Acesso negado",
          description: "Você precisa estar autenticado para acessar este processo",
          variant: "destructive"
        });
        throw new Error("Usuário não autenticado");
      }
      
      console.log(`Buscando processo ${processId} para usuário ${user.id}`);
      console.log(`Perfil do usuário: ${userProfile?.perfil}, Setores: ${JSON.stringify(userProfile?.setores_atribuidos)}`);
      
      // Primeiro verifica explicitamente se o usuário tem acesso ao processo
      const hasAccess = await checkProcessAccess(processId);
      
      if (!hasAccess) {
        console.warn(`Processo ${processId} - acesso negado para usuário ${user.id}`);
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para visualizar este processo",
          variant: "destructive"
        });
        return null;
      }
      
      // Se tem acesso, busca os dados completos
      const { data, error } = await supabaseService.getProcess(processId);
        
      if (error) {
        console.error(`Erro ao buscar processo: ${error.message}`);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do processo",
          variant: "destructive"
        });
        throw error;
      }
      
      if (!data) {
        console.warn(`Processo ${processId} não encontrado ou acesso negado para usuário ${user.id}`);
        toast({
          title: "Processo não encontrado",
          description: "O processo solicitado não existe ou você não tem permissão para visualizá-lo",
          variant: "destructive"
        });
        return null;
      }
      
      console.log(`Processo encontrado: ${data.numero_protocolo}, Setor atual: ${data.setor_atual}, Responsável: ${data.usuario_responsavel}`);
      
      const formattedProcess: Process = {
        id: data.id,
        protocolNumber: data.numero_protocolo,
        processType: data.tipo_processo,
        currentDepartment: data.setor_atual,
        startDate: data.data_inicio || new Date().toISOString(),
        expectedEndDate: data.data_fim_esperada || new Date().toISOString(),
        status: data.status === 'Em andamento' 
          ? 'pending' 
          : data.status === 'Concluído' 
            ? 'completed' 
            : 'not_started',
        history: data.processos_historico.map((h: any) => ({
          departmentId: h.setor_id,
          entryDate: h.data_entrada,
          exitDate: h.data_saida,
          userId: h.usuario_id || '',
        })),
        userId: data.usuario_responsavel,
        responsibleUserId: data.usuario_responsavel,
      };
      
      return formattedProcess;
    } catch (error) {
      console.error('Erro ao buscar processo:', error);
      return null;
    }
  };

  // Verificar se o usuário tem acesso a um processo específico
  const checkProcessAccess = async (processId: string): Promise<boolean> => {
    try {
      if (!user) return false;
      
      // Administradores têm acesso a todos os processos
      if (isAdmin()) {
        console.log(`Usuário ${user.id} é administrador - acesso garantido ao processo ${processId}`);
        return true;
      }
      
      // Se é do setor de atendimento, verificar se o processo está "não iniciado"
      if (userProfile?.setores_atribuidos?.includes("1")) {
        const { data } = await supabaseService.checkProcessNotStarted(processId);
        if (data && data.status === 'Não iniciado') {
          console.log(`Usuário ${user.id} é do setor de atendimento e processo está não iniciado - acesso garantido`);
          return true;
        }
      }
      
      // Se tem perfil usuário, verificar se é responsável ou pertence ao setor atual
      if (userProfile?.perfil === 'usuario') {
        const { data: processo } = await supabaseService.getProcessBasicInfo(processId);
        
        if (!processo) {
          console.warn(`Processo ${processId} não encontrado para verificação de acesso`);
          return false;
        }
        
        // Verificar se é responsável pelo processo
        if (processo.usuario_responsavel === user.id) {
          console.log(`Usuário ${user.id} é responsável pelo processo ${processId} - acesso garantido`);
          return true;
        }
        
        // Verificar se pertence ao setor atual do processo
        if (userProfile.setores_atribuidos?.includes(processo.setor_atual)) {
          console.log(`Usuário ${user.id} pertence ao setor ${processo.setor_atual} do processo ${processId} - acesso garantido`);
          return true;
        }
        
        console.warn(`Usuário ${user.id} com perfil 'usuario' não tem acesso ao processo ${processId}`);
        return false;
      }
      
      // Para outros perfis, usar o serviço que respeita as RLS policies para verificar acesso
      const hasAccess = await supabaseService.checkProcessAccess(processId);
      
      if (hasAccess) {
        console.log(`Acesso concedido ao processo ${processId} para usuário ${user.id}`);
      } else {
        console.warn(`Acesso negado ao processo ${processId} para usuário ${user.id}`);
      }
      
      return hasAccess;
    } catch (error) {
      console.error('Erro ao verificar acesso ao processo:', error);
      return false;
    }
  };

  return {
    // Operações de movimentação
    moveProcessToNextDepartment,
    moveProcessToPreviousDepartment,
    startProcess,
    deleteProcess,
    deleteManyProcesses,
    
    // Operações de atualização
    updateProcessType,
    updateProcessStatus,
    
    // Busca individual e verificação de acesso
    getProcess,
    checkProcessAccess,
    
    // Estados
    isMoving,
    isStarting
  };
};
