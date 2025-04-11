
import { useState, useEffect } from "react";
import { useProcesses } from "@/hooks/useProcesses";
import { Process, PROCESS_STATUS } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import ProcessNotStartedList from "./ProcessNotStartedList";
import ProcessDeleteDialogs from "./ProcessDeleteDialogs";

const ProcessSettingsGeneral = () => {
  const {
    processes,
    isLoading,
    updateProcessStatus,
    filterProcesses,
    deleteProcess,
    deleteManyProcesses
  } = useProcesses();
  
  const [notStartedProcesses, setNotStartedProcesses] = useState<Process[]>([]);
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
  const [processToDelete, setProcessToDelete] = useState<string | null>(null);
  const [isBatchDeleteOpen, setIsBatchDeleteOpen] = useState(false);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  
  useEffect(() => {
    // Usar filterProcesses para aplicar as regras de permissão e então filtrar os não iniciados
    const filteredProcesses = filterProcesses({});
    const notStarted = filteredProcesses.filter(p => p.status === PROCESS_STATUS.NOT_STARTED);
    setNotStartedProcesses(notStarted);
  }, [processes, filterProcesses]);
  
  const handleStartProcess = async (processId: string) => {
    try {
      await updateProcessStatus(processId, "Em andamento");
    } catch (error) {
      console.error("Erro ao iniciar processo:", error);
    }
  };
  
  const handleDeleteProcess = async () => {
    if (processToDelete) {
      await deleteProcess(processToDelete);
      setProcessToDelete(null);
    }
  };
  
  const handleBatchDelete = async () => {
    if (selectedProcesses.length > 0) {
      await deleteManyProcesses(selectedProcesses);
      setSelectedProcesses([]);
      setSelectAllChecked(false);
      setIsBatchDeleteOpen(false);
    }
  };
  
  const toggleSelectAll = () => {
    if (selectAllChecked) {
      setSelectedProcesses([]);
    } else {
      setSelectedProcesses(notStartedProcesses.map(p => p.id));
    }
    setSelectAllChecked(!selectAllChecked);
  };
  
  const toggleProcessSelection = (processId: string) => {
    if (selectedProcesses.includes(processId)) {
      setSelectedProcesses(selectedProcesses.filter(id => id !== processId));
      setSelectAllChecked(false);
    } else {
      setSelectedProcesses([...selectedProcesses, processId]);
      // Verificar se todos os processos estão selecionados agora
      if (selectedProcesses.length + 1 === notStartedProcesses.length) {
        setSelectAllChecked(true);
      }
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Processos Não Iniciados</CardTitle>
          <CardDescription>
            Lista de processos cadastrados que ainda não foram iniciados
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ProcessNotStartedList 
          processes={notStartedProcesses}
          selectedProcesses={selectedProcesses}
          selectAllChecked={selectAllChecked}
          onToggleSelectAll={toggleSelectAll}
          onToggleProcessSelection={toggleProcessSelection}
          onStartProcess={handleStartProcess}
          onDeleteProcess={setProcessToDelete}
          onBatchDelete={() => setIsBatchDeleteOpen(true)}
        />
        
        <ProcessDeleteDialogs 
          processToDelete={processToDelete}
          isBatchDeleteOpen={isBatchDeleteOpen}
          selectedCount={selectedProcesses.length}
          onCloseDeleteDialog={() => setProcessToDelete(null)}
          onCloseBatchDialog={setIsBatchDeleteOpen}
          onConfirmDelete={handleDeleteProcess}
          onConfirmBatchDelete={handleBatchDelete}
        />
      </CardContent>
    </Card>
  );
};

export default ProcessSettingsGeneral;
