
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Department } from "@/types";

export const useMoveUpOperation = () => {
  // Função para mover um departamento para cima na ordem
  const handleMoveUp = async (department: Department) => {
    try {
      console.log(`Iniciando movimento para cima do setor: ${department.name} (${department.id})`);
      
      // Buscar lista completa e ordenada de departamentos
      const { data: departmentsData, error: fetchError } = await supabase
        .from('setores')
        .select('*')
        .order('order_num', { ascending: true });
      
      if (fetchError) {
        console.error('Erro ao buscar setores:', fetchError);
        throw fetchError;
      }
      
      if (!departmentsData || departmentsData.length === 0) {
        console.error('Não foi possível recuperar os setores');
        return;
      }
      
      console.log('Departamentos recuperados:', departmentsData);
      
      const departments = departmentsData.map(dept => ({
        id: dept.id.toString(),
        name: dept.name,
        order: dept.order_num,
        timeLimit: dept.time_limit
      }));
      
      const currentIndex = departments.findIndex(d => d.id === department.id);
      if (currentIndex <= 0) {
        console.log('Este setor já está no topo');
        return; // Já está no topo
      }

      const prevDepartment = departments[currentIndex - 1];
      
      // Armazenar os valores originais para troca
      const currentOrderValue = department.order;
      const prevOrderValue = prevDepartment.order;
      
      console.log(`Movendo setor para cima: ${department.name} (${department.id}) da posição ${currentOrderValue} para ${prevOrderValue}`);
      console.log(`Setor anterior: ${prevDepartment.name} (${prevDepartment.id}) da posição ${prevOrderValue} para ${currentOrderValue}`);
      
      // Primeiro, atualize o departamento anterior para a ordem atual
      const { error: updatePrevError } = await supabase
        .from('setores')
        .update({ order_num: currentOrderValue, updated_at: new Date().toISOString() })
        .eq('id', parseInt(prevDepartment.id));
      
      if (updatePrevError) {
        console.error('Erro ao atualizar setor anterior:', updatePrevError);
        throw updatePrevError;
      }
      
      console.log(`Atualizado com sucesso o setor ${prevDepartment.name} para ordem ${currentOrderValue}`);
      
      // Depois, atualize o departamento atual para a ordem anterior
      const { error: updateCurrentError } = await supabase
        .from('setores')
        .update({ order_num: prevOrderValue, updated_at: new Date().toISOString() })
        .eq('id', parseInt(department.id));
      
      if (updateCurrentError) {
        console.error('Erro ao atualizar setor atual:', updateCurrentError);
        throw updateCurrentError;
      }
      
      console.log(`Atualizado com sucesso o setor ${department.name} para ordem ${prevOrderValue}`);
      
      toast.success(`${department.name} movido para cima`);
      
    } catch (error) {
      console.error('Erro ao reordenar setores:', error);
      toast.error("Não foi possível reordenar os setores.");
    }
  };

  return { handleMoveUp };
};
