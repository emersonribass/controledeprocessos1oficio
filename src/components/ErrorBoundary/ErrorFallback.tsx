
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => {
  return (
    <div className="flex items-center justify-center min-h-[70vh] p-6">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-5 w-5" />
        <div className="ml-3">
          <AlertTitle>Ocorreu um erro</AlertTitle>
          <AlertDescription className="mt-2">
            <div className="space-y-4">
              <p className="text-sm text-destructive-foreground/90">
                {error.message || "Um erro inesperado ocorreu. Tente novamente mais tarde."}
              </p>
              <div className="flex justify-end">
                <Button onClick={resetErrorBoundary} variant="outline" size="sm">
                  Tentar novamente
                </Button>
              </div>
            </div>
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
};
