
// Definição das interfaces para responsabilidade de processos

export interface ProcessResponsible {
  id: string;
  nome: string;
  email: string;
}

export interface ProcessResponsibilityState {
  isAssigning: boolean;
  isAccepting: boolean;
}

export interface ResponsibilityUserData {
  id: string;
  nome?: string;
  email?: string;
  avatar?: string;
}

// Interface que define o retorno do hook useProcessResponsibility
export interface ProcessResponsibility {
  // Estados
  isAssigning: boolean;
  isAccepting: boolean;
  
  // Atribuição
  assignResponsible: (processId: string, userId: string) => Promise<boolean>;
  
  // Aceitação
  acceptProcessResponsibility: (processId: string, protocolNumber: string, showToast?: boolean) => Promise<boolean>;
  
  // Verificação
  isUserResponsibleForProcess: (processId: string) => boolean;
  isUserResponsibleForSector: (processId: string, sectorId: string) => boolean;
  
  // Busca de responsáveis
  getProcessResponsible: (processId: string) => Promise<ProcessResponsible | null>;
  getSectorResponsible: (processId: string, sectorId: string) => Promise<ProcessResponsible | null>;
  preloadResponsibles?: (processIds: string[]) => Promise<void>;
}
