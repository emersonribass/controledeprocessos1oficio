
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, User } from "lucide-react";

interface ProcessDetailsTabsProps {
  process: any;
  getDepartmentName: (id: string) => string;
}

const ProcessDetailsTabs = ({ process, getDepartmentName }: ProcessDetailsTabsProps) => {
  return (
    <Tabs defaultValue="history" className="mt-6">
      <TabsList>
        <TabsTrigger value="history">Histórico</TabsTrigger>
        <TabsTrigger value="documents">Documentos</TabsTrigger>
        <TabsTrigger value="notes">Anotações</TabsTrigger>
      </TabsList>
      
      <TabsContent value="history" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Histórico do Processo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {process.history.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  Nenhum histórico disponível
                </p>
              ) : (
                process.history
                  .sort((a: any, b: any) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime())
                  .map((entry: any, index: number) => (
                    <div key={index} className="relative pl-6 pb-6 border-l-2 border-muted last:pb-0">
                      <div className="absolute left-[-8px] top-0 h-4 w-4 rounded-full bg-primary"></div>
                      <div className="mb-1">
                        <span className="font-medium">
                          {getDepartmentName(entry.departmentId)}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mb-1">
                        <Calendar className="mr-1 h-3 w-3" />
                        <span>
                          Entrada: {format(new Date(entry.entryDate), "dd/MM/yyyy HH:mm")}
                        </span>
                      </div>
                      {entry.exitDate && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          <span>
                            Saída: {format(new Date(entry.exitDate), "dd/MM/yyyy HH:mm")}
                          </span>
                        </div>
                      )}
                      {entry.processedBy && (
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <User className="mr-1 h-3 w-3" />
                          <span>
                            Processado por: {entry.processedBy}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="documents" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Documentos do Processo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              Nenhum documento anexado a este processo.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="notes" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Anotações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              Nenhuma anotação para este processo.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ProcessDetailsTabs;
