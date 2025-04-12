
import React from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./ErrorFallback";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
  onError?: (error: Error, info: { componentStack: string }) => void;
}

export const ErrorBoundary = ({ 
  children, 
  fallback,
  onReset,
  onError
}: ErrorBoundaryProps) => {
  const handleError = (error: Error, info: { componentStack: string }) => {
    // Registrar o erro
    console.error("Erro capturado pelo ErrorBoundary:", error);
    console.error("Componente stack:", info.componentStack);
    
    // Chamar callback personalizado, se fornecido
    if (onError) {
      onError(error, info);
    }
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={fallback ? () => <>{fallback}</> : ErrorFallback}
      onReset={onReset}
      onError={handleError}
    >
      {children}
    </ReactErrorBoundary>
  );
};
