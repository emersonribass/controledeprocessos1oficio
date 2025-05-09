
/**
 * Utilitário para gerenciar logs de forma centralizada e eficiente
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private context: string;
  private enabled: boolean;
  private static debugMode = process.env.NODE_ENV === 'development';
  
  constructor(context: string, enabled: boolean = true) {
    this.context = context;
    this.enabled = enabled && Logger.debugMode;
  }

  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (!this.enabled) return;
    
    const formattedMessage = `[${this.context}] ${message}`;
    
    switch(level) {
      case 'info':
        console.log(formattedMessage, ...args);
        break;
      case 'warn':
        console.warn(formattedMessage, ...args);
        break;
      case 'error':
        console.error(formattedMessage, ...args);
        break;
      case 'debug':
        if (Logger.debugMode) {
          console.debug(formattedMessage, ...args);
        }
        break;
    }
  }

  info(message: string, ...args: any[]): void {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log('warn', message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.log('error', message, ...args);
  }

  debug(message: string, ...args: any[]): void {
    this.log('debug', message, ...args);
  }
  
  // Método para criação rápida de uma instância de logger
  static getLogger(context: string, enabled: boolean = true): Logger {
    return new Logger(context, enabled);
  }
}

export const createLogger = (context: string, enabled: boolean = true): Logger => {
  return Logger.getLogger(context, enabled);
};
