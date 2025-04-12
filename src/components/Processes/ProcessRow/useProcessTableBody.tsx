
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { ProcessResponsiblesHookResult } from "@/features/processes";

export const useProcessTableBody = (responsiblesManager: ProcessResponsiblesHookResult) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { processResponsibles, setProcessResponsibles } = responsiblesManager;

  const handleRowClick = useCallback((processId: string) => {
    navigate(`/processes/${processId}`);
  }, [navigate]);

  const handleAcceptProcess = useCallback((processId: string) => {
    if (!setProcessResponsibles) return;
    
    const newResponsibles = {...processResponsibles};
    newResponsibles[processId] = "accepted"; // qualquer valor não-nulo funciona aqui
    setProcessResponsibles(newResponsibles);
  }, [processResponsibles, setProcessResponsibles]);

  return {
    handleRowClick,
    handleAcceptProcess,
    userId: user?.id
  };
};
