
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, User } from "lucide-react";
import { useAuth } from "@/hooks/auth";
import { useProcessDetailsResponsibility } from "@/hooks/useProcessDetailsResponsibility";
import { memo } from "react";
import { useUserProfile } from "@/hooks/auth/useUserProfile";
import { useProcessResponsibility } from "@/hooks/useProcessResponsibility";

interface ProcessResponsibleInfoProps {
  processId: string;
  protocolNumber: string;
  sectorId: string;
}

const ProcessResponsibleInfo = memo(({
  processId,
  protocolNumber,
  sectorId
}: ProcessResponsibleInfoProps) => {
  const { user } = useAuth();
  const { userProfile } = useUserProfile();
  const { isUserProcessOwner } = useProcessResponsibility();
  
  // Usando o hook refatorado para gerenciar o estado dos responsáveis
  const {
    isLoading,
    processResponsible,
    sectorResponsible,
    handleAcceptResponsibility,
    isAccepting,
    process
  } = useProcessDetailsResponsibility(processId, sectorId);

  // Verifica se o usuário tem o setor atribuído ou é o dono do processo
  const isUserInSector = sectorId && userProfile?.setores_atribuidos?.includes(sectorId);
  const isOwner = user && process ? isUserProcessOwner(process, user.id) : false;
  const canAcceptResponsibility = !sectorResponsible && (isUserInSector || isOwner);

  if (isLoading) {
    return <Card>
        <CardHeader>
          <CardTitle>Responsáveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>;
  }

  return <Card>
      <CardHeader>
        <CardTitle>Responsáveis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Responsável pelo Processo</h3>
          {processResponsible ? <div className="flex items-center">
              <Badge variant="default" className="gap-1 px-2 py-1">
                <User className="h-3 w-3" />
                {processResponsible.nome}
              </Badge>
            </div> : <Badge variant="outline" className="text-muted-foreground">
              Sem responsável definido
            </Badge>}
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Responsável no Setor Atual</h3>
          {sectorResponsible ? <div className="flex items-center">
              <Badge variant="secondary" className="gap-1 px-2 py-1 bg-inherit">
                <User className="h-3 w-3" />
                {sectorResponsible.nome}
              </Badge>
            </div> : <div className="space-y-2">
              <Badge variant="outline" className="text-muted-foreground">
                Sem responsável no setor atual
              </Badge>
              
              {user && canAcceptResponsibility && <div className="mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleAcceptResponsibility(protocolNumber)} 
                    disabled={isAccepting}
                    title="Aceitar processo" 
                    className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300 flex items-center gap-1"
                  >
                    <CheckCircle className="h-3 w-3" />
                    {isAccepting ? "Processando..." : "Aceitar Processo"}
                  </Button>
                </div>}
            </div>}
        </div>
      </CardContent>
    </Card>;
});

// Adicionando displayName para facilitar debugging
ProcessResponsibleInfo.displayName = 'ProcessResponsibleInfo';
export default ProcessResponsibleInfo;
