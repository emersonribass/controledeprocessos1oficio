
import { useState, useCallback, useMemo } from 'react';
import { Process } from '@/types';
import { useUserProfile } from '@/hooks/auth/useUserProfile';
import { useAuth } from '@/hooks/auth';
import { supabase } from '@/integrations/supabase/client';

// Cache global para responsabilidades de processos
const responsibilityCache: Record<string, { 
  timestamp: number, 
  result: boolean 
}> = {};

// TTL do cache (5 minutos)
const CACHE_TTL = 5 * 60 * 1000;

export const useProcessResponsibilityVerification = () => {
  const { user } = useAuth();
  const { userProfile, isAdmin } = useUserProfile();
  const userId = user?.id || '';

  // Limpar entradas expiradas do cache
  const cleanExpiredCache = useCallback(() => {
    const now = Date.now();
    Object.keys(responsibilityCache).forEach(key => {
      if (now - responsibilityCache[key].timestamp > CACHE_TTL) {
        delete responsibilityCache[key];
      }
    });
  }, []);

  // Verificar se o usuário é responsável pelo processo
  const isUserResponsibleForProcess = useCallback((process: Process, checkUserId: string = userId): boolean => {
    if (!checkUserId || !process) return false;
    
    // Verificar se é admin (administradores têm acesso a tudo)
    if (isAdmin()) return true;
    
    // Verificar se é o criador ou responsável direto
    return process.userId === checkUserId || process.responsibleUserId === checkUserId || process.usuario_responsavel === checkUserId;
  }, [userId, isAdmin]);

  // Verificar se o usuário é responsável por um setor específico em um processo
  const isUserResponsibleForSector = useCallback(async (processId: string, sectorId: string, checkUserId: string = userId): Promise<boolean> => {
    if (!checkUserId || !processId || !sectorId) return false;
    
    // Verificar se é admin (administradores têm acesso a tudo)
    if (isAdmin()) return true;
    
    // Gerar chave de cache
    const cacheKey = `${processId}:${sectorId}:${checkUserId}`;
    
    // Verificar se temos no cache
    if (responsibilityCache[cacheKey] && 
        (Date.now() - responsibilityCache[cacheKey].timestamp < CACHE_TTL)) {
      return responsibilityCache[cacheKey].result;
    }
    
    cleanExpiredCache();
    
    try {
      // Buscar se o usuário é responsável pelo setor no processo
      const { data, error } = await supabase
        .from('setor_responsaveis')
        .select('*')
        .eq('processo_id', processId)
        .eq('setor_id', sectorId)
        .eq('usuario_id', checkUserId)
        .maybeSingle();
      
      if (error) throw error;
      
      const isResponsible = !!data;
      
      // Salvar no cache
      responsibilityCache[cacheKey] = {
        timestamp: Date.now(),
        result: isResponsible
      };
      
      return isResponsible;
    } catch (error) {
      console.error('Erro ao verificar responsabilidade:', error);
      return false;
    }
  }, [userId, isAdmin, cleanExpiredCache]);

  return {
    isUserResponsibleForProcess,
    isUserResponsibleForSector
  };
};
