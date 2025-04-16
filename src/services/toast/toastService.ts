
import { toast } from "@/hooks/use-toast";

/**
 * Serviço de Toast centralizado
 * Fornece métodos padronizados para exibir diferentes tipos de toasts na aplicação
 */
export class ToastService {
  /**
   * Exibe uma mensagem de sucesso
   * @param title Título da mensagem
   * @param description Descrição opcional da mensagem
   */
  static success(title: string, description?: string) {
    toast({
      title,
      description,
      variant: "default",
    });
  }

  /**
   * Exibe uma mensagem de erro
   * @param title Título da mensagem de erro
   * @param description Descrição opcional do erro
   */
  static error(title: string, description?: string) {
    toast({
      title,
      description,
      variant: "destructive",
    });
  }

  /**
   * Exibe uma mensagem informativa
   * @param title Título da mensagem
   * @param description Descrição opcional da mensagem
   */
  static info(title: string, description?: string) {
    toast({
      title,
      description,
    });
  }

  /**
   * Exibe uma mensagem de aviso
   * @param title Título do aviso
   * @param description Descrição opcional do aviso
   */
  static warning(title: string, description?: string) {
    toast({
      title,
      description,
      variant: "default",
      className: "bg-amber-500 text-white",
    });
  }
}
