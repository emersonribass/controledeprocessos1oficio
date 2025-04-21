
import { useState, useEffect, useRef } from "react";
import { useUsuarios } from "@/hooks/useUsuarios";
import { UsuarioSupabase } from "@/types/usuario";

// Variável de cache global para compartilhar os dados entre instâncias do hook
let cachedUsers: UsuarioSupabase[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 60000; // 1 minuto em milissegundos

export const useAvailableUsers = () => {
  const { usuarios, fetchUsuarios } = useUsuarios();
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);
  const fetchInProgressRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      // Se já estiver carregando em outra instância, não faça nada
      if (fetchInProgressRef.current) return;
      
      // Verificar se o cache é válido
      const now = Date.now();
      if (cachedUsers && now - lastFetchTime < CACHE_TTL) {
        setIsLoading(false);
        return;
      }

      try {
        fetchInProgressRef.current = true;
        await fetchUsuarios();
        // Atualizar cache global
        lastFetchTime = Date.now();
        cachedUsers = usuarios;
      } finally {
        fetchInProgressRef.current = false;
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };
    
    loadUsers();
  }, [fetchUsuarios]);

  // Retorna dados do cache se disponível, caso contrário retorna dados da instância
  const availableUsers = cachedUsers || usuarios;

  return {
    usuarios: availableUsers.filter(user => user.ativo),
    isLoading
  };
};
