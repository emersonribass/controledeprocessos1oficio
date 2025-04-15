
import { format as formatOriginal, formatDistanceToNow as formatDistanceToNowOriginal } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatInTimeZone, utcToZonedTime } from "date-fns-tz";

// Fuso horário de Brasília (UTC-3)
export const BRASILIA_TIMEZONE = "America/Sao_Paulo";

/**
 * Converte uma data para o fuso horário de Brasília
 */
export const toBrasiliaTime = (date: Date | string | number): Date => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return utcToZonedTime(dateObj, BRASILIA_TIMEZONE);
};

/**
 * Formata uma data no fuso horário de Brasília
 */
export const formatBrasiliaTime = (
  date: Date | string | number,
  formatString: string
): string => {
  return formatInTimeZone(date, BRASILIA_TIMEZONE, formatString, {
    locale: ptBR,
  });
};

/**
 * Formata uma distância relativa entre a data atual e uma data passada,
 * convertendo a data para o fuso horário de Brasília
 */
export const formatDistanceToBrasiliaTime = (
  date: Date | string | number
): string => {
  const brasiliaDate = toBrasiliaTime(date);
  return formatDistanceToNowOriginal(brasiliaDate, {
    locale: ptBR,
    addSuffix: true,
  });
};
