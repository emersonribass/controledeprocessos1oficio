
import { useState, useEffect, useCallback, useRef } from "react";
import { useProcessResponsibility } from "./useProcessResponsibility";
import { ProcessResponsible } from "./process-responsibility/types";
import { Department } from "@/types";

/**
 * Hook para gerenciar responsáveis por departamentos em um processo
 * Utiliza a mesma estratégia de cache e paralelismo do useProcessDetailsResponsibility
 */
export const useProcessDepartmentsResponsibility = (
  processId: string,
  departments: Department[],
  isCurrentDepartment: (deptId: string) => boolean,
  hasPassedDepartment: (deptId: string) => boolean
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [processResponsible, setProcessResponsible] = useState<ProcessResponsible | null>(null);
  const [departmentResponsibles, setDepartmentResponsibles] = useState<Record<string, ProcessResponsible | null>>({});
  const { getProcessResponsible, getSectorResponsible } = useProcessResponsibility();
  
  // Referências para controlar se os dados já foram carregados
  const loadedRef = useRef(false);
  const loadingInProgressRef = useRef(false);
  
  // Função para carregar responsáveis de forma eficiente
  const loadResponsibles = useCallback(async () => {
    if (!processId || departments.length === 0 || loadingInProgressRef.current) {
      return;
    }
    
    // Evitar múltiplas chamadas simultâneas
    loadingInProgressRef.current = true;
    setIsLoading(true);
    
    try {
      console.log(`Carregando responsáveis para o processo: ${processId}`);
      
      // Buscar apenas departamentos relevantes (atuais ou já passados)
      const relevantDepartments = departments.filter(dept => 
        isCurrentDepartment(dept.id) || hasPassedDepartment(dept.id)
      );
      
      if (relevantDepartments.length === 0) {
        setIsLoading(false);
        loadingInProgressRef.current = false;
        return;
      }
      
      // Executar consultas em paralelo usando Promise.all
      const promises = [
        getProcessResponsible(processId),
        ...relevantDepartments.map(dept => 
          getSectorResponsible(processId, dept.id)
            .then(resp => ({ deptId: dept.id, responsible: resp }))
            .catch(() => ({ deptId: dept.id, responsible: null }))
        )
      ];
      
      const results = await Promise.all(promises);
      
      // Processar os resultados - corrigindo o problema de tipo aqui
      // O primeiro resultado é o responsável pelo processo
      const processResp = results[0] as ProcessResponsible | null;
      setProcessResponsible(processResp);
      
      // Os resultados restantes são responsáveis por departamento
      const deptResults = results.slice(1) as Array<{ deptId: string, responsible: ProcessResponsible | null }>;
      
      // Converter array de respostas para um objeto indexado por ID do departamento
      const deptResps = deptResults.reduce<Record<string, ProcessResponsible | null>>(
        (acc, item) => {
          if (item && 'deptId' in item) {
            acc[item.deptId] = item.responsible;
          }
          return acc;
        }, 
        {}
      );
      
      setDepartmentResponsibles(deptResps);
      loadedRef.current = true;
    } catch (error) {
      console.error("Erro ao carregar responsáveis de departamentos:", error);
    } finally {
      setIsLoading(false);
      loadingInProgressRef.current = false;
    }
  }, [processId, departments, getProcessResponsible, getSectorResponsible, isCurrentDepartment, hasPassedDepartment]);

  // Carregar responsáveis ao inicializar o componente
  useEffect(() => {
    if (processId && !loadedRef.current) {
      loadResponsibles();
    }
    
    return () => {
      // Limpar referências quando o componente é desmontado
      loadedRef.current = false;
    };
  }, [loadResponsibles, processId]);

  return {
    isLoading,
    processResponsible,
    departmentResponsibles,
    refreshResponsibles: loadResponsibles
  };
};
