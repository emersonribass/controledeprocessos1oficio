
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/hooks/use-toast";

interface AcceptProcessButtonProps {
  processId: string;
  protocolNumber: string;
  currentDepartmentId?: string;
  onAccept?: () => void;
}

const AcceptProcessButton = ({
  processId,
  protocolNumber,
  currentDepartmentId,
  onAccept
}: AcceptProcessButtonProps) => {
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
        })
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

  return (
    <Button
      onClick={handleAcceptProcess}
      disabled={isLoading || !user}
      className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
      size="sm"
    >
      <CheckCircle className="h-4 w-4" />
      {isLoading ? "Processando..." : "Aceitar Processo"}
    </Button>
  );
};

export default AcceptProcessButton;
