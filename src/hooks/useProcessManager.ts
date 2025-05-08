
import { useState, useEffect, useCallback } from "react";
import { Process, User } from "@/types";
import { processDataService } from "@/services/ProcessDataService";
import ProcessMovementService from "@/services/ProcessMovementService";
import { useProcessAccessControl } from "./process/useProcessAccessControl";
import { useAuth } from "@/hooks/auth";
import { useProcesses } from "@/hooks/useProcesses";
import { createLogger } from "@/utils/loggerUtils";

const logger = createLogger("ProcessManager");

export const useProcessManager = (processes: Process[] = []) => {
  const { user } = useAuth();
  const { refreshProcesses } = useProcesses();
  const [processesResponsibles, setProcessesResponsibles] = useState<Record<string, Record<string, any>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const accessControl = useProcessAccessControl();
  
  // Carregar responsáveis para todos os processos em lote
  const loadAllResponsibles = useCallback(async () => {
    if (!processes.length) return;
    
    setIsLoading(true);
    try {
      const responsibles = await processDataService.batchFetchResponsibles(processes);
      setProcessesResponsibles(responsibles);
    } catch (error) {
      console.error("Erro ao carregar responsáveis em lote:", error);
    } finally {
      setIsLoading(false);
    }
  }, [processes]);
  
  useEffect(() => {
    loadAllResponsibles();
    
    // Limpar cache expirado a cada 5 minutos
    const interval = setInterval(() => {
      processDataService.cleanExpiredCache();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [loadAllResponsibles]);
  
  // Verificar se um processo tem responsável em um setor específico
  const hasSectorResponsible = useCallback((processId: string, sectorId: string): boolean => {
    return !!(processesResponsibles[processId] && processesResponsibles[processId][sectorId]);
  }, [processesResponsibles]);
  
  // Mover processo para o próximo departamento
  const moveToNextDepartment = useCallback(async (processId: string): Promise<boolean> => {
    if (!user) return false;
    // Correção aqui: adicionando o terceiro parâmetro necessário (motivo)
    const success = await ProcessMovementService.moveToNextDepartment(processId, user.id, "");
    if (success) {
      await refreshProcesses();
      await loadAllResponsibles();
    }
    return success;
  }, [refreshProcesses, loadAllResponsibles, user]);
  
  // Mover processo para o departamento anterior
  const moveToPreviousDepartment = useCallback(async (processId: string): Promise<boolean> => {
    if (!user) return false;
    // Correção aqui: adicionando o terceiro parâmetro necessário (motivo)
    const success = await ProcessMovementService.moveToPreviousDepartment(processId, user.id, "");
    if (success) {
      await refreshProcesses();
      await loadAllResponsibles();
    }
    return success;
  }, [refreshProcesses, loadAllResponsibles, user]);
  
  // Iniciar um processo
  const startProcess = useCallback(async (processId: string): Promise<boolean> => {
    if (!user) return false;
    
    const success = await ProcessMovementService.startProcess(processId, user.id);
    if (success) {
      await refreshProcesses();
      await loadAllResponsibles();
    }
    return success;
  }, [user, refreshProcesses, loadAllResponsibles]);
  
  // Aceitar responsabilidade por um processo
  const acceptResponsibility = useCallback(async (processId: string, sectorId: string): Promise<boolean> => {
    if (!user) return false;
    
    logger.debug(`Aceitando responsabilidade pelo processo ${processId} no setor ${sectorId}`);
    
    const success = await ProcessMovementService.acceptResponsibility(processId, sectorId, user.id);
    if (success) {
      await loadAllResponsibles();
    }
    return success;
  }, [user, loadAllResponsibles]);
  
  // Filtrar processos baseado em permissões de acesso
  const filterProcessesByAccess = useCallback(async (processesToFilter: Process[]): Promise<Process[]> => {
    if (!user) return [];
    
    const filtered = await Promise.all(
      processesToFilter.map(async (process) => {
        const canView = accessControl.canViewProcess(process, user.id);
        return canView ? process : null;
      })
    );
    
    return filtered.filter((p): p is Process => p !== null);
  }, [user, accessControl]);
  
  return {
    processesResponsibles,
    isLoading,
    hasSectorResponsible,
    moveToNextDepartment,
    moveToPreviousDepartment,
    startProcess,
    acceptResponsibility,
    filterProcessesByAccess,
    canViewProcess: accessControl.canViewProcess,
    canAcceptProcess: accessControl.canAcceptProcess,
    canStartProcess: accessControl.canStartProcess,
    isUserProcessOwner: accessControl.isProcessOwner,
    isUserInCurrentSector: accessControl.isUserInCurrentSector,
    refreshResponsibles: loadAllResponsibles
  };
};
