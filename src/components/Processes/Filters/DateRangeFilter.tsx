
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DateRangeFilterProps {
  initialDate: Date | undefined;
  finalDate: Date | undefined;
  onInitialDateChange: (date: Date | undefined) => void;
  onFinalDateChange: (date: Date | undefined) => void;
}

const DateRangeFilter = ({
  initialDate,
  finalDate,
  onInitialDateChange,
  onFinalDateChange,
}: DateRangeFilterProps) => {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1">Data de Entrada</label>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-[140px] justify-start text-left font-normal ${!initialDate && "text-muted-foreground"}`}
            >
              <Calendar className="mr-2 h-4 w-4 opacity-70" />
              {initialDate ? format(initialDate, "dd/MM/yyyy", { locale: ptBR }) : "Início"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <ShadcnCalendar
              mode="single"
              selected={initialDate}
              onSelect={onInitialDateChange}
              initialFocus
              className="p-3 pointer-events-auto"
              locale={ptBR}
              footer={null}
              toDate={finalDate}
            />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-[140px] justify-start text-left font-normal ${!finalDate && "text-muted-foreground"}`}
            >
              <Calendar className="mr-2 h-4 w-4 opacity-70" />
              {finalDate ? format(finalDate, "dd/MM/yyyy", { locale: ptBR }) : "Fim"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <ShadcnCalendar
              mode="single"
              selected={finalDate}
              onSelect={onFinalDateChange}
              initialFocus
              className="p-3 pointer-events-auto"
              locale={ptBR}
              footer={null}
              fromDate={initialDate}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default DateRangeFilter;
