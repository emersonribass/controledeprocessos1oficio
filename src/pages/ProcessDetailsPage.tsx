
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProcesses } from "@/hooks/useProcesses";
import { useProcessMovement } from "@/hooks/useProcessMovement";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, FileText, User, ArrowLeft, Download, Printer } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import ProcessStatusBadge from "@/components/Processes/ProcessStatusBadge";
import ProcessActionButtons from "@/components/Processes/ProcessActionButtons";
import ProcessResponsibleInfo from "@/components/Processes/ProcessResponsibleInfo";
import { useAuth } from "@/hooks/auth";

const ProcessDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { processes, isLoading: isLoadingProcesses, getProcess, getDepartmentName, getProcessTypeName, refreshProcesses } = useProcesses();
  const { user } = useAuth();
  const [process, setProcess] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  const { moveProcessToNextDepartment, moveProcessToPreviousDepartment, startProcess, isMoving, isStarting } = useProcessMovement(() => {
    refreshProcesses();
    loadProcess();
  });
  
  const loadProcess = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const processData = await getProcess(id);
      setProcess(processData);
    } catch (error) {
      console.error("Erro ao carregar processo:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (!isLoadingProcesses) {
      loadProcess();
    }
  }, [id, isLoadingProcesses]);
  
  if (isLoading || !process) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  const isFirstDepartment = !process.history.some((item: any) => 
    item.departmentId !== process.currentDepartment && item.exitDate !== null
  );
  
  const isLastDepartment = process.currentDepartment === "10"; // ID do último departamento (concluído)
  
  // Verificar se o processo ainda não foi iniciado
  const isNotStarted = process.status === "not_started";
  
  return (
    <div className="container max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)} 
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Processo #{process.protocolNumber}</h1>
            <div className="flex items-center gap-2">
              <ProcessStatusBadge status={process.status} />
              <span className="text-muted-foreground">
                {getProcessTypeName(process.processType)}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Printer className="h-4 w-4" />
              <span className="hidden md:inline">Imprimir</span>
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden md:inline">Exportar</span>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Detalhes do Processo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Setor Atual
                    </h3>
                    <p className="font-medium">
                      {getDepartmentName(process.currentDepartment)}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Data de Início
                    </h3>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>
                        {format(new Date(process.startDate), "dd 'de' MMMM 'de' yyyy", {
                          locale: ptBR
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Tipo de Processo
                    </h3>
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{getProcessTypeName(process.processType)}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Tempo no Setor Atual
                    </h3>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>
                        {process.daysInCurrentDepartment} dias
                        {process.status === "overdue" && (
                          <span className="text-red-500 ml-2">
                            (Atrasado)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Ações</h3>
                  
                  <ProcessActionButtons 
                    processId={process.id}
                    moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
                    moveProcessToNextDepartment={moveProcessToNextDepartment}
                    isFirstDepartment={isFirstDepartment}
                    isLastDepartment={isLastDepartment}
                    setIsEditing={() => {}}
                    isEditing={false}
                    status={process.status}
                    startProcess={startProcess}
                  />
                </div>
              </CardContent>
            </Card>
            
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
                    <div className="space-y-8">
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
          </div>
          
          <div>
            <ProcessResponsibleInfo 
              processId={process.id}
              protocolNumber={process.protocolNumber}
              sectorId={process.currentDepartment}
            />
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Prazo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Prazo no Setor Atual
                    </h3>
                    <div className={`text-lg font-bold ${process.status === "overdue" ? "text-red-500" : ""}`}>
                      {process.departmentDeadline ? `${process.departmentDeadline} dias` : "Sem prazo definido"}
                    </div>
                    {process.status === "overdue" && (
                      <p className="text-sm text-red-500 mt-1">
                        Prazo expirado há {process.daysOverdue} dias
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessDetailsPage;
