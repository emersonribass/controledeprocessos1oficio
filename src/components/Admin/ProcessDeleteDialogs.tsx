
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface ProcessDeleteDialogsProps {
  processToDelete: string | null;
  isBatchDeleteOpen: boolean;
  selectedCount: number;
  onCloseDeleteDialog: () => void;
  onCloseBatchDialog: (open: boolean) => void;
  onConfirmDelete: () => void;
  onConfirmBatchDelete: () => void;
}

const ProcessDeleteDialogs = ({
  processToDelete,
  isBatchDeleteOpen,
  selectedCount,
  onCloseDeleteDialog,
  onCloseBatchDialog,
  onConfirmDelete,
  onConfirmBatchDelete
}: ProcessDeleteDialogsProps) => {
  return (
    <>
      {/* Diálogo de confirmação para exclusão de um único processo */}
      <AlertDialog 
        open={!!processToDelete} 
        onOpenChange={(open) => !open && onCloseDeleteDialog()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O processo será permanentemente excluído do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmDelete} className="bg-red-600 hover:bg-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Processo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Diálogo de confirmação para exclusão em lote */}
      <AlertDialog open={isBatchDeleteOpen} onOpenChange={onCloseBatchDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {selectedCount} processos?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Os processos selecionados serão permanentemente excluídos do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmBatchDelete} className="bg-red-600 hover:bg-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir {selectedCount} Processos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProcessDeleteDialogs;
