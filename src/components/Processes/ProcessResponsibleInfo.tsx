
import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProcessResponsibility } from "@/hooks/useProcessResponsibility";
import { useAuth } from "@/hooks/auth";
import AcceptProcessResponsibilityButton from "./AcceptProcessResponsibilityButton";
import { User } from "lucide-react";

interface ProcessResponsibleInfoProps {
  processId: string;
  protocolNumber: string;
  sectorId: string;
}

const ProcessResponsibleInfo = ({
  processId,
  protocolNumber,
  sectorId,
}: ProcessResponsibleInfoProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [processResponsible, setProcessResponsible] = useState<any>(null);
  const [sectorResponsible, setSectorResponsible] = useState<any>(null);
  const { getProcessResponsible, getSectorResponsible } = useProcessResponsibility();
  const { user } = useAuth();

  // Usando useCallback para evitar recriações desnecessárias da função
  const loadResponsibles = useCallback(async () => {
    if (!processId || !sectorId) return;
    
    setIsLoading(true);
    try {
      // Executando as chamadas em paralelo para melhorar a performance
      const processResp = await getProcessResponsible(processId);
      const sectorResp = await getSectorResponsible(processId, sectorId);
      
      setProcessResponsible(processResp);
      setSectorResponsible(sectorResp);
    } catch (error) {
      console.error("Erro ao carregar responsáveis:", error);
    } finally {
      setIsLoading(false);
    }
  }, [processId, sectorId, getProcessResponsible, getSectorResponsible]);

  // Carrega os responsáveis apenas quando os IDs mudam
  useEffect(() => {
    loadResponsibles();
  }, [loadResponsibles]);

  const handleResponsibilityAccepted = useCallback(() => {
    loadResponsibles();
  }, [loadResponsibles]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Responsáveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Responsáveis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Responsável pelo Processo</h3>
          {processResponsible ? (
            <div className="flex items-center">
              <Badge variant="default" className="gap-1 px-2 py-1">
                <User className="h-3 w-3" />
                {processResponsible.nome}
              </Badge>
            </div>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              Sem responsável definido
            </Badge>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Responsável no Setor Atual</h3>
          {sectorResponsible ? (
            <div className="flex items-center">
              <Badge variant="secondary" className="gap-1 px-2 py-1">
                <User className="h-3 w-3" />
                {sectorResponsible.nome}
              </Badge>
            </div>
          ) : (
            <div className="space-y-2">
              <Badge variant="outline" className="text-muted-foreground">
                Sem responsável no setor atual
              </Badge>
              
              {user && !sectorResponsible && (
                <div className="mt-2">
                  <AcceptProcessResponsibilityButton
                    processId={processId}
                    protocolNumber={protocolNumber}
                    sectorId={sectorId}
                    hasResponsibleUser={!!sectorResponsible}
                    onAccept={handleResponsibilityAccepted}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessResponsibleInfo;
