
import ProcessDetails from "@/components/Processes/ProcessDetails";
import { ProcessesProvider } from "@/features/processes/context/ProcessesContext";

const ProcessDetailsPage = () => {
  return (
    <ProcessesProvider>
      <ProcessDetails />
    </ProcessesProvider>
  );
};

export default ProcessDetailsPage;
