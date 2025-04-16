
import { useState, useEffect } from "react";
import { ProcessType } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabaseService } from "@/services/supabase";

export const useProcessTypes = () => {
  const [processTypes, setProcessTypes] = useState<ProcessType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProcessTypes();
  }, []);

  const fetchProcessTypes = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabaseService.fetchProcessTypes();
        
      if (error) {
        throw error;
      }
      
      // Mapear para o formato do tipo ProcessType
      const formattedTypes: ProcessType[] = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        active: item.active,
        description: item.description
      }));
      
      setProcessTypes(formattedTypes);
    } catch (error) {
      console.error('Erro ao buscar tipos de processo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os tipos de processo",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getProcessTypeName = (id: string) => {
    const processType = processTypes.find((pt) => pt.id === id);
    return processType ? processType.name : "Desconhecido";
  };

  // Adicionar função para criar novo tipo de processo
  const createProcessType = async (name: string) => {
    try {
      const { data, error } = await supabaseService.createProcessType(name);
        
      if (error) {
        throw error;
      }
      
      // Atualizar a lista de tipos
      await fetchProcessTypes();
      
      toast({
        title: "Sucesso",
        description: "Tipo de processo criado com sucesso"
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao criar tipo de processo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o tipo de processo",
        variant: "destructive"
      });
      return false;
    }
  };

  // Adicionar função para atualizar tipo de processo
  const updateProcessType = async (id: string, name: string) => {
    try {
      const { error } = await supabaseService.updateProcessType(id, { name });
        
      if (error) {
        throw error;
      }
      
      // Atualizar a lista de tipos
      await fetchProcessTypes();
      
      toast({
        title: "Sucesso",
        description: "Tipo de processo atualizado com sucesso"
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar tipo de processo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o tipo de processo",
        variant: "destructive"
      });
      return false;
    }
  };

  // Adicionar função para desativar/ativar tipo de processo
  const toggleProcessTypeActive = async (id: string, active: boolean) => {
    try {
      const { error } = await supabaseService.toggleProcessTypeActive(id, active);
        
      if (error) {
        throw error;
      }
      
      // Atualizar a lista de tipos
      await fetchProcessTypes();
      
      toast({
        title: "Sucesso",
        description: active 
          ? "Tipo de processo ativado com sucesso" 
          : "Tipo de processo desativado com sucesso"
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao alterar status do tipo de processo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do tipo de processo",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    processTypes,
    isLoading,
    getProcessTypeName,
    fetchProcessTypes,
    createProcessType,
    updateProcessType,
    toggleProcessTypeActive
  };
};
