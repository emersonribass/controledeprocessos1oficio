
/**
 * Interface para dados de responsabilidade em processos
 */
export interface ProcessResponsibilityState {
  isAssigning: boolean;
  isAccepting: boolean;
}

/**
 * Interface para as funcionalidades de responsabilidade em processos
 */
export interface ProcessResponsibilityActions {
  assignResponsible: (processId: string, userId: string) => Promise<boolean>;
  acceptProcessResponsibility: (processId: string, protocolNumber: string) => Promise<boolean>;
}

/**
 * Interface para verificações de responsabilidade
 */
export interface ProcessResponsibilityVerification {
  isUserResponsibleForProcess: (process: any, userId?: string) => boolean;
  isUserResponsibleForSector: (processId: string, sectorId: string, userId?: string) => Promise<boolean>;
}

/**
 * Interface para busca de responsáveis
 */
export interface ProcessResponsibleFetching {
  getProcessResponsible: (processId: string) => Promise<any>;
  getSectorResponsible: (processId: string, sectorId: string) => Promise<any>;
  preloadResponsibles: (processes: any[]) => Promise<void>;
}

/**
 * Interface principal do hook useProcessResponsibility
 */
export interface ProcessResponsibility extends 
  ProcessResponsibilityState, 
  ProcessResponsibilityActions,
  ProcessResponsibilityVerification,
  ProcessResponsibleFetching {}
