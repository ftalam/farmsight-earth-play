import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Droplets, FlaskConical } from "lucide-react";
import { getSatelliteData, getDecisions } from "@/lib/satelliteData";
import { toast } from "@/hooks/use-toast";

interface DecisionPanelProps {
  currentMonth: number;
  funds: number;
  setFunds: React.Dispatch<React.SetStateAction<number>>;
  water: number;
  setWater: React.Dispatch<React.SetStateAction<number>>;
  fertilizer: number;
  setFertilizer: React.Dispatch<React.SetStateAction<number>>;
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  setCropYield: React.Dispatch<React.SetStateAction<number>>;
  setPlantVigor: React.Dispatch<React.SetStateAction<number>>;
}

export const DecisionPanel = ({ currentMonth, funds, setFunds, water, setWater, fertilizer, setFertilizer, score, setScore, setCropYield, setPlantVigor }: DecisionPanelProps) => {
  const [decisionsUsed, setDecisionsUsed] = useState<string[]>([]);
  const [lastImpact, setLastImpact] = useState<number | null>(null);
  const data = getSatelliteData(currentMonth);
  const decisions = getDecisions(currentMonth);

  useEffect(() => {
    setDecisionsUsed([]);
    setLastImpact(null);
  }, [currentMonth]);

  const handleDecision = (decisionType: string, impact: number, feedback: string) => {
    if (decisionsUsed.includes(decisionType)) {
      toast({
        title: "Already Applied",
        description: "You've already made this decision this month.",
        variant: "default",
      });
      return;
    }

    // Apply resource changes using functional updates to avoid stale values
    setFunds((prev) => {
      let next = prev;
      if (decisionType === "irrigation") {
        next = Math.max(0, next - 50);
      } else if (decisionType === "fertilizer") {
        next = Math.max(0, next - 30);
      } else if (decisionType === "drought-crops") {
        next = Math.max(0, next - 40);
      } else if (decisionType === "mulching") {
        next = Math.max(0, next - 20);
      } else if (decisionType === "water-harvest") {
        next = Math.max(0, next - 60);
      }
      if (impact > 0) {
        next += Math.floor(impact / 2);
      }
      return next;
    });

    setWater((prev) => {
      if (decisionType === "irrigation") {
        return Math.max(0, prev - 20);
      }
      if (decisionType === "water-harvest") {
        return prev + 10;
      }
      return prev;
    });

    setFertilizer((prev) => {
      if (decisionType === "fertilizer") {
        return Math.max(0, prev - 10);
      }
      return prev;
    });

    // Update score and agronomic indicators
    setScore((prev) => Math.max(0, prev + impact));

    setCropYield((prev) => {
      // Increased base change from impact
      let delta = Math.round(impact * 0.6);
      // Fertilizer with adequate moisture boosts yield more; otherwise penalize harder
      if (decisionType === "fertilizer") {
        if (data.soilMoisture > 40) delta += 10; else delta -= 8;
      }
      // Drought-crops helps yield under very dry + low NDVI
      if (decisionType === "drought-crops" && data.soilMoisture < 35 && data.ndvi < 0.5) {
        delta += 8;
      }
      return Math.max(0, Math.min(100, prev + delta));
    });

    setPlantVigor((prev) => {
      // Increased base change from impact
      let delta = Math.round(impact * 0.5);
      // Irrigation increases vigor when dry, hurts when already moist (stronger effect)
      if (decisionType === "irrigation") {
        if (data.soilMoisture < 45) delta += 10; else delta -= 6;
      }
      // Mulching helps under dry conditions (stronger effect)
      if (decisionType === "mulching" && data.soilMoisture < 45) {
        delta += 6;
      }
      return Math.max(0, Math.min(100, prev + delta));
    });

    setLastImpact(impact);
    setDecisionsUsed([...decisionsUsed, decisionType]);

    toast({
      title: impact > 0 ? "Good Decision!" : "Consider This",
      description: feedback,
      variant: impact > 0 ? "default" : "destructive",
    });
  };

  const scoreColorClass = lastImpact == null ? "text-foreground" : lastImpact > 0 ? "text-success" : "text-destructive";

  return (
    <Card className="p-4 shadow-md">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Farm Decisions</h3>
          <div className={`text-sm font-semibold ${scoreColorClass}`}>Score: {score}</div>
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
          </div>
        </div>
      </div>
    </Card>
  );
};
