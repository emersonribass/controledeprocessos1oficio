
import { useProcessResponsibles } from "@/features/processes";

// Este é um hook de redirecionamento para manter compatibilidade com o código existente
export const useProcessResponsibility = (props: { processId: string }) => {
  return useProcessResponsibles(props);
};
