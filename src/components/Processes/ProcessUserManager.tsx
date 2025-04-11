
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type UserNamesMap = Record<string, string>;

export const useProcessUserManager = () => {
  const [userNames, setUserNames] = useState<UserNamesMap>({});
  const [responsibleUser, setResponsibleUser] = useState<string | null>(null);
  
  // Função para buscar nomes de usuários
  const fetchUserNames = async (userIds: string[]) => {
    if (!userIds.length) return;
    
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nome')
        .in('id', userIds);
        
      if (error) {
        console.error('Erro ao buscar nomes de usuários:', error);
        return;
      }
      
      const namesMap: Record<string, string> = {};
      data?.forEach(user => {
        namesMap[user.id] = user.nome;
      });
      
      setUserNames(namesMap);
    } catch (error) {
      console.error('Erro ao processar nomes de usuários:', error);
    }
  };
  
  // Função para obter nome do usuário por ID
  const getUserName = (userId: string): string => {
    return userNames[userId] || "Usuário não encontrado";
  };

  // Função para buscar usuário responsável pelo processo
  const fetchResponsibleUser = async (processId: string) => {
    try {
      const { data, error } = await supabase
        .from('processos')
        .select('*')
        .eq('id', processId)
        .single();

      if (error) {
        console.error('Erro ao buscar usuário responsável:', error);
        return;
      }

      setResponsibleUser(data.usuario_responsavel);
    } catch (error) {
      console.error('Erro ao processar usuário responsável:', error);
    }
  };

  return {
    userNames,
    responsibleUser,
    fetchUserNames,
    getUserName,
    fetchResponsibleUser,
    setResponsibleUser
  };
};
