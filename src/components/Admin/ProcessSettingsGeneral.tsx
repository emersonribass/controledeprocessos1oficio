
import { useState, useEffect } from "react";
import { useProcesses } from "@/hooks/useProcesses";
import { Process } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import NotStartedProcessList from "./NotStartedProcessList";
import DeleteProcessDialog from "./DeleteProcessDialog";
import { useMultipleSelection } from "@/hooks/useMultipleSelection";

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
  const [processToDelete, setProcessToDelete] = useState<string | null>(null);
  const [isBatchDeleteOpen, setIsBatchDeleteOpen] = useState(false);
  const [isFiltering, setIsFiltering] = useState(true);
  
  // Usar o hook personalizado para gerenciar a seleção múltipla
  const { 
    selectedItems: selectedProcesses, 
    selectAllChecked, 
    toggleItemSelection: toggleProcessSelection, 
    toggleSelectAll,
    clearSelection
  } = useMultipleSelection<Process>(notStartedProcesses);
  
  useEffect(() => {
    // Usar filterProcesses para aplicar as regras de permissão e então filtrar os não iniciados
    const loadFilteredProcesses = async () => {
      setIsFiltering(true);
      try {
        const filteredProcesses = await filterProcesses({});
        const notStarted = filteredProcesses.filter(p => p.status === 'not_started');
        setNotStartedProcesses(notStarted);
      } catch (error) {
        console.error("Erro ao filtrar processos:", error);
        setNotStartedProcesses([]);
      } finally {
        setIsFiltering(false);
      }
    };
    
    loadFilteredProcesses();
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
      await deleteManyProcesses(selectedProcesses.map(process => process.id));
      clearSelection();
      setIsBatchDeleteOpen(false);
    }
  };
  
  if (isLoading || isFiltering) {
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
        {notStartedProcesses.length > 0 && selectedProcesses.length > 0 && (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => setIsBatchDeleteOpen(true)}
            className="gap-1"
          >
            <Trash2 className="h-4 w-4" />
            Excluir Selecionados ({selectedProcesses.length})
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <NotStartedProcessList 
          processes={notStartedProcesses}
          onStartProcess={handleStartProcess}
          onDeleteProcess={setProcessToDelete}
          selectedProcesses={selectedProcesses.map(p => p.id)}
          onToggleSelect={process => toggleProcessSelection(notStartedProcesses.find(p => p.id === process)!)}
          selectAllChecked={selectAllChecked}
          onToggleSelectAll={toggleSelectAll}
        />
        
        {/* Diálogo de confirmação para exclusão de um único processo */}
        <DeleteProcessDialog 
          open={!!processToDelete}
          onOpenChange={(open) => !open && setProcessToDelete(null)}
          onConfirm={handleDeleteProcess}
          title="Tem certeza?"
          description="Esta ação não pode ser desfeita. O processo será permanentemente excluído do sistema."
          confirmButtonText="Excluir Processo"
        />
        
        {/* Diálogo de confirmação para exclusão em lote */}
        <DeleteProcessDialog 
          open={isBatchDeleteOpen}
          onOpenChange={setIsBatchDeleteOpen}
          onConfirm={handleBatchDelete}
          title={`Excluir ${selectedProcesses.length} processos?`}
          description="Esta ação não pode ser desfeita. Os processos selecionados serão permanentemente excluídos do sistema."
          confirmButtonText={`Excluir ${selectedProcesses.length} Processos`}
        />
      </CardContent>
    </Card>
  );
};

export default ProcessSettingsGeneral;
