import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";

interface TimeSliderProps {
  currentMonth: number;
  onMonthChange: (month: number) => void;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export const TimeSlider = ({ currentMonth, onMonthChange }: TimeSliderProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      onMonthChange((currentMonth % 12) + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, currentMonth, onMonthChange]);

  const handleReset = () => {
    setIsPlaying(false);
    onMonthChange(1);
  };

  return (
    <Card className="p-4 shadow-md">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Timeline</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsPlaying(!isPlaying)}
              className="gap-2"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Play
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">{MONTHS[currentMonth - 1]}</div>
              <div className="text-sm text-muted-foreground">Month {currentMonth}/12</div>
            </div>
          </div>

          <Slider
            value={[currentMonth]}
            onValueChange={(value) => onMonthChange(value[0])}
            min={1}
            max={12}
            step={1}
            className="w-full"
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            {MONTHS.map((month, i) => (
              <span
                key={month}
                className={`transition-all ${
                  i + 1 === currentMonth ? "font-bold text-primary" : ""
                }`}
              >
                {month}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
