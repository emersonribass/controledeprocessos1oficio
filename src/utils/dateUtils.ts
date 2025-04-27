
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export const convertToUTC = (date: Date): Date => {
  // Ajusta o offset do timezone para UTC (0)
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() + offset * 60000);
};

export const formatDateWithTimezone = (dateString: string): string => {
  const date = parseISO(dateString);
  return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
};
