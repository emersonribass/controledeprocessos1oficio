
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface Logger {
  debug: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
}

// Definir o nível de log mínimo (pode ser ajustado conforme necessário)
// Em produção, você pode mudar para 'info', 'warn' ou 'error'
const MIN_LOG_LEVEL: LogLevel = 'debug';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

/**
 * Cria um logger para um componente/módulo específico
 * @param componentName Nome do componente ou módulo
 * @returns Um objeto logger com métodos para diferentes níveis de log
 */
export const createLogger = (componentName: string): Logger => {
  const shouldLog = (level: LogLevel): boolean => {
    return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL];
  };

  const formatMessage = (message: string): string => {
    const timestamp = new Date().toISOString();
    return `${timestamp} [${componentName}] ${message}`;
  };

  return {
    debug: (message: string, ...args: any[]) => {
      if (shouldLog('debug')) {
        console.debug(formatMessage(message), ...args);
      }
    },
    info: (message: string, ...args: any[]) => {
      if (shouldLog('info')) {
        console.info(formatMessage(message), ...args);
      }
    },
    warn: (message: string, ...args: any[]) => {
      if (shouldLog('warn')) {
        console.warn(formatMessage(message), ...args);
      }
    },
    error: (message: string, ...args: any[]) => {
      if (shouldLog('error')) {
        console.error(formatMessage(message), ...args);
      }
    }
  };
};
