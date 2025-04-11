
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Department } from "@/types";

export const useMoveDownOperation = () => {
  // Função para mover um departamento para baixo na ordem
  const handleMoveDown = async (department: Department) => {
    try {
      console.log(`Iniciando movimento para baixo do setor: ${department.name} (${department.id})`);
      
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
      console.log(`Índice atual: ${currentIndex}, Total de departamentos: ${departments.length}`);
      
      if (currentIndex === -1) {
        console.error(`Setor com ID ${department.id} não encontrado`);
        return;
      }
      
      if (currentIndex >= departments.length - 1) {
        console.log('Este setor já está no fim da lista');
        return; // Já está no fim
      }
      
      const nextDepartment = departments[currentIndex + 1];
      
      // Armazenar os valores originais para troca
      const currentOrderValue = department.order;
      const nextOrderValue = nextDepartment.order;
      
      console.log(`Movendo setor para baixo: ${department.name} (${department.id}) da posição ${currentOrderValue} para ${nextOrderValue}`);
      console.log(`Próximo setor: ${nextDepartment.name} (${nextDepartment.id}) da posição ${nextOrderValue} para ${currentOrderValue}`);
      
      // Primeiro, atualize o departamento seguinte para a ordem atual
      console.log(`Atualizando setor ${nextDepartment.id} para ordem ${currentOrderValue}`);
      const { error: updateNextError } = await supabase
        .from('setores')
        .update({ order_num: currentOrderValue, updated_at: new Date().toISOString() })
        .eq('id', parseInt(nextDepartment.id));
      
      if (updateNextError) {
        console.error('Erro ao atualizar setor seguinte:', updateNextError);
        throw updateNextError;
      }
      
      console.log(`Atualizado com sucesso o setor ${nextDepartment.name} para ordem ${currentOrderValue}`);
      
      // Depois, atualize o departamento atual para a ordem seguinte
      console.log(`Atualizando setor ${department.id} para ordem ${nextOrderValue}`);
      const { error: updateCurrentError } = await supabase
        .from('setores')
        .update({ order_num: nextOrderValue, updated_at: new Date().toISOString() })
        .eq('id', parseInt(department.id));
      
      if (updateCurrentError) {
        console.error('Erro ao atualizar setor atual:', updateCurrentError);
        throw updateCurrentError;
      }
      
      console.log(`Atualizado com sucesso o setor ${department.name} para ordem ${nextOrderValue}`);
      
      toast.success(`${department.name} movido para baixo`);
      
    } catch (error) {
      console.error('Erro ao reordenar setores:', error);
      toast.error("Não foi possível reordenar os setores.");
    }
  };

  return { handleMoveDown };
};
