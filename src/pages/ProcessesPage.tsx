
import { useEffect, useState, useMemo } from "react";
import ProcessList from "@/components/Processes/ProcessList";
import { useLocation } from "react-router-dom";

/**
 * Página otimizada de listagem de processos
 */
const ProcessesPage = () => {
  const location = useLocation();
  const [initialFilters, setInitialFilters] = useState({});

  // Usar useMemo para evitar recálculos desnecessários dos filtros iniciais
  // quando a página é renderizada novamente sem alteração na URL
  const urlSearchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  
  useEffect(() => {
    const statusParam = urlSearchParams.get('status');
    if (statusParam) {
      setInitialFilters({
        status: statusParam
      });
    } else {
      // Por padrão, excluir os processos concluídos
      setInitialFilters({
        excludeCompleted: true
      });
    }
  }, [urlSearchParams]);

  // Render otimizado
  return (
    <ProcessList initialFilters={initialFilters} />
  );
};

export default ProcessesPage;
