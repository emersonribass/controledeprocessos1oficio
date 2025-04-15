
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";

export const useProcessFetcher = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchProcessesData = async () => {
    try {
      if (!user) {
        console.error("Tentativa de buscar processos sem usuário autenticado");
        return [];
      }
      
      setIsLoading(true);
      
      console.log(`Buscando processos para usuário: ${user.id}`);
      
      // Buscar processos - as políticas RLS vão filtrar automaticamente no banco de dados
      const { data: processesData, error: processesError } = await supabase
        .from('processos')
        .select(`
          *,
          processos_historico(*)
        `);

      if (processesError) {
        console.error('Erro ao buscar processos:', processesError);
        throw processesError;
      }

      if (!processesData) {
        console.warn('Nenhum processo encontrado ou acesso negado');
        return [];
      }

      console.log(`Processos filtrados pelo RLS: ${processesData.length}`);
      if (processesData.length > 0) {
        console.log('Amostra de protocolo:', processesData[0].numero_protocolo);
      }

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
