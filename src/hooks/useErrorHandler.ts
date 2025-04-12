
import { useState } from "react";
import { toast } from "sonner";

interface ErrorOptions {
  showToast?: boolean;
  toastDuration?: number;
  logError?: boolean;
}

interface UseErrorHandlerResult {
  error: Error | null;
  isError: boolean;
  handleError: (error: unknown, options?: ErrorOptions) => void;
  clearError: () => void;
}

const DEFAULT_OPTIONS: ErrorOptions = {
  showToast: true,
  toastDuration: 5000,
  logError: true
};

export const useErrorHandler = (): UseErrorHandlerResult => {
  const [error, setError] = useState<Error | null>(null);

  const handleError = (err: unknown, options: ErrorOptions = DEFAULT_OPTIONS) => {
    const { showToast, toastDuration, logError } = { ...DEFAULT_OPTIONS, ...options };
    
    // Converter para Error se não for
    let errorObj: Error;
    if (err instanceof Error) {
      errorObj = err;
    } else if (typeof err === 'string') {
      errorObj = new Error(err);
    } else if (err && typeof err === 'object' && 'message' in err) {
      errorObj = new Error(String(err.message));
    } else {
      errorObj = new Error("Ocorreu um erro desconhecido");
    }
    
    // Registrar erro no console
    if (logError) {
      console.error("Erro capturado:", errorObj);
    }
    
    // Mostrar toast para o usuário
    if (showToast) {
      toast.error("Erro", {
        description: errorObj.message || "Ocorreu um erro inesperado",
        duration: toastDuration,
      });
    }
    
    // Definir o estado de erro
    setError(errorObj);
  };

  const clearError = () => {
    setError(null);
  };

  return {
    error,
    isError: error !== null,
    handleError,
    clearError
  };
};
