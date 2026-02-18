import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin, Droplets, Thermometer, Sun, Wind, Eye } from "lucide-react";

interface LocationData {
  ndvi: number;
  soilMoisture: number;
  precipitation: number;
  temperature: number;
  vegetation: string;
  risk: string;
  recommendations: string[];
}

interface LocationStatusProps {
  location: {
    lat: number;
    lon: number;
    name: string;
  };
  currentMonth: number;
  dataSource: 'nasa' | 'de-africa';
}

const getLocationData = (location: { lat: number; lon: number; name: string }, month: number, dataSource: string): LocationData => {
  // Simulate data based on location and month
  const baseData = {
    ndvi: Math.random() * 0.8 + 0.2,
    soilMoisture: Math.random() * 60 + 20,
    precipitation: Math.random() * 150 + 10,
    temperature: Math.random() * 15 + 20,
    vegetation: "",
    risk: "",
    recommendations: [] as string[]
  };

  // Adjust based on month (seasons)
  if (month >= 3 && month <= 5) {
    // Rainy season
    baseData.precipitation *= 1.5;
    baseData.soilMoisture *= 1.3;
    baseData.ndvi *= 1.2;
  } else if (month >= 6 && month <= 8) {
    // Dry season
    baseData.precipitation *= 0.3;
    baseData.soilMoisture *= 0.7;
    baseData.ndvi *= 0.8;
  }

  // Adjust based on location (latitude)
  if (location.lat > 0) {
    // Northern hemisphere
    baseData.temperature += 5;
  } else {
    // Southern hemisphere
    baseData.temperature -= 2;
  }

  // Determine vegetation health
  if (baseData.ndvi > 0.6) {
    baseData.vegetation = "Excellent";
  } else if (baseData.ndvi > 0.4) {
    baseData.vegetation = "Good";
  } else if (baseData.ndvi > 0.2) {
    baseData.vegetation = "Fair";
  } else {
    baseData.vegetation = "Poor";
  }

  // Determine risk level
  if (baseData.soilMoisture < 30 || baseData.ndvi < 0.3) {
    baseData.risk = "High";
    baseData.recommendations = [
      "Consider irrigation if possible",
      "Monitor soil moisture closely",
      "Prepare for drought conditions"
    ];
  } else if (baseData.soilMoisture < 50 || baseData.ndvi < 0.5) {
    baseData.risk = "Medium";
    baseData.recommendations = [
      "Monitor weather forecasts",
      "Consider water conservation measures",
      "Check crop health regularly"
    ];
  } else {
    baseData.risk = "Low";
    baseData.recommendations = [
      "Continue current practices",
      "Monitor for any changes",
      "Maintain regular field checks"
    ];
  }

  return baseData;
};

const getRiskColor = (risk: string) => {
  switch (risk.toLowerCase()) {
    case 'high': return 'destructive';
    case 'medium': return 'warning';
    case 'low': return 'success';
    default: return 'secondary';
  }
};

const getVegetationColor = (ndvi: number) => {
  if (ndvi > 0.6) return 'text-success';
  if (ndvi > 0.4) return 'text-warning';
  return 'text-destructive';
};

export const LocationStatus = ({ location, currentMonth, dataSource }: LocationStatusProps) => {
  const data = getLocationData(location, currentMonth, dataSource);
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <Card className="overflow-hidden">
      <div className="bg-card p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Location Status</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {location.name} • {monthNames[currentMonth - 1]} 2024
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Vegetation Health</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-lg font-bold ${getVegetationColor(data.ndvi)}`}>
                {data.ndvi.toFixed(2)}
              </span>
              <Badge variant="outline" className="text-xs">
                {data.vegetation}
              </Badge>
            </div>
            <div className="mt-1">
              <Progress value={data.ndvi * 100} className="h-1" />
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Soil Moisture</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-foreground">
                {data.soilMoisture.toFixed(0)}%
              </span>
              <Badge variant="outline" className="text-xs">
                {data.soilMoisture > 60 ? 'Optimal' : data.soilMoisture > 40 ? 'Good' : 'Low'}
              </Badge>
            </div>
            <div className="mt-1">
              <Progress value={data.soilMoisture} className="h-1" />
            </div>
          </div>
        </div>

        {/* Weather Data */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <Thermometer className="w-4 h-4 text-primary mx-auto mb-1" />
            <div className="text-sm font-semibold text-foreground">
              {data.temperature.toFixed(1)}°C
            </div>
            <div className="text-xs text-muted-foreground">Temperature</div>
          </div>

          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <Droplets className="w-4 h-4 text-primary mx-auto mb-1" />
            <div className="text-sm font-semibold text-foreground">
              {data.precipitation.toFixed(0)}mm
            </div>
            <div className="text-xs text-muted-foreground">Precipitation</div>
          </div>

          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <Wind className="w-4 h-4 text-primary mx-auto mb-1" />
            <div className="text-sm font-semibold text-foreground">
              {(Math.random() * 15 + 5).toFixed(1)}km/h
            </div>
            <div className="text-xs text-muted-foreground">Wind Speed</div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Sun className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Risk Assessment</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Current Risk Level</span>
            <Badge variant={getRiskColor(data.risk) as any} className="text-xs">
              {data.risk} Risk
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            Based on vegetation health, soil moisture, and seasonal patterns
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-muted/50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-foreground mb-2">Recommendations</h4>
          <ul className="space-y-1">
            {data.recommendations.map((rec, index) => (
              <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>

        {/* Data Source Info */}
        <div className="text-xs text-muted-foreground bg-muted/30 rounded p-2">
          <strong>Data Source:</strong> {dataSource === 'nasa' ? 'NASA GIBS & POWER API' : 'Digital Earth Africa'} • 
          <strong> Last Updated:</strong> {new Date().toLocaleDateString()}
        </div>
      </div>
    </Card>
  );
};
