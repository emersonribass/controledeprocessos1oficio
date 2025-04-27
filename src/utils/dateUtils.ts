
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

// Função para ajustar a data para o fuso de Brasília
export const convertToBrasilia = (date: Date): Date => {
  // Horário de Brasília é UTC-3 (ou UTC-2 no horário de verão, mas o Brasil aboliu o horário de verão)
  const brasiliaOffset = -3 * 60; // -180 minutos
  const currentOffset = date.getTimezoneOffset(); // Offset atual do navegador
  
  const diffMinutes = brasiliaOffset - currentOffset;
  return new Date(date.getTime() + diffMinutes * 60000);
};

// Gravar no banco (como string ISO no fuso de Brasília)
export const saveDateToDatabase = (date: Date): string => {
  const brasiliaDate = convertToBrasilia(date);
  return brasiliaDate.toISOString(); // Vai gravar no padrão ISO, mas já ajustado
};

// Mostrar data no horário de Brasília
export const formatDateWithBrasiliaTimezone = (dateString: string): string => {
  const date = parseISO(dateString);
  const brasiliaDate = convertToBrasilia(date);
  return format(brasiliaDate, "dd/MM/yyyy HH:mm", { locale: ptBR });
};
