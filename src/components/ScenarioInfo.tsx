import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, AlertTriangle } from "lucide-react";

interface ScenarioInfoProps {
  currentMonth: number;
}

export const ScenarioInfo = ({ currentMonth }: ScenarioInfoProps) => {
  const isDrySeason = currentMonth >= 6 && currentMonth <= 9;

  return (
    <Card className="p-4 shadow-lg border-2 border-primary/20">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Target className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg text-foreground">Scenario: Dry Season Challenge</h2>
            <Badge variant={isDrySeason ? "destructive" : "default"}>
              {isDrySeason ? "Active" : "Monitoring"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Use satellite data to make informed farming decisions during East Africa's dry season (June-September). 
            Monitor vegetation health, soil moisture, and rainfall to optimize crop management.
          </p>
        </div>

        {isDrySeason && (
          <div className="flex items-start gap-2 bg-warning/10 border border-warning rounded-lg p-3 min-w-fit">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-sm text-foreground">Dry Season Active</div>
              <div className="text-xs text-muted-foreground">Water management critical</div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
