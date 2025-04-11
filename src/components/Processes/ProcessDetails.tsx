
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";

const ProcessDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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
  const [currentSectorResponsible, setCurrentSectorResponsible] = useState<string | null>(null);
  const [isMainResponsible, setIsMainResponsible] = useState(false);
  const [isSectorResponsible, setIsSectorResponsible] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const loadProcess = async () => {
      await refreshProcesses();
      await fetchResponsibleUser(id);
    };
    
    loadProcess();
  }, [id]);

  useEffect(() => {
    if (!processes.length || !id || !user) return;
    
    const foundProcess = processes.find(p => p.id === id);
    setProcess(foundProcess || null);
    
    // Verificar se o usuário atual é o responsável principal
    if (foundProcess && responsibleUser) {
      setIsMainResponsible(user.id === responsibleUser);
    }

    // Buscar o responsável do setor atual
    const fetchSectorResponsible = async () => {
      if (!foundProcess) return;
      
      try {
        const { data, error } = await supabase
          .from('processos_historico')
          .select('usuario_responsavel_setor')
          .eq('processo_id', id)
          .eq('setor_id', foundProcess.currentDepartment)
          .is('data_saida', null)
          .maybeSingle();

        if (error) {
          console.error('Erro ao buscar responsável do setor:', error);
          return;
        }

        if (data && data.usuario_responsavel_setor) {
          setCurrentSectorResponsible(data.usuario_responsavel_setor);
          setIsSectorResponsible(data.usuario_responsavel_setor === user.id);
        }
      } catch (error) {
        console.error('Erro ao processar responsável do setor:', error);
      }
    };

    fetchSectorResponsible();
    
    if (foundProcess) {
      const userIds = foundProcess.history
        .map(h => h.userId)
        .filter(userId => userId && userId.length > 0);
      
      if (responsibleUser) {
        userIds.push(responsibleUser);
      }
      
      if (currentSectorResponsible) {
        userIds.push(currentSectorResponsible);
      }
      
      const uniqueUserIds = [...new Set(userIds)];
      if (uniqueUserIds.length > 0) {
        fetchUserNames(uniqueUserIds);
      }
    }
  }, [processes, id, responsibleUser, user, currentSectorResponsible]);

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

  const hasResponsibleUser = !!currentSectorResponsible;
  const mainResponsibleUserName = responsibleUser ? getUserName(responsibleUser) : undefined;
  const sectorResponsibleUserName = currentSectorResponsible ? getUserName(currentSectorResponsible) : undefined;

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
        mainResponsibleUserName={mainResponsibleUserName}
        sectorResponsibleUserName={sectorResponsibleUserName}
        isRefreshing={isRefreshing}
        onProcessAccepted={handleProcessAccepted}
        hasResponsibleUser={hasResponsibleUser}
        isMainResponsible={isMainResponsible}
        isSectorResponsible={isSectorResponsible}
        currentDepartmentId={process.currentDepartment}
      />

      <ProcessAutoRefresher 
        refreshFunction={handleRefresh} 
        intervalSeconds={30}
      />
    </div>
  );
};

export default ProcessDetails;
