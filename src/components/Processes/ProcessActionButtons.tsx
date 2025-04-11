
import React from 'react';
import { Button } from "@/components/ui/button";
import { MoveLeft, MoveRight, Play, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/auth";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PROCESS_STATUS } from "@/types";

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
  currentDepartmentId?: string;
  isMainResponsible?: boolean;
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
  onAccept,
  currentDepartmentId,
  isMainResponsible = false
}: ProcessActionButtonsProps) => {
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
      // Verificar se o processo já tem um responsável de setor
      const { data: historico, error: historicoError } = await supabase
        .from('processos_historico')
        .select('*')
        .eq('processo_id', processId)
        .eq('setor_id', currentDepartmentId || '')
        .is('data_saida', null)
        .maybeSingle();

      if (historicoError) {
        console.error("Erro ao buscar histórico do processo:", historicoError);
      }

      if (historico && historico.usuario_responsavel_setor) {
        toast({
          title: "Aviso",
          description: "Este processo já possui um responsável neste setor.",
          variant: "destructive",
        });
        return;
      }

      // Atualizar o histórico do processo com o responsável do setor atual
      if (historico) {
        const { error: updateError } = await supabase
          .from('processos_historico')
          .update({ 
            usuario_responsavel_setor: user.id 
          })
          .eq('id', historico.id);

        if (updateError) {
          throw updateError;
        }
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
        description: `Você aceitou a responsabilidade pelo processo ${protocolNumber} neste setor.`,
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
  
  // Se o processo não foi iniciado, mostrar apenas botão de iniciar
  if (status === PROCESS_STATUS.NOT_STARTED) {
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
  
  // Se o usuário é o responsável principal ou responsável pelo setor, mostrar botões de movimento
  if (isMainResponsible || hasResponsibleUser) {
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
  }
  
  // Se o processo ainda não tem responsável no setor atual, mostrar botão de aceitar
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
};

export default ProcessActionButtons;
