
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Department } from "@/types";

export const useDeleteOperation = () => {
  const confirmDelete = async (selectedDepartment: Department | null) => {
    if (!selectedDepartment) return false;

    try {
      const { error } = await supabase
        .from('setores')
        .delete()
        .eq('id', parseInt(selectedDepartment.id));

      if (error) {
        throw error;
      }

      toast.success(`Setor "${selectedDepartment.name}" removido com sucesso.`);

      return true;
    } catch (error) {
      console.error('Erro ao excluir setor:', error);
      toast.error("Não foi possível remover o setor.");
      return false;
    }
  };

  return { confirmDelete };
};
