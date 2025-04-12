
export interface ProcessResponsible {
  id: string;
  nome: string;
  email: string;
  [key: string]: any;
}

export interface ProcessResponsibilityState {
  isAssigning: boolean;
  isAccepting: boolean;
}
