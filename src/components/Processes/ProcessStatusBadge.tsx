
import { Badge } from "@/components/ui/badge";

type StatusProps = {
  status: string;
};

const ProcessStatusBadge = ({ status }: StatusProps) => {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Concluído</Badge>;
    case "overdue":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Atrasado</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Em andamento</Badge>;
    case "not_started":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Não iniciado</Badge>;
    case "archived":
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Arquivado</Badge>;
    default:
      return <Badge>Desconhecido</Badge>;
  }
};

export default ProcessStatusBadge;
