
import { useParams, useNavigate } from "react-router-dom";
import { useProcesses } from "@/hooks/useProcesses";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { ProcessesProvider } from "@/hooks/useProcesses";

const ProcessPlanContent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { processes, departments, getDepartmentName, isLoading } = useProcesses();
  const [sortedDepartments, setSortedDepartments] = useState([]);

  const process = processes.find((p) => p.id === id);

  useEffect(() => {
    if (departments.length > 0) {
      // Ordenar departamentos por ordem
      const sorted = [...departments]
        .sort((a, b) => a.order - b.order);
      setSortedDepartments(sorted);
    }
  }, [departments]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando plano do processo...</span>
      </div>
    );
  }

  if (!process) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/processes")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">Processo não encontrado</h2>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p>O processo solicitado não foi encontrado.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getCurrentDepartmentIndex = () => {
    const dept = sortedDepartments.findIndex(d => d.id === process.currentDepartment);
    return dept >= 0 ? dept : -1;
  };

  const currentIndex = getCurrentDepartmentIndex();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(`/processes/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold">Plano do Processo: {process.protocolNumber}</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fluxo do Processo</CardTitle>
          <CardDescription>
            Visualize as etapas do processo e seu andamento atual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="relative">
              {/* Linha de progresso */}
              <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              {/* Lista de departamentos */}
              <div className="space-y-8">
                {sortedDepartments.map((dept, index) => {
                  const isPast = index < currentIndex;
                  const isCurrent = index === currentIndex;
                  const isFuture = index > currentIndex;
                  
                  // Encontrar a entrada no histórico para este departamento
                  const historyEntry = process.history.find(h => h.departmentId === dept.id);
                  
                  return (
                    <div key={dept.id} className="relative pl-10">
                      {/* Indicador de status */}
                      <div className={`absolute left-0 w-5 h-5 rounded-full border-2 ${
                        isPast ? "bg-green-500 border-green-500" : 
                        isCurrent ? "bg-blue-500 border-blue-500" : 
                        "bg-white border-gray-300"
                      }`}>
                        {isPast && (
                          <svg className="w-3 h-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                      </div>
                      
                      {/* Conteúdo do departamento */}
                      <div className={`${
                        isCurrent ? "bg-blue-50 border-blue-200" : 
                        isPast ? "bg-green-50 border-green-200" : 
                        "bg-gray-50 border-gray-200"
                      } p-4 border rounded-md`}>
                        <h3 className="font-medium text-lg">{dept.name}</h3>
                        
                        {/* Tempo estimado */}
                        <p className="text-sm text-gray-500">
                          Tempo estimado: {dept.timeLimit} dia(s)
                        </p>
                        
                        {/* Data de entrada, se disponível */}
                        {historyEntry && historyEntry.entryDate && (
                          <p className="text-sm mt-1">
                            <span className="font-medium">Entrada:</span> {new Date(historyEntry.entryDate).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                        
                        {/* Data de saída, se disponível */}
                        {historyEntry && historyEntry.exitDate && (
                          <p className="text-sm">
                            <span className="font-medium">Saída:</span> {new Date(historyEntry.exitDate).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                        
                        {/* Status atual */}
                        {isCurrent && (
                          <div className="mt-2 inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md">
                            Em andamento
                          </div>
                        )}
                        {isPast && (
                          <div className="mt-2 inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-md">
                            Concluído
                          </div>
                        )}
                        {isFuture && (
                          <div className="mt-2 inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-md">
                            Pendente
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ProcessPlanPage = () => {
  return (
    <ProcessesProvider>
      <ProcessPlanContent />
    </ProcessesProvider>
  );
};

export default ProcessPlanPage;
