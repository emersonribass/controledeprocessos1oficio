
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/schema";

/**
 * Hook otimizado para buscar processos com responsáveis em uma única consulta
 */
export const useProcessFetcher = () => {
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Busca processos e informações relacionadas em uma única consulta
   * Otimizado para reduzir o número de requisições ao servidor
   */
  const fetchProcessesData = async () => {
    try {
      setIsLoading(true);
      
      // Buscar todos os setores uma única vez
      const { data: departmentsData, error: departmentsError } = await supabase
        .from('setores')
        .select('*');

      if (departmentsError) {
        throw departmentsError;
      }
      
      // Consulta principal - buscar processos com histórico em uma única requisição
      const { data: processesData, error: processesError } = await supabase
        .from('processos')
        .select(`
          *,
          processos_historico(*),
          usuarios!processos_usuario_responsavel_fkey(
            id,
            nome,
            email
          )
        `)
        .order('updated_at', { ascending: false });

      if (processesError) {
        throw processesError;
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

      // Buscar responsáveis de setor para processos em andamento em uma única requisição
      const startedProcessIds = processesData
        .filter((p: any) => p.status !== 'Não iniciado')
        .map((p: any) => p.id);

      // Inicializar uma estrutura vazia de responsáveis para todos os processos
      processesWithDepartments.forEach((process: any) => {
        process.responsibles = {};
      });

      if (startedProcessIds.length > 0) {
        const { data: sectorResponsibles, error: sectorsError } = await supabase
          .from('setor_responsaveis')
          .select(`
            processo_id,
            setor_id,
            usuario_id,
            usuarios:usuario_id(
              id,
              nome,
              email
            )
          `)
          .in('processo_id', startedProcessIds);

        if (!sectorsError && sectorResponsibles) {
          // Mapear responsáveis por processo e setor para uso posterior
          sectorResponsibles.forEach((resp) => {
            const processId = resp.processo_id;
            const sectorId = resp.setor_id;
            const process = processesWithDepartments.find((p: any) => p.id === processId);
            
            if (process) {
              if (!process.responsibles) {
                process.responsibles = {};
              }
              
              process.responsibles[sectorId] = resp.usuarios;
            }
          });
        }
      }

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
