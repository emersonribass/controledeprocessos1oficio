import { useState, useEffect, useCallback } from "react";
import { useProcesses } from "@/hooks/useProcesses";
import { useDepartments } from "@/hooks/useDepartments";
import { useProcessTypes } from "@/hooks/useProcessTypes";
import { useAvailableUsers } from "@/hooks/useAvailableUsers";
import { useSupabase } from "@/hooks/useSupabase";
import ProcessFilters from "./ProcessFilters";
import ProcessTable from "./ProcessTable";
import ProcessListSkeleton from "./ProcessListSkeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/auth";
import { useUserProfile } from "@/hooks/auth/useUserProfile";

const ProcessListContent = () => {
  const { user } = useAuth();
  const { userProfile } = useUserProfile();
  const { processes, isLoading, refreshProcesses, filterProcesses } = useProcesses();
  const { departments } = useDepartments();
  const { processTypes } = useProcessTypes();
  const { usuarios } = useAvailableUsers();
  const { getProcessResponsibles } = useSupabase();
  
  const [filteredProcesses, setFilteredProcesses] = useState(processes);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [processesResponsibles, setProcessesResponsibles] = useState<Record<string, any>>({});
  
  // Estado para armazenar os filtros
  const [filters, setFilters] = useState({
    status: "",
    department: "",
    responsibleUser: "",
    processType: "",
    search: "",
    startDate: "",
    endDate: "",
  });

  // Função para atualizar um filtro específico
  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Função para limpar todos os filtros
  const clearFilters = () => {
    setFilters({
      status: "",
      department: "",
      responsibleUser: "",
      processType: "",
      search: "",
      startDate: "",
      endDate: "",
    });
    applyFilters({
      status: "",
      department: "",
      responsibleUser: "",
      processType: "",
      search: "",
      startDate: "",
      endDate: "",
    });
  };

  // Função para buscar responsáveis por processos
  const fetchProcessesResponsibles = useCallback(async () => {
    if (!processes.length) return;
    
    try {
      const processIds = processes.map(p => p.id);
      const { data } = await getProcessResponsibles(processIds);
      
      if (data) {
        // Organizar por processo_id
        const responsiblesByProcess: Record<string, any[]> = {};
        data.forEach(item => {
          if (!responsiblesByProcess[item.processo_id]) {
            responsiblesByProcess[item.processo_id] = [];
          }
          responsiblesByProcess[item.processo_id].push(item);
        });
        
        setProcessesResponsibles(responsiblesByProcess);
      }
    } catch (error) {
      console.error("Erro ao buscar responsáveis:", error);
    }
  }, [processes, getProcessResponsibles]);

  // Efeito para buscar responsáveis quando a lista de processos mudar
  useEffect(() => {
    fetchProcessesResponsibles();
  }, [fetchProcessesResponsibles]);

  // Função para aplicar os filtros
  const applyFilters = useCallback(async (currentFilters = filters) => {
    if (!user) return;
    
    setIsFiltering(true);
    try {
      const filtered = await filterProcesses(currentFilters, processes, processesResponsibles);
      setFilteredProcesses(filtered);
    } catch (error) {
      console.error("Erro ao filtrar processos:", error);
    } finally {
      setIsFiltering(false);
    }
  }, [user, filterProcesses, filters, processes, processesResponsibles]);

  // Aplicar filtros quando os processos ou filtros mudarem
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Função para atualizar a lista de processos
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshProcesses();
    await fetchProcessesResponsibles();
    await applyFilters();
    setIsRefreshing(false);
  };

  // Verificar se o usuário tem permissão para ver a lista
  const canViewProcesses = userProfile?.perfil === "admin" || 
                          userProfile?.perfil === "gestor" || 
                          (userProfile?.setores_atribuidos && userProfile.setores_atribuidos.length > 0);

  if (!canViewProcesses) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Acesso Restrito</h2>
        <p className="text-muted-foreground mb-4">
          Você não tem permissão para visualizar a lista de processos.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <ProcessListSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Atualizando..." : "Atualizar"}
        </Button>
      </div>

      <ProcessFilters
        isExpanded={isFiltersExpanded}
        toggleExpanded={() => setIsFiltersExpanded(!isFiltersExpanded)}
        filters={filters}
        updateFilter={updateFilter}
        clearFilters={clearFilters}
        applyFilters={() => applyFilters()}
      />

      <ProcessTable
        processes={filteredProcesses}
        isLoading={isFiltering}
        processesResponsibles={processesResponsibles}
      />

      {filteredProcesses.length === 0 && !isFiltering && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Nenhum processo encontrado com os filtros selecionados.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProcessListContent;
