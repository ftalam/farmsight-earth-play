import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Droplets, CloudRain, Sprout, TrendingUp, Info } from "lucide-react";
import { getSatelliteData } from "@/lib/satelliteData";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DataPanelProps {
  currentMonth: number;
}

export const DataPanel = ({ currentMonth }: DataPanelProps) => {
  const data = getSatelliteData(currentMonth);

  const getHealthStatus = () => {
    if (data.ndvi > 0.6) return { label: "Healthy", color: "success" as const };
    if (data.ndvi > 0.4) return { label: "Moderate", color: "warning" as const };
    return { label: "Stressed", color: "destructive" as const };
  };

  const health = getHealthStatus();

  return (
    <div className="space-y-4">
      <Card className="p-4 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Environmental Data</h3>
          <Badge variant="outline">{data.season}</Badge>
        </div>

        <div className="space-y-4">
          {/* NDVI */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sprout className="w-4 h-4 text-success" />
                <span className="text-sm font-medium text-foreground">NDVI (Vegetation Health)</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">
                        Normalized Difference Vegetation Index measures plant health. 
                        Higher values (0.6-1.0) indicate healthy, dense vegetation.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="text-sm font-bold text-foreground">{data.ndvi.toFixed(2)}</span>
            </div>
            <Progress value={data.ndvi * 100} className="h-2" />
            <Badge variant={health.color} className="text-xs">{health.label}</Badge>
          </div>

          {/* Soil Moisture */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium text-foreground">Soil Moisture</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">
                        Percentage of water in the soil. Crops need 40-60% for optimal growth.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="text-sm font-bold text-foreground">{data.soilMoisture}%</span>
            </div>
            <Progress value={data.soilMoisture} className="h-2" />
          </div>

          {/* Precipitation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium text-foreground">Monthly Rainfall</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">
                        Total rainfall in millimeters. Most crops need 50-100mm per month.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="text-sm font-bold text-foreground">{data.precipitation}mm</span>
            </div>
            <div className="h-24 flex items-end gap-1">
              {data.rainfallPattern.map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-secondary rounded-t transition-all duration-300"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>

          {/* Temperature */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-warning" />
              <span className="text-sm font-medium text-foreground">Temperature</span>
            </div>
            <span className="text-sm font-bold text-foreground">{data.temperature}°C</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
