
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProcesses } from "@/hooks/useProcesses";
import { useProcessUserManager } from "@/components/Processes/ProcessUserManager";
import { ProcessAutoRefresher } from "@/components/Processes/ProcessAutoRefresher";
import ProcessDetailsContent from "@/components/Processes/ProcessDetailsContent";
import { Loader2 } from "lucide-react";
import { Process } from "@/types";
import ProcessHeader from "./ProcessHeader";
import ProcessNotFound from "./ProcessNotFound";

const ProcessDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { processes, getDepartmentName, getProcessTypeName, moveProcessToNextDepartment, moveProcessToPreviousDepartment, isLoading, refreshProcesses } = useProcesses();
  
  const {
    userNames,
    responsibleUser,
    fetchUserNames,
    getUserName,
    fetchResponsibleUser,
    setResponsibleUser
  } = useProcessUserManager();

  const [process, setProcess] = useState<Process | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const loadProcess = async () => {
      await refreshProcesses();
      await fetchResponsibleUser(id);
    };
    
    loadProcess();
  }, [id]);

  useEffect(() => {
    if (!processes.length || !id) return;
    
    const foundProcess = processes.find(p => p.id === id);
    setProcess(foundProcess || null);
    
    if (foundProcess) {
      // Extrair IDs de usuários do histórico
      const userIds = foundProcess.history
        .map(h => h.userId)
        .filter(userId => userId && userId.length > 0);
      
      // Adicionar o ID do usuário responsável, se existir
      if (responsibleUser) {
        userIds.push(responsibleUser);
      }
      
      // Remover duplicatas e buscar nomes de usuários
      const uniqueUserIds = [...new Set(userIds)];
      if (uniqueUserIds.length > 0) {
        fetchUserNames(uniqueUserIds);
      }
    }
  }, [processes, id, responsibleUser]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    await refreshProcesses();
    if (id) {
      await fetchResponsibleUser(id);
    }
    setIsRefreshing(false);
  };
  
  const handleProcessAccepted = () => {
    if (id && process) {
      fetchResponsibleUser(id);
    }
  };

  if (isLoading && !process) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!process) {
    return <ProcessNotFound />;
  }

  const hasResponsibleUser = !!responsibleUser;
  const responsibleUserName = responsibleUser ? getUserName(responsibleUser) : undefined;

  return (
    <div className="space-y-6">
      <ProcessHeader 
        protocolNumber={process.protocolNumber} 
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <ProcessDetailsContent 
        process={process}
        getDepartmentName={getDepartmentName}
        getProcessTypeName={getProcessTypeName}
        moveProcessToNextDepartment={moveProcessToNextDepartment}
        moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
        getUserName={getUserName}
        responsibleUserName={responsibleUserName}
        isRefreshing={isRefreshing}
        onProcessAccepted={handleProcessAccepted}
        hasResponsibleUser={hasResponsibleUser}
      />

      <ProcessAutoRefresher 
        refreshFunction={handleRefresh} 
        intervalSeconds={30}
      />
    </div>
  );
};

export default ProcessDetails;
