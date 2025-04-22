import { useState, useCallback, useRef, useEffect } from "react";
import { UsuarioSupabase } from "@/types/usuario";
import { supabaseService } from "@/services/supabase";
import { useUsuariosCache } from "./useUsuariosCache";
import { useUsuariosOperations } from "./useUsuariosOperations";

// Sistema de deduplicação de requisições
let pendingFetchPromise: Promise<UsuarioSupabase[]> | null = null;
let lastFetchTimestamp = 0;
const DEBOUNCE_TIME = 300; // 300ms de debounce

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioSupabase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [usuarioAtual, setUsuarioAtual] = useState<UsuarioSupabase | null>(null);
  
  const { getCachedData, setCachedData } = useUsuariosCache();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchUsuarios = useCallback(async (forceRefresh = false): Promise<UsuarioSupabase[]> => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    return new Promise<UsuarioSupabase[]>((resolve) => {
      debounceTimeoutRef.current = setTimeout(async () => {
        const now = Date.now();
        
        if (pendingFetchPromise && now - lastFetchTimestamp < 5000) {
          const result = await pendingFetchPromise;
          resolve(result);
          return;
        }
        
        if (!forceRefresh) {
          const cachedData = getCachedData();
          if (cachedData) {
            setUsuarios(cachedData);
            resolve(cachedData);
            return;
          }
        }

        setIsLoading(true);
        
        const fetchPromise = (async () => {
          try {
            console.log("Iniciando busca de usuários na tabela 'usuarios' do projeto controledeprocessos1oficio");
            const { data, error, count } = await supabaseService.fetchUsuarios();

            if (error) {
              throw error;
            }

            console.log(`Encontrados ${count} usuários na tabela 'usuarios'`);
            
            const usuariosData = data as UsuarioSupabase[] || [];
            setUsuarios(usuariosData);
            setCachedData(usuariosData);
            
            return usuariosData;
          } catch (error) {
            console.error("Erro ao buscar usuários:", error);
            return [] as UsuarioSupabase[];
          } finally {
            setIsLoading(false);
            if (pendingFetchPromise === fetchPromise) {
              pendingFetchPromise = null;
            }
          }
        })();
        
        pendingFetchPromise = fetchPromise;
        lastFetchTimestamp = now;
        
        resolve(fetchPromise);
      }, DEBOUNCE_TIME);
    });
  }, [getCachedData, setCachedData]);

  const operations = useUsuariosOperations(async () => {
    await fetchUsuarios(true);
    return Promise.resolve();
  });

  useEffect(() => {
    if (!getCachedData()) {
      fetchUsuarios();
    }
    
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [fetchUsuarios, getCachedData]);

  return {
    usuarios,
    isLoading,
    usuarioAtual,
    setUsuarioAtual,
    fetchUsuarios,
    ...operations
  };
}
