
import { createLogger } from "@/utils/loggerUtils";

const logger = createLogger("useResponsibleDataAdapter");

/**
 * Hook utilitário que fornece funções para adaptar diferentes formatos 
 * de dados de responsáveis em um formato consistente
 */
export const useResponsibleDataAdapter = () => {
  /**
   * Adapta diferentes formatos de dados de responsáveis para um formato consistente
   * @param processResponsibles Dados de responsáveis do processo
   * @param departmentId ID do departamento
   * @returns Dados do responsável normalizados ou null se não houver responsável
   */
  const getAdaptedResponsible = (
    processResponsibles: any | undefined,
    departmentId: string
  ): { nome: string; email: string } | null => {
    if (!processResponsibles) {
      return null;
    }

    // Caso 1: Formato departmentId → responsible object diretamente
    if (processResponsibles[departmentId] && 
        (processResponsibles[departmentId].nome || processResponsibles[departmentId].email)) {
      logger.debug(`Encontrou responsável no formato direto para setor ${departmentId}`);
      return processResponsibles[departmentId];
    }
    
    // Caso 2: Se o processResponsibles contém initial e o departmentId atual é o primeiro setor
    if (processResponsibles.initial && 
        (processResponsibles.initial.nome || processResponsibles.initial.email)) {
      logger.debug(`Encontrou responsável inicial para setor ${departmentId}`);
      return processResponsibles.initial;
    }

    logger.debug(`Nenhum responsável encontrado para setor ${departmentId} em`, processResponsibles);
    return null;
  };

  return {
    getAdaptedResponsible
  };
};
