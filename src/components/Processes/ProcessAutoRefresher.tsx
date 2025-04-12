
import { useEffect, useRef } from "react";

interface ProcessAutoRefresherProps {
  refreshFunction: () => void;
  intervalSeconds?: number;
  enabled?: boolean;
}

export const ProcessAutoRefresher = ({
  refreshFunction,
  intervalSeconds = 30,
  enabled = true
}: ProcessAutoRefresherProps) => {
  const refreshCountRef = useRef(0);
  const lastRefreshTimeRef = useRef(Date.now());
  
  useEffect(() => {
    if (!enabled) return;
    
    const intervalId = setInterval(() => {
      const currentTime = Date.now();
      const timeSinceLastRefresh = currentTime - lastRefreshTimeRef.current;
      
      // Limitar a frequência de atualizações para evitar ciclos infinitos
      // Se tivermos feito mais de 10 atualizações em menos de 5 segundos, evitar atualização
      if (refreshCountRef.current > 10 && timeSinceLastRefresh < 5000) {
        console.log('Muitas atualizações em sequência, ignorando esta atualização para evitar loops infinitos');
        return;
      }
      
      refreshFunction();
      lastRefreshTimeRef.current = Date.now();
      refreshCountRef.current += 1;
      
      // Resetar o contador a cada 60 segundos
      setTimeout(() => {
        refreshCountRef.current = Math.max(0, refreshCountRef.current - 1);
      }, 60000);
      
    }, intervalSeconds * 1000);
    
    return () => clearInterval(intervalId);
  }, [refreshFunction, intervalSeconds, enabled]);

  return null;
};
