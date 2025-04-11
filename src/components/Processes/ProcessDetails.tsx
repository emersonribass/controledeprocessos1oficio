
import { useParams } from "react-router-dom";
import { useProcesses } from "@/hooks/useProcesses";
import ProcessHeader from "./ProcessHeader";
import ProcessNotFound from "./ProcessNotFound";
import { useState, useEffect } from "react";
import { useProcessUserManager } from "./ProcessUserManager";
import ProcessDetailsContent from "./ProcessDetailsContent";
import { ProcessAutoRefresher } from "./ProcessAutoRefresher";

const ProcessDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Gerenciamento de usuários
  const {
    userNames,
    responsibleUser,
    fetchUserNames,
    getUserName,
    fetchResponsibleUser,
    setResponsibleUser
  } = useProcessUserManager();

  // Função para lidar com a aceitação do processo
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

    if (!process) {
      return <ProcessNotFound />;
    }

    return (
      <div className="space-y-6">
        <ProcessHeader title="Detalhes do Processo" />
        
        {/* Componente de atualização automática */}
        <ProcessAutoRefresher refreshFunction={refreshProcesses} />
        
        <ProcessDetailsContent 
          process={process}
          getDepartmentName={getDepartmentName}
          getProcessTypeName={getProcessTypeName}
          moveProcessToNextDepartment={moveProcessToNextDepartment}
          moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
          getUserName={getUserName}
          responsibleUserName={responsibleUser ? userNames[responsibleUser] : undefined}
          isRefreshing={isRefreshing}
          onProcessAccepted={handleProcessAccepted}
          hasResponsibleUser={!!responsibleUser}
        />
      </div>
    );
  } catch (error) {
    console.error("Erro ao usar hook useProcesses:", error);
    return <div>Erro ao carregar detalhes do processo. Tente novamente mais tarde.</div>;
  }
};

export default ProcessDetails;
