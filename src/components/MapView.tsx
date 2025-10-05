import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers } from "lucide-react";
import { getSatelliteData } from "@/lib/satelliteData";

interface MapViewProps {
  currentMonth: number;
  location?: { lat: number; lon: number; name: string };
}

export const MapView = ({ currentMonth, location }: MapViewProps) => {
  const data = getSatelliteData(currentMonth);
  
  // Determine map color based on health
  const getMapGradient = () => {
    if (data.ndvi > 0.6) return "from-success/20 to-success/40";
    if (data.ndvi > 0.4) return "from-warning/20 to-warning/40";
    return "from-destructive/20 to-destructive/40";
  };

  return (
    <Card className="overflow-hidden shadow-lg">
      <div className="bg-card p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">
            Satellite View - {location?.name || 'Farm Plot'}
          </h2>
        </div>
        <Badge variant="outline" className="gap-1">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          Live Data
        </Badge>
      </div>
      
      <div className="relative aspect-video bg-gradient-to-br from-primary/5 to-muted">
        {/* Simulated satellite map with grid */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getMapGradient()} transition-all duration-700`}>
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(8)].map((_, i) => (
              <div key={`v-${i}`} className="absolute top-0 bottom-0 w-px bg-foreground" style={{ left: `${(i + 1) * 12.5}%` }} />
            ))}
            {[...Array(6)].map((_, i) => (
              <div key={`h-${i}`} className="absolute left-0 right-0 h-px bg-foreground" style={{ top: `${(i + 1) * 16.66}%` }} />
            ))}
          </div>

          {/* Farm plot indicator */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="w-32 h-32 border-4 border-primary rounded-lg bg-card/80 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{data.ndvi.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">NDVI</div>
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full animate-ping opacity-75" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full" />
            </div>
          </div>

          {/* Data overlays */}
          <div className="absolute bottom-4 left-4 right-4 flex gap-2">
            <div className="flex-1 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border">
              <div className="text-xs text-muted-foreground mb-1">Soil Moisture</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-secondary transition-all duration-500"
                    style={{ width: `${data.soilMoisture}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-foreground">{data.soilMoisture}%</span>
              </div>
            </div>
            
            <div className="flex-1 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border">
              <div className="text-xs text-muted-foreground mb-1">Precipitation</div>
              <div className="text-sm font-semibold text-foreground">{data.precipitation}mm</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-muted/50 p-3 text-xs text-muted-foreground">
        <p>
          Data Source: Simulated NASA MODIS & Digital Earth Africa • 
          Location: {location?.name || 'East Africa (Sample)'} • 
          Coordinates: {location ? `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}` : 'N/A'}
        </p>
      </div>
    </Card>
  );
};
