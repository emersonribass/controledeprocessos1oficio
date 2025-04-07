
import { ProcessHistory as ProcessHistoryType } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ProcessHistoryProps = {
  history: ProcessHistoryType[];
  getDepartmentName: (id: string) => string;
  getUserName?: (id: string) => string;
};

const ProcessHistory = ({ history, getDepartmentName, getUserName }: ProcessHistoryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Histórico do Processo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((entry, index) => (
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
                    Responsável: {getUserName(entry.userId)}
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessHistory;
