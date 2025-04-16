import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";
import { toast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/auth/useUserProfile";

export const useProcessFetcher = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { userProfile, isAdmin } = useUserProfile();

  const fetchProcessesData = async () => {
    try {
      if (!user) {
        console.error("Tentativa de buscar processos sem usuário autenticado");
        toast({
          title: "Acesso negado",
          description: "Você precisa estar autenticado para visualizar processos",
          variant: "destructive"
        });
        return [];
      }
      
      setIsLoading(true);
      
      console.log(`Buscando processos para usuário: ${user.id}`);
      console.log(`Perfil do usuário: ${userProfile?.perfil}, Setores atribuídos: ${JSON.stringify(userProfile?.setores_atribuidos)}`);
      
      let query = supabase
        .from('processos')
        .select(`
          *,
          processos_historico(*)
        `);
      
      // Se não for admin e tiver perfil "usuario", aplicar filtros específicos
      if (!isAdmin() && userProfile?.perfil === 'usuario') {
        console.log("Aplicando filtros específicos para usuários com perfil 'usuario'");
        
        // Usuário é do setor de atendimento?
        const isInAttendanceSector = userProfile.setores_atribuidos?.includes("1") || false;
        
        if (isInAttendanceSector) {
          console.log("Usuário pertence ao setor de atendimento - incluindo processos não iniciados");
          
          // Se for do setor de atendimento, pode ver seus próprios processos, processos dos setores que pertence,
          // ou processos não iniciados
          query = query.or(`usuario_responsavel.eq.${user.id},status.eq.Não iniciado,setor_atual.in.(${userProfile.setores_atribuidos?.join(',') || ''})`);
        } else {
          console.log("Usuário não pertence ao setor de atendimento - só verá processos próprios ou do setor");
          
          // Se não for do setor de atendimento, só pode ver seus próprios processos ou do setor que pertence
          query = query.or(`usuario_responsavel.eq.${user.id},setor_atual.in.(${userProfile.setores_atribuidos?.join(',') || ''})`);
        }
      } else {
        console.log("Usuário é admin ou tem outro perfil - sem filtros específicos aplicados");
      }

      const { data: processesData, error: processesError } = await query;

      if (processesError) {
        console.error('Erro ao buscar processos:', processesError);
        toast({
          title: "Erro ao carregar processos",
          description: processesError.message,
          variant: "destructive"
        });
        throw processesError;
      }

      if (!processesData) {
        console.warn('Nenhum processo encontrado ou acesso negado');
        return [];
      }

      console.log(`Processos retornados pelo Supabase: ${processesData.length}`);
      
      // Log detalhado dos processos retornados para depuração
      processesData.forEach((process) => {
        console.log(`Processo ID: ${process.id}, Protocolo: ${process.numero_protocolo}, Setor: ${process.setor_atual}, Responsável: ${process.usuario_responsavel}, Status: ${process.status}`);
      });

      // Buscar todos os setores separadamente
      const { data: departmentsData, error: departmentsError } = await supabase
        .from('setores')
        .select('*');

      if (departmentsError) {
        console.error('Erro ao buscar setores:', departmentsError);
        throw departmentsError;
      }

      // Combinar os dados dos processos com os setores correspondentes
      const processesWithDepartments = processesData.map((process: any) => {
        // Encontrar o setor que corresponde ao setor_atual do processo
        const matchingDept = departmentsData.find(
          (dept: any) => dept.id.toString() === process.setor_atual
        );
        
        // Retornar o processo com as informações do setor
        return {
          ...process,
          setor_info: matchingDept || null
        };
      });

      return processesWithDepartments;
    } catch (error) {
      console.error('Erro ao buscar processos:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchProcessesData,
    isLoading,
    setIsLoading
  };
};
