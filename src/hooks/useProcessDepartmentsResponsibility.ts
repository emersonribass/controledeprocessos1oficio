
import { useState, useEffect, useCallback, useRef } from "react";
import { ProcessResponsible } from "./process-responsibility/types";
import { Department } from "@/types";
import { useProcessResponsibilityBatchLoader } from "./process-responsibility/useProcessResponsibleBatchLoader";

/**
 * Hook para gerenciar responsáveis por departamentos em um processo
 * Implementa carregamento eficiente com cache e requisições em lote
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
  const { loadProcessResponsibleBatch, loadSectorResponsibleBatch } = useProcessResponsibilityBatchLoader();
  
  // Referências para controlar se os dados já foram carregados
  const loadedRef = useRef(false);
  const loadingInProgressRef = useRef(false);
  
  // Função para carregar responsáveis em lote para melhor desempenho
  const loadResponsibles = useCallback(async () => {
    if (!processId || departments.length === 0 || loadingInProgressRef.current) {
      return;
    }
    
    // Evitar múltiplas chamadas simultâneas
    loadingInProgressRef.current = true;
    setIsLoading(true);
    
    try {
      console.log(`Carregando responsáveis para o processo: ${processId}`);
      
      // Filtrar apenas departamentos relevantes (atuais ou já passados)
      // para otimizar o número de requisições
      const relevantDepartments = departments.filter(dept => 
        isCurrentDepartment(dept.id) || hasPassedDepartment(dept.id)
      );
      
      if (relevantDepartments.length === 0) {
        setIsLoading(false);
        loadingInProgressRef.current = false;
        return;
      }
      
      // Carregar o responsável do processo
      const processResponsibles = await loadProcessResponsibleBatch([processId]);
      const procResp = processResponsibles[processId];
      setProcessResponsible(procResp);
      
      // Preparar dados para carregamento em lote dos responsáveis de setores
      const sectorItems = relevantDepartments.map(dept => ({
        processId,
        sectorId: dept.id
      }));
      
      // Carregar responsáveis de setores em lote
      const sectorResponsibles = await loadSectorResponsibleBatch(sectorItems);
      
      // Converter o resultado para o formato esperado pelo estado
      const deptResps = relevantDepartments.reduce<Record<string, ProcessResponsible | null>>(
        (acc, dept) => {
          const key = `${processId}-${dept.id}`;
          acc[dept.id] = sectorResponsibles[key] || null;
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
  }, [processId, departments, loadProcessResponsibleBatch, loadSectorResponsibleBatch, isCurrentDepartment, hasPassedDepartment]);

  // Carregar responsáveis ao inicializar o componente ou quando o ID do processo muda
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
