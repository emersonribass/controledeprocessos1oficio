
import { useRef } from 'react';
import { UsuarioSupabase } from '@/types/usuario';

const CACHE_TTL = 10 * 60 * 1000; // 10 minutos

export function useUsuariosCache() {
  const cacheRef = useRef<{
    data: UsuarioSupabase[];
    timestamp: number;
  } | null>(null);

  const getCachedData = () => {
    if (!cacheRef.current) return null;
    
    const now = Date.now();
    if (now - cacheRef.current.timestamp < CACHE_TTL) {
      console.log("Usando dados em cache para 'usuarios'");
      return cacheRef.current.data;
    }
    
    return null;
  };

  const setCachedData = (data: UsuarioSupabase[]) => {
    cacheRef.current = {
      data,
      timestamp: Date.now()
    };
  };

  return {
    getCachedData,
    setCachedData,
  };
}
