import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";

interface AcceptProcessButtonProps {
  processId: string;
  protocolNumber: string;
  hasResponsibleUser: boolean;
  onAccept: () => void;
}

const AcceptProcessButton = ({
  processId,
  protocolNumber,
  hasResponsibleUser,
  onAccept,
}: AcceptProcessButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

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
      onAccept();
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

  if (hasResponsibleUser) {
    return null;
  }

  return (
    <Button
      onClick={handleAcceptProcess}
      disabled={isLoading || !user}
      className="bg-green-600 hover:bg-green-700"
      size="sm"
    >
      <CheckCircle className="mr-2 h-4 w-4" />
      {isLoading ? "Processando..." : "Aceitar Processo"}
    </Button>
  );
};

export default AcceptProcessButton;
