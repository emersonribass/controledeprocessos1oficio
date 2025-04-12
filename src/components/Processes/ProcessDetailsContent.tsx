
import React, { useState, useCallback } from "react";
import { Process } from "@/types";
import ProcessCard from "./ProcessCard";
import ProcessHistory from "./ProcessHistory";
import { useProcessResponsibility } from "@/hooks/useProcessResponsibility";
import { useProcesses } from "@/features/processes";

// Interface de apresentação pura, sem lógica de negócio
export interface ProcessDetailsContentPresentationProps {
  process: Process;
  getUserName: (userId: string) => string;
  isRefreshing: boolean;
  getDepartmentName: (id: string) => string; 
  getProcessTypeName: (id: string) => string;
  moveProcessToNextDepartment: (processId: string) => void;
  moveProcessToPreviousDepartment: (processId: string) => void;
  mainResponsibleUserName: string | null;
  sectorResponsibleUserName: string | null;
  isMainResponsible: boolean;
  isSectorResponsible: boolean;
  hasResponsibleUser: boolean;
  onProcessAccepted: () => Promise<void>;
}

// Componente de apresentação pura memoizado para evitar re-renderizações desnecessárias
export const ProcessDetailsContentPresentation = React.memo(({
  process,
  getUserName,
  isRefreshing,
  getDepartmentName,
  getProcessTypeName,
  moveProcessToNextDepartment,
  moveProcessToPreviousDepartment,
  mainResponsibleUserName,
  sectorResponsibleUserName,
  isMainResponsible,
  isSectorResponsible,
  hasResponsibleUser,
  onProcessAccepted
}: ProcessDetailsContentPresentationProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <ProcessCard
        process={process}
        getDepartmentName={getDepartmentName}
        getProcessTypeName={getProcessTypeName}
        moveProcessToNextDepartment={moveProcessToNextDepartment}
        moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
        mainResponsibleUserName={mainResponsibleUserName}
        sectorResponsibleUserName={sectorResponsibleUserName}
        isMainResponsible={isMainResponsible}
        isSectorResponsible={isSectorResponsible}
        showLabels={true}
      />

      <ProcessHistory 
        history={process.history} 
        getDepartmentName={getDepartmentName} 
        getUserName={getUserName}
        processId={process.id}
        protocolNumber={process.protocolNumber}
        hasResponsibleUser={hasResponsibleUser}
        onProcessAccepted={onProcessAccepted}
        currentDepartmentId={process.currentDepartment}
      />
    </div>
  );
});

ProcessDetailsContentPresentation.displayName = 'ProcessDetailsContentPresentation';

// Componente container que gerencia a lógica
const ProcessDetailsContent = ({
  process,
  getUserName,
  isRefreshing,
}: {
  process: Process;
  getUserName: (userId: string) => string;
  isRefreshing: boolean;
}) => {
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Usar o contexto de processos para acessar funções e dados
  const { 
    getDepartmentName, 
    getProcessTypeName,
    moveProcessToNextDepartment,
    moveProcessToPreviousDepartment
  } = useProcesses();
  
  // Usar o hook de responsabilidade
  const {
    isMainResponsible,
    isSectorResponsible,
    hasResponsibleUser,
    mainResponsibleUserName,
    sectorResponsibleUserName,
    refreshResponsibility,
    acceptProcess
  } = useProcessResponsibility({ processId: process.id });

  const handleProcessAccepted = useCallback(async () => {
    const success = await acceptProcess();
    if (success) {
      await refreshResponsibility();
      setRefreshKey(prev => prev + 1);
    }
  }, [acceptProcess, refreshResponsibility]);

  return (
    <ProcessDetailsContentPresentation
      key={refreshKey}
      process={process}
      getUserName={getUserName}
      isRefreshing={isRefreshing}
      getDepartmentName={getDepartmentName}
      getProcessTypeName={getProcessTypeName}
      moveProcessToNextDepartment={moveProcessToNextDepartment}
      moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
      mainResponsibleUserName={mainResponsibleUserName}
      sectorResponsibleUserName={sectorResponsibleUserName}
      isMainResponsible={isMainResponsible}
      isSectorResponsible={isSectorResponsible}
      hasResponsibleUser={hasResponsibleUser}
      onProcessAccepted={handleProcessAccepted}
    />
  );
};

export default ProcessDetailsContent;
