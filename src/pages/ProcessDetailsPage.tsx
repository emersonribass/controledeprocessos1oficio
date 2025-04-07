
import { useParams } from "react-router-dom";
import ProcessDetails from "@/components/Processes/ProcessDetails";
import { ProcessesProvider } from "@/hooks/useProcesses";

const ProcessDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  
  console.log("Renderizando ProcessDetailsPage, ID do processo:", id);
  
  return (
    <ProcessesProvider>
      <ProcessDetails />
    </ProcessesProvider>
  );
};

export default ProcessDetailsPage;
