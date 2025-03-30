
export type UsuarioSupabase = {
  id: string;
  nome: string;
  email: string;
  senha: string;
  ativo: boolean;
  setores_atribuidos: string[];
  perfil: 'administrador' | 'usuario';
  created_at: string;
  updated_at: string;
};

export type FormUsuario = {
  nome: string;
  email: string;
  senha: string;
  ativo: boolean;
  setores_atribuidos: string[];
  perfil: 'administrador' | 'usuario';
};
