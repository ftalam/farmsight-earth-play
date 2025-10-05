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
  setFunds: (f: number) => void;
  water: number;
  setWater: (w: number) => void;
  fertilizer: number;
  setFertilizer: (f: number) => void;
  score: number;
  setScore: (s: number) => void;
}

export const DecisionPanel = ({ currentMonth, funds, setFunds, water, setWater, fertilizer, setFertilizer, score, setScore }: DecisionPanelProps) => {
  const [decisionsUsed, setDecisionsUsed] = useState<string[]>([]);
  const data = getSatelliteData(currentMonth);
  const decisions = getDecisions(currentMonth);

  useEffect(() => {
    setDecisionsUsed([]);
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

    // Resource logic
    let newFunds = funds;
    let newWater = water;
    let newFertilizer = fertilizer;

    if (decisionType === "irrigation") {
      newWater = Math.max(0, water - 20);
      newFunds = Math.max(0, funds - 50);
    } else if (decisionType === "fertilizer") {
      newFertilizer = Math.max(0, fertilizer - 10);
      newFunds = Math.max(0, funds - 30);
    } else if (decisionType === "drought-crops") {
      newFunds = Math.max(0, funds - 40);
    } else if (decisionType === "mulching") {
      newFunds = Math.max(0, funds - 20);
    } else if (decisionType === "water-harvest") {
      newFunds = Math.max(0, funds - 60);
      newWater = water + 10;
    } else if (decisionType === "monitor") {
      // No resource change
    }

    // Update score based on impact
    const newScore = Math.max(0, score + impact);

    // Reward for good impact to funds
    if (impact > 0) {
      newFunds += Math.floor(impact / 2);
    }

    setFunds(newFunds);
    setWater(newWater);
    setFertilizer(newFertilizer);
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
