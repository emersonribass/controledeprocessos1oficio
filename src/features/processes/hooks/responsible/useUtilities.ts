
import { useCallback } from "react";
import { useAuth } from "@/features/auth";

/**
 * Funções utilitárias para verificação de responsabilidades
 */
export const useResponsibilityUtilities = (processResponsibles: Record<string, string | null>) => {
  const { user } = useAuth();
  
  const hasProcessResponsible = useCallback((processId: string): boolean => {
    return Boolean(processResponsibles[processId]);
  }, [processResponsibles]);
  
  const isUserProcessResponsible = useCallback((processId: string): boolean => {
    if (!user) return false;
    return processResponsibles[processId] === user.id;
  }, [processResponsibles, user]);
  
  return {
    hasProcessResponsible,
    isUserProcessResponsible
  };
};
