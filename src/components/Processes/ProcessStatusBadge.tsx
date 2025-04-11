
import { Badge } from "@/components/ui/badge";

type StatusProps = {
  status: string;
};

const ProcessStatusBadge = ({ status }: StatusProps) => {
  switch (status) {
    case "Concluído":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Concluído</Badge>;
    case "Atrasado":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Atrasado</Badge>;
    case "Em andamento":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Em andamento</Badge>;
    case "Não iniciado":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Não iniciado</Badge>;
    default:
      return <Badge>Desconhecido</Badge>;
  }
};

export default ProcessStatusBadge;
