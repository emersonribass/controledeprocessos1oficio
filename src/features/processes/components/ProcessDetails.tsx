
import { Process } from "@/types";

interface ProcessDetailsProps {
  process: Process;
}

const ProcessDetails = ({ process }: ProcessDetailsProps) => {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <div>
          <h3 className="text-lg font-medium">Detalhes do Processo</h3>
          <p className="text-sm text-gray-500">Informações completas sobre o processo</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Protocolo</p>
            <p>{process.protocolNumber}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Status</p>
            <p>{process.status}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Departamento Atual</p>
            <p>{process.currentDepartment}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Data de Início</p>
            <p>{process.startDate || "Não iniciado"}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Data Final Esperada</p>
            <p>{process.expectedEndDate}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Responsável</p>
            <p>{process.responsibleUser || "Não atribuído"}</p>
          </div>
        </div>
      </div>
      
      {process.history.length > 0 && (
        <div>
          <h4 className="text-md font-medium mb-2">Histórico de Movimentação</h4>
          <div className="space-y-2">
            {process.history.map((entry) => (
              <div key={entry.id || `${entry.departmentId}-${entry.entryDate}`} className="text-sm p-2 border rounded">
                <div className="flex justify-between">
                  <span>Departamento: {entry.departmentId}</span>
                  <span>Entrada: {new Date(entry.entryDate).toLocaleDateString()}</span>
                </div>
                {entry.exitDate && (
                  <div className="text-right">
                    Saída: {new Date(entry.exitDate).toLocaleDateString()}
                  </div>
                )}
                <div className="text-right text-xs text-gray-500">
                  Responsável: {entry.userName}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessDetails;
