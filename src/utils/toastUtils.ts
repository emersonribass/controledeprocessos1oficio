
import { useToast } from "@/hooks/use-toast";

export const useToastService = () => {
  const { toast } = useToast();

  const success = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "default",
    });
  };

  const error = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "destructive",
    });
  };

  const info = (title: string, description?: string) => {
    toast({
      title,
      description,
    });
  };

  const warning = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "destructive",
    });
  };

  return {
    success,
    error,
    info,
    warning,
  };
};
