
import { HistoryEntry } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, User, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AcceptProcessButton from "./AcceptProcessButton";
import { useAuth } from "@/hooks/auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type ProcessHistoryProps = {
  history: HistoryEntry[];
  getDepartmentName: (id: string) => string;
  getUserName?: (id: string) => string;
  processId: string;
  protocolNumber: string;
  hasResponsibleUser: boolean;
  onProcessAccepted: () => void;
  currentDepartmentId?: string;
};

interface HistoryEntryWithSectorResponsible extends HistoryEntry {
  usuario_responsavel_setor?: string | null;
}

const ProcessHistory = ({ 
  history, 
  getDepartmentName, 
  getUserName,
  processId,
  protocolNumber,
  hasResponsibleUser,
  onProcessAccepted,
  currentDepartmentId
}: ProcessHistoryProps) => {
  const { user } = useAuth();
  const [historyWithResponsibles, setHistoryWithResponsibles] = useState<HistoryEntryWithSectorResponsible[]>([]);

  useEffect(() => {
    // Buscar os dados completos do histórico, incluindo responsáveis de setor
    const fetchHistoryWithResponsibles = async () => {
      try {
        const { data, error } = await supabase
          .from('processos_historico')
          .select('*')
          .eq('processo_id', processId);

        if (error) {
          console.error('Erro ao buscar histórico completo:', error);
          return;
        }

        // Mapear os dados do banco para o formato de HistoryEntry
        const completeHistory = data.map(item => ({
          id: item.id,
          processId: item.processo_id,
          departmentId: item.setor_id,
          userId: item.usuario_id,
          userName: getUserName ? getUserName(item.usuario_id) : "Usuário",
          entryDate: item.data_entrada,
          exitDate: item.data_saida,
          usuario_responsavel_setor: item.usuario_responsavel_setor
        }));

        setHistoryWithResponsibles(completeHistory);
      } catch (error) {
        console.error('Erro ao processar histórico:', error);
      }
    };

    fetchHistoryWithResponsibles();
  }, [processId, getUserName, history]);
  
  // Verificar se o usuário está no departamento atual
  const currentDeptEntry = history.find(entry => !entry.exitDate);
  const isUserInCurrentDept = user && user.departments.includes(currentDeptEntry?.departmentId || "");
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Histórico do Processo
        </CardTitle>
        {isUserInCurrentDept && (
          <AcceptProcessButton 
            processId={processId}
            protocolNumber={protocolNumber}
            hasResponsibleUser={hasResponsibleUser}
            onAccept={onProcessAccepted}
            departmentId={currentDepartmentId}
          />
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {historyWithResponsibles.map((entry, index) => {
            const sectorResponsibleName = entry.usuario_responsavel_setor && getUserName ? 
              getUserName(entry.usuario_responsavel_setor) : null;
            
            return (
            <div key={index} className="relative pl-6 pb-4">
              <div className="absolute left-0 top-0 h-full w-px bg-border"></div>
              <div className="absolute left-0 top-1 h-2 w-2 rounded-full bg-primary"></div>
              <div className="space-y-1">
                <p className="font-medium">
                  {getDepartmentName(entry.departmentId)}
                </p>
                {entry.userId && getUserName && (
                  <p className="text-sm flex items-center">
                    <User className="h-3 w-3 mr-1" /> 
                    Responsável principal: {getUserName(entry.userId)}
                  </p>
                )}
                {sectorResponsibleName && (
                  <p className="text-sm flex items-center">
                    <Users className="h-3 w-3 mr-1" /> 
                    Responsável no setor: {sectorResponsibleName}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Entrada: {format(new Date(entry.entryDate), "dd/MM/yyyy", { locale: ptBR })}
                </p>
                {entry.exitDate && (
                  <p className="text-sm text-muted-foreground">
                    Saída: {format(new Date(entry.exitDate), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                )}
              </div>
            </div>
          )})}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessHistory;
