
import { TableCell, TableRow } from "@/components/ui/table";

interface ProcessTableEmptyProps {
  columnsCount: number;
}

const ProcessTableEmpty = ({ columnsCount }: ProcessTableEmptyProps) => {
  return (
    <TableRow>
      <TableCell colSpan={columnsCount} className="h-24 text-center">
        Nenhum processo encontrado
      </TableCell>
    </TableRow>
  );
};

export default ProcessTableEmpty;
