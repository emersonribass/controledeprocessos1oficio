
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useProcesses } from "@/features/processes";
import { useProcessUserManager } from "@/components/Processes/ProcessUserManager";
import { ProcessAutoRefresher } from "@/components/Processes/ProcessAutoRefresher";
import ProcessDetailsContent from "@/components/Processes/ProcessDetailsContent";
import { Loader2 } from "lucide-react";
import { Process } from "@/types";
import ProcessHeader from "./ProcessHeader";
import ProcessNotFound from "./ProcessNotFound";
import { useAuth } from "@/features/auth";

const ProcessDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { 
    processes, 
    isLoading, 
    refreshProcesses,
    filterProcesses 
  } = useProcesses();
  
  const {
    userNames,
    fetchUserNames,
    getUserName,
  } = useProcessUserManager();

  const [process, setProcess] = useState<Process | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const loadProcess = async () => {
      await refreshProcesses();
    };
    
    loadProcess();
  }, [id]);

  useEffect(() => {
    if (!processes.length || !id || !user) return;
    
    // Aplicar as regras de permissão ao buscar um processo específico
    const filteredProcesses = filterProcesses({});
    const foundProcess = filteredProcesses.find(p => p.id === id);
    
    // Se o processo não foi encontrado na lista filtrada (que já aplicou as permissões),
    // significa que o usuário não tem permissão para vê-lo
    if (!foundProcess) {
      setProcess(null);
      return;
    }
    
    setProcess(foundProcess);
    
    if (foundProcess) {
      const userIds = foundProcess.history
        .map(h => h.userId)
        .filter(userId => userId && userId.length > 0);
      
      if (foundProcess.responsibleUser) {
        userIds.push(foundProcess.responsibleUser);
      }
      
      const uniqueUserIds = [...new Set(userIds)];
      if (uniqueUserIds.length > 0) {
        fetchUserNames(uniqueUserIds);
      }
    }
  }, [processes, id, user, filterProcesses]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    await refreshProcesses();
    setIsRefreshing(false);
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

  return (
    <div className="space-y-6">
      <ProcessHeader 
        protocolNumber={process.protocolNumber} 
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <ProcessDetailsContent 
        process={process}
        getUserName={getUserName}
        isRefreshing={isRefreshing}
      />

      <ProcessAutoRefresher 
        refreshFunction={handleRefresh} 
        intervalSeconds={30}
      />
    </div>
  );
};

export default ProcessDetails;
