
import { toast as sonnerToast } from "sonner";
import { useToast } from "@/hooks/use-toast";

/**
 * Utilitário para exibir toasts de forma unificada, evitando duplicação
 */
export class ToastService {
  // Método para mostrar um toast de sucesso
  static success(title: string, description?: string): void {
    // Usando o Sonner toast
    sonnerToast.success(title, {
      description
    });
  }

  // Método para mostrar um toast de erro
  static error(title: string, description?: string): void {
    // Usando o Sonner toast
    sonnerToast.error(title, {
      description
    });
  }

  // Método para mostrar um toast informativo
  static info(title: string, description?: string): void {
    // Usando o Sonner toast
    sonnerToast.info(title, {
      description
    });
  }

  // Método para mostrar um toast no componente usando o hook useToast
  static showInComponent(toast: ReturnType<typeof useToast>['toast'], options: {
    title: string;
    description?: string;
    variant?: "default" | "destructive";
  }): void {
    toast({
      title: options.title,
      description: options.description,
      variant: options.variant
    });
  }
}

// Hook personalizado que retorna funções de toast já configuradas
export const useToastService = () => {
  const { toast } = useToast();
  
  return {
    success: (title: string, description?: string) => {
      ToastService.success(title, description);
      ToastService.showInComponent(toast, {
        title,
        description
      });
    },
    error: (title: string, description?: string) => {
      ToastService.error(title, description);
      ToastService.showInComponent(toast, {
        title,
        description,
        variant: "destructive"
      });
    },
    info: (title: string, description?: string) => {
      ToastService.info(title, description);
      ToastService.showInComponent(toast, {
        title,
        description
      });
    }
  };
};
