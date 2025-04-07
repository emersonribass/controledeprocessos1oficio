
import { useParams } from "react-router-dom";
import ProcessDetails from "@/components/Processes/ProcessDetails";
import { ProcessesProvider } from "@/hooks/useProcesses";
import { useEffect } from "react";

const ProcessDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  
  useEffect(() => {
    console.log("ProcessDetailsPage montado com ID:", id);
  }, [id]);
  
  return (
    <ProcessesProvider>
      <ProcessDetails />
    </ProcessesProvider>
  );
};

export default ProcessDetailsPage;
