
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Department } from "@/types";

export const useDepartmentOperations = (fetchDepartments: () => Promise<void>) => {
  const { toast } = useToast();

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
        .update({ order_num: currentOrderValue })
        .eq('id', parseInt(prevDepartment.id));
      
      if (updatePrevError) {
        console.error('Erro ao atualizar setor anterior:', updatePrevError);
        throw updatePrevError;
      }
      
      console.log(`Atualizado com sucesso o setor ${prevDepartment.name} para ordem ${currentOrderValue}`);
      
      // Depois, atualize o departamento atual para a ordem anterior
      const { error: updateCurrentError } = await supabase
        .from('setores')
        .update({ order_num: prevOrderValue })
        .eq('id', parseInt(department.id));
      
      if (updateCurrentError) {
        console.error('Erro ao atualizar setor atual:', updateCurrentError);
        throw updateCurrentError;
      }
      
      console.log(`Atualizado com sucesso o setor ${department.name} para ordem ${prevOrderValue}`);
      
      toast({
        title: "Sucesso",
        description: `${department.name} movido para cima`
      });
      
    } catch (error) {
      console.error('Erro ao reordenar setores:', error);
      toast({
        title: "Erro",
        description: "Não foi possível reordenar os setores.",
        variant: "destructive"
      });
    }
  };

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
        .update({ order_num: currentOrderValue })
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
        .update({ order_num: nextOrderValue })
        .eq('id', parseInt(department.id));
      
      if (updateCurrentError) {
        console.error('Erro ao atualizar setor atual:', updateCurrentError);
        throw updateCurrentError;
      }
      
      console.log(`Atualizado com sucesso o setor ${department.name} para ordem ${nextOrderValue}`);
      
      toast({
        title: "Sucesso",
        description: `${department.name} movido para baixo`
      });
      
    } catch (error) {
      console.error('Erro ao reordenar setores:', error);
      toast({
        title: "Erro",
        description: "Não foi possível reordenar os setores.",
        variant: "destructive"
      });
    }
  };

  const confirmDelete = async (selectedDepartment: Department | null) => {
    if (!selectedDepartment) return;

    try {
      const { error } = await supabase
        .from('setores')
        .delete()
        .eq('id', parseInt(selectedDepartment.id));

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: `Setor "${selectedDepartment.name}" removido com sucesso.`
      });

      return true;
    } catch (error) {
      console.error('Erro ao excluir setor:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o setor.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    handleMoveUp,
    handleMoveDown,
    confirmDelete
  };
};
