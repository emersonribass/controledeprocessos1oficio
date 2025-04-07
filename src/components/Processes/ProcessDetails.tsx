
import { useParams } from "react-router-dom";
import { useProcesses } from "@/hooks/useProcesses";
import ProcessHeader from "./ProcessHeader";
import ProcessCard from "./ProcessCard";
import ProcessHistory from "./ProcessHistory";
import ProcessNotFound from "./ProcessNotFound";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const ProcessDetails = () => {
  // Adicionando console log para debug
  console.log("Renderizando ProcessDetails");
  
  const { id } = useParams<{ id: string }>();
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [responsibleUser, setResponsibleUser] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
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

  const handleProcessAccepted = () => {
    if (id) {
      setIsRefreshing(true);
      fetchResponsibleUser(id).finally(() => setIsRefreshing(false));
    }
  };
  
  // Verificando se o hook useProcesses está funcionando
  try {
    const {
      processes,
      getDepartmentName,
      getProcessTypeName,
      moveProcessToNextDepartment,
      moveProcessToPreviousDepartment,
      refreshProcesses,
    } = useProcesses();
    
    console.log("Hook useProcesses carregado com sucesso", processes.length);
    
    const process = processes.find((p) => p.id === id);
    console.log("Processo encontrado:", process);

    // Efeito para buscar nomes de usuários quando o processo é carregado
    useEffect(() => {
      if (process) {
        // Extrair IDs de usuários únicos do histórico
        const userIds = process.history
          .filter(h => h.userId)
          .map(h => h.userId)
          .filter((id, index, self) => self.indexOf(id) === index);
          
        fetchUserNames(userIds);
        fetchResponsibleUser(process.id);
      }
    }, [process?.id]);

    // Efeito para atualizar a lista de processos periodicamente
    useEffect(() => {
      const intervalId = setInterval(() => {
        refreshProcesses();
      }, 30000); // Atualizar a cada 30 segundos
      
      return () => clearInterval(intervalId);
    }, [refreshProcesses]);

    if (!process) {
      return <ProcessNotFound />;
    }

    return (
      <div className="space-y-6">
        <ProcessHeader title="Detalhes do Processo" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProcessCard
            process={process}
            getDepartmentName={getDepartmentName}
            getProcessTypeName={getProcessTypeName}
            moveProcessToNextDepartment={moveProcessToNextDepartment}
            moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
            responsibleUserName={responsibleUser ? userNames[responsibleUser] : undefined}
          />

          <ProcessHistory 
            history={process.history} 
            getDepartmentName={getDepartmentName} 
            getUserName={getUserName}
            processId={process.id}
            protocolNumber={process.protocolNumber}
            hasResponsibleUser={!!responsibleUser}
            onProcessAccepted={handleProcessAccepted}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Erro ao usar hook useProcesses:", error);
    return <div>Erro ao carregar detalhes do processo. Tente novamente mais tarde.</div>;
  }
};

export default ProcessDetails;
