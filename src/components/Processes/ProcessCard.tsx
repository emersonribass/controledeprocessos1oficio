
import { Process } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { MoveLeft, MoveRight, User, CheckCircle } from "lucide-react";
import ProcessStatusBadge from "./ProcessStatusBadge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/hooks/use-toast";

type ProcessCardProps = {
  process: Process;
  getProcessTypeName: (id: string) => string;
  getDepartmentName: (id: string) => string;
  moveProcessToNextDepartment: (processId: string) => void;
  moveProcessToPreviousDepartment: (processId: string) => void;
  responsibleUserName?: string;
};

const ProcessCard = ({
  process,
  getProcessTypeName,
  getDepartmentName,
  moveProcessToNextDepartment,
  moveProcessToPreviousDepartment,
  responsibleUserName
}: ProcessCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAccepting, setIsAccepting] = useState(false);
  const [hasResponsibleUser, setHasResponsibleUser] = useState(!!responsibleUserName);

  useEffect(() => {
    setHasResponsibleUser(!!responsibleUserName);
  }, [responsibleUserName]);
  
  // Verificar se o processo está no setor "Concluído(a)" usando o ID 10
  const isLastDepartment = process.currentDepartment === "10";
  const isFirstDepartment = process.currentDepartment === "1";
  
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
        .eq('id', process.id)
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
        setHasResponsibleUser(true);
        return;
      }

      // Atualizar o processo com o usuário responsável
      const { error: updateError } = await supabase
        .from('processos')
        .update({ 
          usuario_responsavel: user.id 
        } as any)
        .eq('id', process.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Sucesso",
        description: `Você aceitou a responsabilidade pelo processo ${process.protocolNumber}.`,
      });
      
      setHasResponsibleUser(true);
      
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
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Protocolo: {process.protocolNumber}</span>
          <ProcessStatusBadge status={process.status} />
        </CardTitle>
        <CardDescription>
          Tipo: {getProcessTypeName(process.processType)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Departamento Atual
            </h3>
            <p className="font-medium">
              {getDepartmentName(process.currentDepartment)}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Data de Início
            </h3>
            <p className="font-medium">
              {format(new Date(process.startDate), "dd/MM/yyyy", {
                locale: ptBR
              })}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Tempo de Processamento
            </h3>
            <p className="font-medium">
              {formatDistanceToNow(new Date(process.startDate), {
                locale: ptBR
              })}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Previsão de Conclusão
            </h3>
            <p className="font-medium">
              {format(new Date(process.expectedEndDate), "dd/MM/yyyy", {
                locale: ptBR
              })}
            </p>
          </div>
          {responsibleUserName && (
            <div className="col-span-2">
              <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                <User className="h-4 w-4 mr-1" /> Responsável
              </h3>
              <p className="font-medium">
                {responsibleUserName}
              </p>
            </div>
          )}
        </div>
      </CardContent>
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
              onClick={() => moveProcessToPreviousDepartment(process.id)} 
              disabled={isFirstDepartment} 
              className={`text-white gap-0 bg-green-600 hover:bg-green-500 ${isFirstDepartment ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <MoveLeft className="mr-2 h-4 w-4" />
              Departamento Anterior
            </Button>
            <Button 
              onClick={() => moveProcessToNextDepartment(process.id)} 
              disabled={isLastDepartment} 
              className={`gap-0 ${isLastDepartment ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Próximo Departamento
              <MoveRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProcessCard;
