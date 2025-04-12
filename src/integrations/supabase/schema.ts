
export type Tables = {
  setores: {
    id: number;
    name: string;
    order_num: number;
    time_limit: number;
    created_at?: string;
    updated_at?: string;
  };
  usuarios: {
    id: string;
    nome: string;
    email: string;
    senha: string;
    ativo: boolean;
    setores_atribuidos: string[];
    perfil: 'administrador' | 'usuario';
    created_at?: string;
    updated_at?: string;
  };
  processos: {
    id: string;
    numero_protocolo: string;
    tipo_processo: string;
    setor_atual: string;
    data_inicio: string;
    data_fim_esperada: string;
    status: 'Em andamento' | 'Concluído' | 'Não iniciado';
    usuario_responsavel: string | null;
    created_at?: string;
    updated_at?: string;
  };
  processos_historico: {
    id: number;
    processo_id: string;
    setor_id: string;
    data_entrada: string;
    data_saida: string | null;
    usuario_id: string;
    created_at?: string;
    updated_at?: string;
  };
  notificacoes: {
    id: string;
    usuario_id: string;
    processo_id: string | null;
    mensagem: string;
    tipo: string;
    lida: boolean;
    respondida: boolean;
    data_criacao: string;
    created_at?: string;
    updated_at?: string;
  };
  setor_responsaveis: {
    id: string;
    processo_id: string;
    setor_id: string;
    usuario_id: string;
    data_atribuicao: string;
    created_at?: string;
    updated_at?: string;
  };
};

export type Enums = {
  // Adicione os enums do banco de dados aqui, se existirem
};

export type Database = {
  public: {
    Tables: {
      setores: {
        Row: Tables['setores'];
        Insert: Omit<Tables['setores'], 'id' | 'created_at' | 'updated_at'> & {
          id?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Tables['setores'], 'id'>> & { id?: never };
      };
      usuarios: {
        Row: Tables['usuarios'];
        Insert: Omit<Tables['usuarios'], 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Tables['usuarios'], 'id'>> & { id?: never };
      };
      processos: {
        Row: Tables['processos'];
        Insert: Omit<Tables['processos'], 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Tables['processos'], 'id'>> & { id?: never };
      };
      processos_historico: {
        Row: Tables['processos_historico'];
        Insert: Omit<Tables['processos_historico'], 'id' | 'created_at' | 'updated_at'> & {
          id?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Tables['processos_historico'], 'id'>> & { id?: never };
      };
      notificacoes: {
        Row: Tables['notificacoes'];
        Insert: Omit<Tables['notificacoes'], 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Tables['notificacoes'], 'id'>> & { id?: never };
      };
      setor_responsaveis: {
        Row: Tables['setor_responsaveis'];
        Insert: Omit<Tables['setor_responsaveis'], 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Tables['setor_responsaveis'], 'id'>> & { id?: never };
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
    Functions: Record<string, unknown>;
    Enums: Enums;
  };
};
