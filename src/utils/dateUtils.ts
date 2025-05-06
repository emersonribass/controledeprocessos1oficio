
import { format, parseISO, differenceInDays, addDays, isWeekend, isAfter, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

// Função para ajustar a data para o fuso de Brasília
export const convertToBrasilia = (date: Date): Date => {
  // Horário de Brasília é UTC-3 (ou UTC-2 no horário de verão, mas o Brasil aboliu o horário de verão)
  const brasiliaOffset = 0 * 60; // 60 minutos
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

/**
 * Adiciona um número específico de dias úteis a uma data.
 * Considera apenas segunda a sexta como dias úteis.
 * 
 * @param date Data inicial
 * @param businessDays Número de dias úteis a adicionar
 * @returns Nova data após adicionar os dias úteis
 */
export const addBusinessDays = (date: Date, businessDays: number): Date => {
  let currentDate = new Date(date);
  let daysAdded = 0;
  
  while (daysAdded < businessDays) {
    currentDate = addDays(currentDate, 1);
    if (!isWeekend(currentDate)) {
      daysAdded++;
    }
  }
  
  return currentDate;
};

/**
 * Calcula o número de dias úteis entre duas datas
 * 
 * @param startDate Data inicial
 * @param endDate Data final
 * @returns Número de dias úteis entre as datas
 */
export const differenceInBusinessDays = (startDate: Date, endDate: Date): number => {
  let currentDate = new Date(startDate);
  let businessDays = 0;
  
  // Se a data final é anterior à inicial, retorna 0 ou um valor negativo
  if (isAfter(startDate, endDate) && !isSameDay(startDate, endDate)) {
    return -differenceInBusinessDays(endDate, startDate);
  }
  
  // Se as datas são iguais, retorna 0
  if (isSameDay(startDate, endDate)) {
    return 0;
  }
  
  while (isAfter(endDate, currentDate) || isSameDay(endDate, currentDate)) {
    if (!isWeekend(currentDate)) {
      businessDays++;
    }
    currentDate = addDays(currentDate, 1);
  }
  
  // Subtrair 1 para não contar o próprio dia final
  return businessDays > 0 ? businessDays - 1 : 0;
};

/**
 * Calcula a data limite considerando dias úteis
 * 
 * @param startDate Data inicial
 * @param businessDays Número de dias úteis
 * @returns Data limite após o número de dias úteis
 */
export const calculateBusinessDayDeadline = (startDate: Date, businessDays: number): Date => {
  return addBusinessDays(startDate, businessDays);
};

/**
 * Verifica se a data atual já ultrapassou o prazo em dias úteis
 * 
 * @param startDate Data inicial
 * @param businessDays Número de dias úteis do prazo
 * @returns true se o prazo foi ultrapassado, false caso contrário
 */
export const isBusinessDeadlineExceeded = (startDate: Date, businessDays: number): boolean => {
  const deadlineDate = calculateBusinessDayDeadline(startDate, businessDays);
  const now = new Date();
  return isAfter(now, deadlineDate);
};

/**
 * Calcula o número de dias úteis restantes até uma data limite
 * 
 * @param targetDate Data limite
 * @returns Número de dias úteis restantes (negativo se já passou)
 */
export const getRemainingBusinessDays = (targetDate: Date): number => {
  const now = new Date();
  return differenceInBusinessDays(now, targetDate);
};
