
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProcesses } from "@/hooks/useProcesses";
import { useProcessMovement } from "@/hooks/useProcessMovement";
import { useToast } from "@/components/ui/use-toast";
import ProcessResponsibleInfo from "@/components/Processes/ProcessResponsibleInfo";
import ProcessDetailsHeader from "@/components/Processes/ProcessDetailsHeader";
import ProcessMainDetails from "@/components/Processes/ProcessMainDetails";
import ProcessDetailsTabs from "@/components/Processes/ProcessDetailsTabs";
import ProcessDetailsSkeleton from "@/components/Processes/ProcessDetailsSkeleton";
import ProcessDeadlineCard from "@/components/Processes/ProcessDeadlineCard";

const ProcessDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { processes, isLoading: isLoadingProcesses, getProcess, getDepartmentName, getProcessTypeName, refreshProcesses } = useProcesses();
  const [process, setProcess] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  
  // Criando adaptadores para converter Promise<boolean> para Promise<void>
  const adaptMoveToNext = async (processId: string): Promise<void> => {
    if (!id) return;
    await moveProcessToNextDepartment(processId);
  };
  
  const adaptMoveToPrevious = async (processId: string): Promise<void> => {
    if (!id) return;
    await moveProcessToPreviousDepartment(processId);
  };
  
  const adaptStartProcess = async (processId: string): Promise<void> => {
    if (!id) return;
    await startProcess(processId);
  };
  
  const { moveProcessToNextDepartment, moveProcessToPreviousDepartment, startProcess } = useProcessMovement(() => {
    refreshProcesses();
    loadProcess();
  });
  
  // Usando useCallback para evitar recriações desnecessárias da função
  const loadProcess = useCallback(async () => {
    if (!id) return;
    
    setIsLoading(true);
    setAccessDenied(false);
    
    try {
      console.log(`Carregando detalhes do processo: ${id}`);
      const processData = await getProcess(id);
      
      if (!processData) {
        console.error("Acesso negado ou processo não encontrado");
        setAccessDenied(true);
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para ver este processo ou ele não existe.",
          variant: "destructive"
        });
        return;
      }
      
      setProcess(processData);
    } catch (error) {
      console.error("Erro ao carregar processo:", error);
      setAccessDenied(true);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes do processo.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, getProcess, toast]);
  
  // Efeito para redirecionar se acesso negado
  useEffect(() => {
    if (accessDenied) {
      const timer = setTimeout(() => {
        navigate('/processes');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [accessDenied, navigate]);
  
  // Efeito para carregar o processo quando o id mudar
  useEffect(() => {
    if (!isLoadingProcesses && id) {
      loadProcess();
    }
  }, [id, isLoadingProcesses, loadProcess]);
  
  // Efeito para atualizar a lista de processos periodicamente com intervalo maior
  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshProcesses();
    }, 120000); // A cada 2 minutos para reduzir chamadas
    
    return () => clearInterval(intervalId);
  }, [refreshProcesses]);
  
  if (isLoading || !process) {
    return <ProcessDetailsSkeleton />;
  }
  
  if (accessDenied) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-800">
          <h2 className="text-lg font-semibold">Acesso negado</h2>
          <p>Você não tem permissão para visualizar este processo.</p>
          <p>Redirecionando para a lista de processos...</p>
        </div>
      </div>
    );
  }
  
  const isFirstDepartment = !process.history.some((item: any) => 
    item.departmentId !== process.currentDepartment && item.exitDate !== null
  );
  
  const isLastDepartment = process.currentDepartment === "10"; // ID do último departamento (concluído)
  
  // Verificar se o processo ainda não foi iniciado
  const isNotStarted = process.status === "not_started";
  
  return (
    <div className="container max-w-6xl mx-auto p-6">
      <ProcessDetailsHeader 
        process={process} 
        getProcessTypeName={getProcessTypeName} 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <ProcessMainDetails 
            process={process}
            getDepartmentName={getDepartmentName}
            getProcessTypeName={getProcessTypeName}
            moveProcessToPreviousDepartment={adaptMoveToPrevious}
            moveProcessToNextDepartment={adaptMoveToNext}
            isFirstDepartment={isFirstDepartment}
            isLastDepartment={isLastDepartment}
            isNotStarted={isNotStarted}
            startProcess={adaptStartProcess}
          />
          
          <ProcessDetailsTabs 
            process={process} 
            getDepartmentName={getDepartmentName} 
          />
        </div>
        
        <div>
          {process && process.id && process.currentDepartment && (
            <ProcessResponsibleInfo 
              key={`${process.id}-${process.currentDepartment}`}
              processId={process.id}
              protocolNumber={process.protocolNumber}
              sectorId={process.currentDepartment}
            />
          )}
          
          <ProcessDeadlineCard process={process} />
        </div>
      </div>
    </div>
  );
};

export default ProcessDetailsPage;
