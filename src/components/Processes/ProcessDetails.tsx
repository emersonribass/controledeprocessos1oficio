
import { useParams } from "react-router-dom";
import { useProcesses } from "@/hooks/useProcesses";
import ProcessHeader from "./ProcessHeader";
import ProcessCard from "./ProcessCard";
import ProcessHistory from "./ProcessHistory";
import ProcessNotFound from "./ProcessNotFound";

const ProcessDetails = () => {
  // Adicionando console log para debug
  console.log("Renderizando ProcessDetails");
  
  const { id } = useParams<{ id: string }>();
  
  // Verificando se o hook useProcesses está funcionando
  try {
    const {
      processes,
      getDepartmentName,
      getProcessTypeName,
      moveProcessToNextDepartment,
      moveProcessToPreviousDepartment,
    } = useProcesses();
    
    console.log("Hook useProcesses carregado com sucesso", processes.length);
    
    const process = processes.find((p) => p.id === id);
    console.log("Processo encontrado:", process);

    if (!process) {
      return <ProcessNotFound />;
    }

    return (
      <div className="space-y-6">
        <ProcessHeader title="Detalhes do Processo" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProcessCard
            process={process}
            getDepartmentName={getDepartmentName}
            getProcessTypeName={getProcessTypeName}
            moveProcessToNextDepartment={moveProcessToNextDepartment}
            moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
          />

          <ProcessHistory 
            history={process.history} 
            getDepartmentName={getDepartmentName} 
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Erro ao usar hook useProcesses:", error);
    return <div>Erro ao carregar detalhes do processo. Tente novamente mais tarde.</div>;
  }
};

export default ProcessDetails;
