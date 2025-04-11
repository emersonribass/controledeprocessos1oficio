
import { useEffect } from "react";

interface ProcessAutoRefresherProps {
  refreshFunction: () => void;
  intervalSeconds?: number;
}

export const ProcessAutoRefresher = ({
  refreshFunction,
  intervalSeconds = 30
}: ProcessAutoRefresherProps) => {
  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshFunction();
    }, intervalSeconds * 1000);
    
    return () => clearInterval(intervalId);
  }, [refreshFunction, intervalSeconds]);

  return null;
};
