import { useState, useEffect, useCallback, useRef } from "react";
import { ProcessResponsible } from "./process-responsibility/types";
import { Department } from "@/types";
import { useProcessResponsibleBatchLoader } from "./process-responsibility/useProcessResponsibleBatchLoader";

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
  const { loadProcessResponsibleBatch, loadSectorResponsibleBatch } = useProcessResponsibleBatchLoader();
  
  const loadedRef = useRef(false);
  const loadingInProgressRef = useRef(false);
  
  const loadResponsibles = useCallback(async () => {
    if (!processId || departments.length === 0 || loadingInProgressRef.current) {
      return;
    }
    
    loadingInProgressRef.current = true;
    setIsLoading(true);
    
    try {
      console.log(`Carregando responsáveis para o processo: ${processId}`);
      
      const relevantDepartments = departments.filter(dept => 
        isCurrentDepartment(dept.id) || hasPassedDepartment(dept.id)
      );
      
      if (relevantDepartments.length === 0) {
        setIsLoading(false);
        loadingInProgressRef.current = false;
        return;
      }
      
      const processResponsibles = await loadProcessResponsibleBatch([processId]);
      const procResp = processResponsibles[processId];
      setProcessResponsible(procResp);
      
      const sectorItems = relevantDepartments.map(dept => ({
        processId,
        sectorId: dept.id
      }));
      
      const sectorResponsibles = await loadSectorResponsibleBatch(sectorItems);
      
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

  useEffect(() => {
    if (processId && !loadedRef.current) {
      loadResponsibles();
    }
    
    return () => {
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
