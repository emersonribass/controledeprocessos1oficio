import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useProcesses } from "@/hooks/useProcesses";
import { useProcessMovement } from "@/hooks/useProcessMovement";
import ProcessResponsibleInfo from "@/components/Processes/ProcessResponsibleInfo";
import ProcessDetailsHeader from "@/components/Processes/ProcessDetailsHeader";
import ProcessMainDetails from "@/components/Processes/ProcessMainDetails";
import ProcessDetailsTabs from "@/components/Processes/ProcessDetailsTabs";
import ProcessDetailsSkeleton from "@/components/Processes/ProcessDetailsSkeleton";
import ProcessDeadlineCard from "@/components/Processes/ProcessDeadlineCard";
import { useDeadlineRenewalCondition } from "@/hooks/useDeadlineRenewalCondition";

const ProcessDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { processes, isLoading: isLoadingProcesses, getProcess, getDepartmentName, getProcessTypeName, refreshProcesses } = useProcesses();
  const [process, setProcess] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
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
  
  const loadProcess = useCallback(async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const processData = await getProcess(id);
      setProcess(processData);
    } catch (error) {
      console.error("Erro ao carregar processo:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id, getProcess]);
  
  useEffect(() => {
    if (!isLoadingProcesses && id) {
      loadProcess();
    }
  }, [id, isLoadingProcesses, loadProcess]);
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshProcesses();
    }, 120000);
    
    return () => clearInterval(intervalId);
  }, [refreshProcesses]);
  
  const { canRenewDeadline, historyId } = useDeadlineRenewalCondition(process);

  if (isLoading || !process) {
    return <ProcessDetailsSkeleton />;
  }
  
  const isFirstDepartment = !process.history.some((item: any) => 
    item.departmentId !== process.currentDepartment && item.exitDate !== null
  );
  
  const isLastDepartment = process.currentDepartment === "10";
  
  const isNotStarted = process.status === "not_started";
  const isOverdue = process.status === "overdue";
  
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
            canRenewDeadline={canRenewDeadline}
            renewalHistoryId={historyId}
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
