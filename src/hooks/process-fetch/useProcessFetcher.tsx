
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useProcessFetcher = () => {
  const [isLoading, setIsLoading] = useState(true);

  const fetchProcessesData = async () => {
    try {
      setIsLoading(true);
      
      // Buscar processos com seus históricos
      const { data: processesData, error: processesError } = await supabase
        .from('processos')
        .select(`
          *,
          processos_historico(*)
        `);

      if (processesError) {
        throw processesError;
      }

      // Buscar todos os setores separadamente para obter os limites de tempo
      const { data: departmentsData, error: departmentsError } = await supabase
        .from('setores')
        .select('*');

      if (departmentsError) {
        throw departmentsError;
      }

      // Combinar os dados dos processos com informações detalhadas dos setores
      const processesWithDepartments = processesData.map(process => {
        // Encontrar o setor atual do processo
        const currentDept = departmentsData.find(
          dept => dept.id.toString() === process.setor_atual
        );
        
        // Encontrar a entrada mais recente do histórico para o setor atual
        const currentDeptHistory = process.processos_historico?.find(
          h => h.setor_id === process.setor_atual && h.data_saida === null
        );

        // Verificar se o prazo do departamento está expirado
        let isDepartmentOverdue = false;
        if (currentDept && currentDeptHistory && process.status === "Em andamento") {
          const entryDate = new Date(currentDeptHistory.data_entrada);
          const departmentTimeLimit = currentDept.time_limit || 0;
          
          if (departmentTimeLimit > 0) {
            // Calcular a data limite para o departamento atual
            const deptDeadline = new Date(entryDate);
            deptDeadline.setDate(deptDeadline.getDate() + departmentTimeLimit);
            
            // Verificar se ultrapassou o prazo do departamento
            if (new Date() > deptDeadline) {
              isDepartmentOverdue = true;
            }
          }
        }
        
        // Retornar o processo com as informações do setor e status de prazo
        return {
          ...process,
          setor_info: currentDept || null,
          is_department_overdue: isDepartmentOverdue
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
