
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
