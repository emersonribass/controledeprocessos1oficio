
import { useEffect, useState } from "react";
import ProcessList from "@/components/Processes/ProcessList";
import { useLocation } from "react-router-dom";

const ProcessesPage = () => {
  const location = useLocation();
  const [initialFilters, setInitialFilters] = useState({});

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const statusParam = searchParams.get('status');
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
  }, [location.search]);

  return (
    <ProcessList initialFilters={initialFilters} />
  );
};

export default ProcessesPage;
