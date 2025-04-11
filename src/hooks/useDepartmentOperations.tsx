
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Department } from "@/types";

export const useDepartmentOperations = (fetchDepartments: () => Promise<void>) => {
  const { toast } = useToast();

  // Função para mover um departamento para cima na ordem
  const handleMoveUp = async (department: Department) => {
    try {
      console.log(`Iniciando movimento para cima do setor: ${department.name} (${department.id})`);
      
      const { data: departmentsData } = await supabase
        .from('setores')
        .select('*')
        .order('order_num', { ascending: true });
      
      if (!departmentsData || departmentsData.length === 0) {
        console.error('Não foi possível recuperar os setores');
        return;
      }
      
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
      
      // Atualizar a ordem no banco de dados
      const updates = [];
      
      // Atualizar o departamento atual para a ordem anterior
      updates.push(
        supabase
          .from('setores')
          .update({ order_num: prevOrderValue })
          .eq('id', Number(department.id))
      );
      
      // Atualizar o departamento anterior para a ordem atual
      updates.push(
        supabase
          .from('setores')
          .update({ order_num: currentOrderValue })
          .eq('id', Number(prevDepartment.id))
      );
      
      await Promise.all(updates);
      
      toast({
        title: "Sucesso",
        description: "Ordem dos setores atualizada."
      });
      
      // Atualizar a lista local
      await fetchDepartments();
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
      
      const departments = departmentsData.map(dept => ({
        id: dept.id.toString(),
        name: dept.name,
        order: dept.order_num,
        timeLimit: dept.time_limit
      }));
      
      const currentIndex = departments.findIndex(d => d.id === department.id);
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
      
      // Primeiro, atualize o departamento seguinte para a ordem atual
      const { error: updateNextError } = await supabase
        .from('setores')
        .update({ order_num: currentOrderValue })
        .eq('id', Number(nextDepartment.id));
      
      if (updateNextError) {
        console.error('Erro ao atualizar setor seguinte:', updateNextError);
        throw updateNextError;
      }
      
      // Depois, atualize o departamento atual para a ordem seguinte
      const { error: updateCurrentError } = await supabase
        .from('setores')
        .update({ order_num: nextOrderValue })
        .eq('id', Number(department.id));
      
      if (updateCurrentError) {
        console.error('Erro ao atualizar setor atual:', updateCurrentError);
        throw updateCurrentError;
      }
      
      toast({
        title: "Sucesso",
        description: "Ordem dos setores atualizada."
      });
      
      // Atualizar a lista local
      await fetchDepartments();
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
        .eq('id', Number(selectedDepartment.id));

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: `Setor "${selectedDepartment.name}" removido com sucesso.`
      });

      fetchDepartments();
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
