import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Droplets, FlaskConical } from "lucide-react";
import { getSatelliteData, getDecisions } from "@/lib/satelliteData";
import { toast } from "@/hooks/use-toast";

interface DecisionPanelProps {
  currentMonth: number;
}

export const DecisionPanel = ({ currentMonth }: DecisionPanelProps) => {
  const [score, setScore] = useState(0);
  const [decisionsUsed, setDecisionsUsed] = useState<string[]>([]);
  const data = getSatelliteData(currentMonth);
  const decisions = getDecisions(currentMonth);

  const handleDecision = (decisionType: string, impact: number, feedback: string) => {
    if (decisionsUsed.includes(decisionType)) {
      toast({
        title: "Already Applied",
        description: "You've already made this decision this month.",
        variant: "default",
      });
      return;
    }

    const newScore = score + impact;
    setScore(newScore);
    setDecisionsUsed([...decisionsUsed, decisionType]);

    toast({
      title: impact > 0 ? "Good Decision!" : "Consider This",
      description: feedback,
      variant: impact > 0 ? "default" : "destructive",
    });
  };

  return (
    <Card className="p-4 shadow-md">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Farm Decisions</h3>
          <Badge variant={score > 50 ? "default" : "outline"} className="gap-1">
            Score: {score}
          </Badge>
        </div>

        {/* Current Conditions Alert */}
        {data.soilMoisture < 40 && (
          <div className="flex gap-3 p-3 bg-warning/10 border border-warning rounded-lg">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-medium text-sm text-foreground">Low Soil Moisture Detected</div>
              <div className="text-xs text-muted-foreground">
                Your crops may be stressed. Consider irrigation or drought-resistant practices.
              </div>
            </div>
          </div>
        )}

        {/* Decision Options */}
        <div className="space-y-2">
          {decisions.map((decision, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start text-left h-auto py-3 px-4"
              onClick={() => handleDecision(decision.type, decision.impact, decision.feedback)}
              disabled={decisionsUsed.includes(decision.type)}
            >
              <div className="flex gap-3 w-full">
                <div className="flex-shrink-0 mt-0.5">
                  {decision.type === "irrigation" && <Droplets className="w-5 h-5 text-secondary" />}
                  {decision.type === "fertilizer" && <FlaskConical className="w-5 h-5 text-success" />}
                  {decision.type === "monitor" && <CheckCircle2 className="w-5 h-5 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm mb-1">{decision.label}</div>
                  <div className="text-xs text-muted-foreground">{decision.description}</div>
                </div>
                {decisionsUsed.includes(decision.type) && (
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                )}
              </div>
            </Button>
          ))}
        </div>

        {/* Score Interpretation */}
        <div className="pt-3 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Your Farming Strategy:</p>
            {score > 70 && <p className="text-success">Excellent! You're making optimal decisions for the conditions.</p>}
            {score > 40 && score <= 70 && <p>Good progress. Keep monitoring and adjusting your approach.</p>}
            {score <= 40 && <p>Consider using more adaptive strategies based on the satellite data.</p>}
          </div>
        </div>
      </div>
    </Card>
  );
};
