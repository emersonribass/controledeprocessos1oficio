import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProcessStatusBadge from "./ProcessStatusBadge";
interface ProcessDetailsHeaderProps {
  process: any;
  getProcessTypeName: (id: string) => string;
}
const ProcessDetailsHeader = ({
  process,
  getProcessTypeName
}: ProcessDetailsHeaderProps) => {
  const navigate = useNavigate();
  return <div className="mb-6">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Processo #{process.protocolNumber}</h1>
          <div className="flex items-center gap-2">
            <ProcessStatusBadge status={process.status} />
            <span className="text-muted-foreground">
              {getProcessTypeName(process.processType)}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-green-600 hover:bg-green-500 text-white">
            <Printer className="h-4 w-4" />
            <span className="hidden md:inline">Imprimir</span>
          </Button>
          <Button variant="outline" className="gap-1 text-white bg-blue-600 hover:bg-blue-500">
            <Download className="h-4 w-4" />
            <span className="hidden md:inline">Exportar</span>
          </Button>
        </div>
      </div>
    </div>;
};
export default ProcessDetailsHeader;