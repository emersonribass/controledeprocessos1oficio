
import { Button } from "@/components/ui/button";
import { MoveLeft, MoveRight, Play, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/auth";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProcessActionButtonsProps {
  processId: string;
  moveProcessToPreviousDepartment: (processId: string) => void;
  moveProcessToNextDepartment: (processId: string) => void;
  isFirstDepartment: boolean;
  isLastDepartment: boolean;
  setIsEditing: (value: boolean) => void;
  isEditing: boolean;
  status: string;
  startProcess?: (processId: string) => Promise<void>;
  protocolNumber?: string;
  hasResponsibleUser?: boolean;
  onAccept?: () => void;
}

const ProcessActionButtons = ({
  processId,
  moveProcessToPreviousDepartment,
  moveProcessToNextDepartment,
  isFirstDepartment,
  isLastDepartment,
  setIsEditing,
  isEditing,
  status,
  startProcess,
  protocolNumber = "",
  hasResponsibleUser = false,
  onAccept
}: ProcessActionButtonsProps) => {
  const isNotStarted = status === "not_started";
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleAcceptProcess = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para aceitar processos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Verificar se o processo já tem um responsável
      const { data: processData, error: processError } = await supabase
        .from('processos')
        .select('*')
        .eq('id', processId)
        .single();

      if (processError) {
        throw processError;
      }

      if (processData.usuario_responsavel) {
        toast({
          title: "Aviso",
          description: "Este processo já possui um responsável.",
          variant: "destructive",
        });
        return;
      }

      // Atualizar o processo com o usuário responsável
      const { error: updateError } = await supabase
        .from('processos')
        .update({ 
          usuario_responsavel: user.id 
        } as any)
        .eq('id', processId);

      if (updateError) {
        throw updateError;
      }

      // Marcar notificações como respondidas
      const { error: notificationError } = await supabase
        .from('notificacoes')
        .update({ 
          respondida: true 
        } as any)
        .eq('processo_id', processId)
        .eq('usuario_id', user.id);

      if (notificationError) {
        console.error("Erro ao atualizar notificações:", notificationError);
      }

      toast({
        title: "Sucesso",
        description: `Você aceitou a responsabilidade pelo processo ${protocolNumber}.`,
      });

      // Chamar o callback de atualização
      if (onAccept) {
        onAccept();
      }
    } catch (error) {
      console.error("Erro ao aceitar processo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível aceitar o processo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Se o processo não foi iniciado, mostrar botão de iniciar
  if (isNotStarted) {
    return (
      <div className="flex justify-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => startProcess && startProcess(processId)} 
          title="Iniciar processo" 
          className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300 flex items-center gap-1"
        >
          <Play className="h-3 w-3" />
          Iniciar
        </Button>
      </div>
    );
  }
  
  // Se o processo não tem responsável, mostrar botão de aceitar
  if (!hasResponsibleUser) {
    return (
      <div className="flex justify-center gap-2">
        <Button
          onClick={handleAcceptProcess}
          disabled={isLoading || !user}
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
          size="sm"
        >
          <CheckCircle className="h-4 w-4" />
          {isLoading ? "Processando..." : "Aceitar Processo"}
        </Button>
      </div>
    );
  }
  
  // Se o processo já tem responsável, mostrar botões de movimento
  return (
    <div className="flex justify-center gap-2">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => moveProcessToPreviousDepartment(processId)} 
        disabled={isFirstDepartment} 
        title="Mover para departamento anterior"
        className={isFirstDepartment ? "opacity-50 cursor-not-allowed" : ""}
      >
        <MoveLeft className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => moveProcessToNextDepartment(processId)} 
        disabled={isLastDepartment} 
        title="Mover para próximo departamento"
        className={isLastDepartment ? "opacity-50 cursor-not-allowed" : ""}
      >
        <MoveRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ProcessActionButtons;
