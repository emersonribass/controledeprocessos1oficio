
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Department } from "@/types";

export const useDepartmentOperations = (fetchDepartments: () => Promise<void>) => {
  const { toast } = useToast();

  // Função para mover um departamento para cima na ordem
  const handleMoveUp = async (department: Department) => {
    const { data: departmentsData } = await supabase
      .from('setores')
      .select('*')
      .order('order_num', { ascending: true });
    
    if (!departmentsData) return;
    
    const departments = departmentsData.map(dept => ({
      id: dept.id.toString(),
      name: dept.name,
      order: dept.order_num,
      timeLimit: dept.time_limit
    }));
    
    const currentIndex = departments.findIndex(d => d.id === department.id);
    if (currentIndex <= 0) return; // Já está no topo

    const prevDepartment = departments[currentIndex - 1];
    
    try {
      // Atualizar a ordem no banco de dados
      const batch = [];
      
      // Atualizar o departamento atual para a ordem anterior
      batch.push(
        supabase
          .from('setores')
          .update({ order_num: prevDepartment.order })
          .eq('id', Number(department.id))
      );
      
      // Atualizar o departamento anterior para a ordem atual
      batch.push(
        supabase
          .from('setores')
          .update({ order_num: department.order })
          .eq('id', Number(prevDepartment.id))
      );
      
      await Promise.all(batch);
      
      toast({
        title: "Sucesso",
        description: "Ordem dos setores atualizada."
      });
      
      // Atualizar a lista local
      fetchDepartments();
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
    const { data: departmentsData } = await supabase
      .from('setores')
      .select('*')
      .order('order_num', { ascending: true });
    
    if (!departmentsData) return;
    
    const departments = departmentsData.map(dept => ({
      id: dept.id.toString(),
      name: dept.name,
      order: dept.order_num,
      timeLimit: dept.time_limit
    }));
    
    const currentIndex = departments.findIndex(d => d.id === department.id);
    if (currentIndex >= departments.length - 1) return; // Já está no fim
    
    const nextDepartment = departments[currentIndex + 1];
    
    try {
      // Atualizar a ordem no banco de dados
      const batch = [];
      
      // Atualizar o departamento atual para a ordem seguinte
      batch.push(
        supabase
          .from('setores')
          .update({ order_num: nextDepartment.order })
          .eq('id', Number(department.id))
      );
      
      // Atualizar o departamento seguinte para a ordem atual
      batch.push(
        supabase
          .from('setores')
          .update({ order_num: department.order })
          .eq('id', Number(nextDepartment.id))
      );
      
      await Promise.all(batch);
      
      toast({
        title: "Sucesso",
        description: "Ordem dos setores atualizada."
      });
      
      // Atualizar a lista local
      fetchDepartments();
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
