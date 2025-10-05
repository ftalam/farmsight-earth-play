import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, AlertTriangle } from "lucide-react";
import { getSatelliteData } from "@/lib/satelliteData";

interface ScenarioInfoProps {
  currentMonth: number;
}

export const ScenarioInfo = ({ currentMonth }: ScenarioInfoProps) => {
  const isDrySeason = currentMonth >= 6 && currentMonth <= 9;
  const { season } = getSatelliteData(currentMonth);

  const seasonText = (() => {
    switch (season) {
      case "Short Dry":
        return "Manage limited rainfall and plan for the upcoming long rains.";
      case "Long Rains":
        return "Capitalize on rainfall: plant, fertilize wisely, and manage waterlogging.";
      case "Long Dry":
        return "Severe dry period: prioritize irrigation, mulching, and drought-tolerant crops.";
      case "Short Rains":
        return "Short rainy window: optimize planting and water harvesting.";
      default:
        return "Use satellite data to guide adaptive farm decisions.";
    }
  })();

  return (
    <Card className="p-4 shadow-lg border-2 border-primary/20">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-lg text-foreground">Scenario: {season}</h2>
          <Badge variant={isDrySeason ? "destructive" : "default"}>
            {isDrySeason ? "Active" : "Monitoring"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {seasonText}
        </p>
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
