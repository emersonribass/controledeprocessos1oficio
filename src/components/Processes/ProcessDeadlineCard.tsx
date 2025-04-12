
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProcessDeadlineCardProps {
  process: any;
}

const ProcessDeadlineCard = ({ process }: ProcessDeadlineCardProps) => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Prazo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Prazo no Setor Atual
            </h3>
            <div className={`text-lg font-bold ${process.status === "overdue" ? "text-red-500" : ""}`}>
              {process.departmentDeadline ? `${process.departmentDeadline} dias` : "Sem prazo definido"}
            </div>
            {process.status === "overdue" && (
              <p className="text-sm text-red-500 mt-1">
                Prazo expirado há {process.daysOverdue} dias
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessDeadlineCard;
