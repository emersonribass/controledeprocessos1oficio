
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { CheckCircle, MoveLeft, MoveRight } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/hooks/use-toast";

type ProcessCardFooterProps = {
  processId: string;
  protocolNumber: string;
  hasResponsibleUser: boolean;
  isFirstDepartment: boolean;
  isLastDepartment: boolean;
  moveProcessToNextDepartment: (processId: string) => void;
  moveProcessToPreviousDepartment: (processId: string) => void;
  onProcessAccepted?: () => void;
};

const ProcessCardFooter = ({
  processId,
  protocolNumber,
  hasResponsibleUser,
  isFirstDepartment,
  isLastDepartment,
  moveProcessToNextDepartment,
  moveProcessToPreviousDepartment,
  onProcessAccepted,
}: ProcessCardFooterProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAcceptProcess = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para aceitar processos.",
        variant: "destructive",
      });
      return;
    }

    setIsAccepting(true);

    try {
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

      toast({
        title: "Sucesso",
        description: `Você aceitou a responsabilidade pelo processo ${protocolNumber}.`,
      });
      
      if (onProcessAccepted) {
        onProcessAccepted();
      }
      
      // Atualizar a interface para mostrar as setas de movimentação
      window.location.reload();
    } catch (error) {
      console.error("Erro ao aceitar processo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível aceitar o processo.",
        variant: "destructive",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <CardFooter className="flex justify-between">
      {!hasResponsibleUser ? (
        <Button 
          onClick={handleAcceptProcess}
          disabled={isAccepting}
          className="w-full bg-green-600 hover:bg-green-500"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          {isAccepting ? "Processando..." : "Aceitar Processo"}
        </Button>
      ) : (
        <>
          <Button 
            variant="outline" 
            onClick={() => moveProcessToPreviousDepartment(processId)} 
            disabled={isFirstDepartment} 
            className={`text-white gap-0 bg-green-600 hover:bg-green-500 ${isFirstDepartment ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <MoveLeft className="mr-2 h-4 w-4" />
            Departamento Anterior
          </Button>
          <Button 
            onClick={() => moveProcessToNextDepartment(processId)} 
            disabled={isLastDepartment} 
            className={`gap-0 ${isLastDepartment ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Próximo Departamento
            <MoveRight className="ml-2 h-4 w-4" />
          </Button>
        </>
      )}
    </CardFooter>
  );
};

export default ProcessCardFooter;
