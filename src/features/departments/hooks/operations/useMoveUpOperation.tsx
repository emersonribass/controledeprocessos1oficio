
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Department } from "@/types";

export const useMoveUpOperation = () => {
  const handleMoveUp = async (
    department: Department,
    onOptimisticUpdate?: (departments: Department[]) => void
  ) => {
    try {
      // 1. Buscar todos os departamentos para encontrar o anterior
      const { data: departments, error } = await supabase
        .from("setores")
        .select("*")
        .order("order_num", { ascending: true });

      if (error) {
        console.error("Erro ao buscar departamentos:", error);
        toast.error("Erro ao mover departamento para cima");
        return;
      }

      // Converter para nosso formato de Department
      const formattedDepartments = departments.map(d => ({
        id: d.id.toString(),
        name: d.name,
        order: d.order_num,
        timeLimit: d.time_limit
      }));

      // 2. Encontrar o departamento atual e o anterior
      const currentDept = formattedDepartments.find(d => d.id === department.id);
      if (!currentDept) {
        toast.error("Departamento não encontrado");
        return;
      }

      // Se já estiver no topo, não fazer nada
      if (currentDept.order <= 1) {
        toast.info("Já está no topo");
        return;
      }

      const previousDept = formattedDepartments
        .filter(d => d.order < currentDept.order)
        .sort((a, b) => b.order - a.order)[0];

      if (!previousDept) {
        toast.error("Não foi possível identificar o departamento anterior");
        return;
      }

      // 3. Atualização otimista (se fornecida uma função de callback)
      if (onOptimisticUpdate) {
        const updatedDepartments = formattedDepartments.map(d => {
          if (d.id === currentDept.id) {
            return { ...d, order: previousDept.order };
          }
          if (d.id === previousDept.id) {
            return { ...d, order: currentDept.order };
          }
          return d;
        });
        
        onOptimisticUpdate(updatedDepartments);
      }

      // 4. Trocar as ordens no banco de dados
      const { error: updateError1 } = await supabase
        .from("setores")
        .update({ order_num: 0 }) // Valor temporário para evitar violação de restrição de unicidade
        .eq("id", currentDept.id);

      if (updateError1) {
        console.error("Erro na primeira atualização:", updateError1);
        toast.error("Erro ao mover departamento");
        return;
      }

      const { error: updateError2 } = await supabase
        .from("setores")
        .update({ order_num: currentDept.order })
        .eq("id", previousDept.id);

      if (updateError2) {
        console.error("Erro na segunda atualização:", updateError2);
        toast.error("Erro ao mover departamento");
        return;
      }

      const { error: updateError3 } = await supabase
        .from("setores")
        .update({ order_num: previousDept.order })
        .eq("id", currentDept.id);

      if (updateError3) {
        console.error("Erro na terceira atualização:", updateError3);
        toast.error("Erro ao mover departamento");
        return;
      }

      // Não precisamos fazer fetch novamente, pois o listener real-time cuidará disso
      toast.success("Departamento movido com sucesso");

    } catch (error) {
      console.error("Erro ao mover departamento:", error);
      toast.error("Erro ao mover departamento");
    }
  };

  return { handleMoveUp };
};
