
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Department } from "@/types";

export const useDeleteOperation = () => {
  const confirmDelete = async (department: Department | null): Promise<boolean> => {
    if (!department) {
      toast.error("Nenhum departamento selecionado");
      return false;
    }
    
    try {
      // Verificar se há processos vinculados ao departamento
      const { data: processos, error: processoError } = await supabase
        .from("processos")
        .select("id")
        .eq("setor_atual", department.id);
      
      if (processoError) {
        console.error("Erro ao verificar processos:", processoError);
        toast.error("Erro ao verificar processos vinculados");
        return false;
      }
      
      if (processos && processos.length > 0) {
        toast.error(`Não é possível excluir. Há ${processos.length} processo(s) vinculado(s) a este departamento.`);
        return false;
      }
      
      // Verificar se há histórico vinculado ao departamento
      const { data: historico, error: historicoError } = await supabase
        .from("processos_historico")
        .select("id")
        .eq("setor_id", department.id)
        .limit(1);
      
      if (historicoError) {
        console.error("Erro ao verificar histórico:", historicoError);
        toast.error("Erro ao verificar histórico vinculado");
        return false;
      }
      
      if (historico && historico.length > 0) {
        toast.error("Não é possível excluir. Há histórico de processos vinculado a este departamento.");
        return false;
      }
      
      // Se não houver vínculos, excluir o departamento
      const { error: deleteError } = await supabase
        .from("setores")
        .delete()
        .eq("id", parseInt(department.id));
      
      if (deleteError) {
        console.error("Erro ao excluir departamento:", deleteError);
        toast.error("Erro ao excluir departamento");
        return false;
      }
      
      toast.success("Departamento excluído com sucesso");
      return true;
    } catch (error) {
      console.error("Erro ao excluir departamento:", error);
      toast.error("Erro ao excluir departamento");
      return false;
    }
  };

  return { confirmDelete };
};
