
import { useState, useEffect, useMemo, useRef } from "react";
import { useUsuarios } from "@/hooks/useUsuarios";
import { UsuarioSupabase } from "@/types/usuario";

export const useAvailableUsers = () => {
  const { usuarios, isLoading: isLoadingUsuarios } = useUsuarios();
  const [isLoading, setIsLoading] = useState(true);
  // Adicionar cache para evitar recálculos desnecessários
  const cachedUsersRef = useRef<UsuarioSupabase[]>([]);
  const lastUsersArrayRef = useRef<UsuarioSupabase[]>([]);
  
  // Filtra usuários ativos de forma otimizada usando useMemo
  const usuariosAtivos = useMemo(() => {
    // Verificar se o array de usuários mudou
    if (
      lastUsersArrayRef.current === usuarios ||
      (
        lastUsersArrayRef.current.length === usuarios.length &&
        JSON.stringify(lastUsersArrayRef.current) === JSON.stringify(usuarios)
      )
    ) {
      // Se não mudou, retornar o cache existente
      return cachedUsersRef.current;
    }
    
    // Atualizar a referência para o último array
    lastUsersArrayRef.current = usuarios;
    
    // Calcular novos usuários ativos e atualizar cache
    const filteredUsers = usuarios.filter(user => user.ativo);
    cachedUsersRef.current = filteredUsers;
    
    return filteredUsers;
  }, [usuarios]);
  
  // Atualiza o estado de carregamento quando o hook de usuários estiver pronto
  useEffect(() => {
    if (!isLoadingUsuarios) {
      setIsLoading(false);
    }
  }, [isLoadingUsuarios]);

  return {
    usuarios: usuariosAtivos,
    isLoading
  };
};
