
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
      
      console.log("Verificando cache de usuários...");
      
      // Verificar se o cache é válido
      const now = Date.now();
      if (cachedUsers && now - lastFetchTime < CACHE_TTL) {
        console.log("Usando usuários do cache:", cachedUsers.length);
        setIsLoading(false);
        return;
      }

      console.log("Cache expirado, buscando usuários do servidor...");

      try {
        fetchInProgressRef.current = true;
        await fetchUsuarios();
        
        // Atualizar cache global
        lastFetchTime = Date.now();
        cachedUsers = usuarios;
        
        console.log("Usuários atualizados no cache:", usuarios.length);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      } finally {
        fetchInProgressRef.current = false;
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };
    
    loadUsers();
  }, [fetchUsuarios, usuarios]);

  // Adicionar log para depuração
  const availableUsers = cachedUsers || usuarios;
  console.log("useAvailableUsers - retornando usuários:", availableUsers?.length);

  return {
    usuarios: availableUsers.filter(user => user.ativo),
    isLoading
  };
};
