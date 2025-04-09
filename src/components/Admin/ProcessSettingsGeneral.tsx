
import { useState, useEffect } from "react";
import { useProcesses } from "@/hooks/useProcesses";
import { Process } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, ArrowRight, Play, Trash2, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";

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
  
  const navigate = useNavigate();
  
  useEffect(() => {
    // Usar filterProcesses para aplicar as regras de permissão e então filtrar os não iniciados
    const filteredProcesses = filterProcesses({});
    const notStarted = filteredProcesses.filter(p => p.status === 'not_started');
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
        {notStartedProcesses.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">
              Não há processos aguardando início
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center py-2 px-4 border-b">
              <div className="flex items-center mr-4">
                <Checkbox 
                  id="select-all"
                  checked={selectAllChecked}
                  onCheckedChange={toggleSelectAll}
                />
                <label htmlFor="select-all" className="ml-2 text-sm font-medium">
                  Selecionar todos
                </label>
              </div>
            </div>
            
            {notStartedProcesses.map(process => (
              <div key={process.id} className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex items-center">
                  <Checkbox
                    id={`process-${process.id}`}
                    checked={selectedProcesses.includes(process.id)}
                    onCheckedChange={() => toggleProcessSelection(process.id)}
                    className="mr-4"
                  />
                  <div>
                    <h4 className="font-medium">{process.protocolNumber}</h4>
                    <p className="text-sm text-muted-foreground">
                      Cadastrado {formatDistanceToNow(new Date(process.startDate), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate(`/processes/${process.id}`)} 
                    className="rounded-lg text-white bg-green-600 hover:bg-green-500"
                  >
                    Detalhes
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleStartProcess(process.id)} 
                    className="gap-1 text-white text-center font-medium rounded-lg"
                  >
                    <Play className="h-4 w-4" />
                    Iniciar
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => setProcessToDelete(process.id)} 
                    className="gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Diálogo de confirmação para exclusão de um único processo */}
        <AlertDialog open={!!processToDelete} onOpenChange={(open) => !open && setProcessToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. O processo será permanentemente excluído do sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteProcess} className="bg-red-600 hover:bg-red-700">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Processo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Diálogo de confirmação para exclusão em lote */}
        <AlertDialog open={isBatchDeleteOpen} onOpenChange={setIsBatchDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir {selectedProcesses.length} processos?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Os processos selecionados serão permanentemente excluídos do sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleBatchDelete} className="bg-red-600 hover:bg-red-700">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir {selectedProcesses.length} Processos
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default ProcessSettingsGeneral;
