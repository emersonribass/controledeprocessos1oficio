
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
    default:
      return <Badge>Desconhecido</Badge>;
  }
};

export default ProcessStatusBadge;
