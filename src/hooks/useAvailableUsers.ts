
import { useState, useEffect, useMemo } from "react";
import { useUsuarios } from "@/hooks/useUsuarios";
import { UsuarioSupabase } from "@/types/usuario";

export const useAvailableUsers = () => {
  const { usuarios, isLoading: isLoadingUsuarios } = useUsuarios();
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtra usuários ativos de forma otimizada usando useMemo
  const usuariosAtivos = useMemo(() => {
    return usuarios.filter(user => user.ativo);
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
