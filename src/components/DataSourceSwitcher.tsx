import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Satellite, Globe, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DataSourceSwitcherProps {
  currentSource: 'nasa' | 'de-africa';
  onSourceChange: (source: 'nasa' | 'de-africa') => void;
}

export const DataSourceSwitcher = ({ currentSource, onSourceChange }: DataSourceSwitcherProps) => {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Satellite className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Data Source</h3>
        </div>
        <Badge variant={currentSource === 'nasa' ? 'default' : 'secondary'}>
          {currentSource === 'nasa' ? 'NASA' : 'DE Africa'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={currentSource === 'nasa' ? 'default' : 'outline'}
                className="w-full flex flex-col gap-1 h-auto py-3"
                onClick={() => onSourceChange('nasa')}
              >
                <Satellite className="w-5 h-5" />
                <span className="text-sm font-semibold">NASA</span>
                <span className="text-xs opacity-80">Global Coverage</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="max-w-xs">
                <p className="font-semibold mb-1">NASA Earth Observing System</p>
                <p className="text-xs">MODIS, SMAP, GPM data products. Global coverage with 250m-10km resolution.</p>
                <p className="text-xs mt-1"><strong>Best for:</strong> Global context, coarse-scale analysis</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={currentSource === 'de-africa' ? 'default' : 'outline'}
                className="w-full flex flex-col gap-1 h-auto py-3"
                onClick={() => onSourceChange('de-africa')}
              >
                <Globe className="w-5 h-5" />
                <span className="text-sm font-semibold">DE Africa</span>
                <span className="text-xs opacity-80">High Resolution</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="max-w-xs">
                <p className="font-semibold mb-1">Digital Earth Africa</p>
                <p className="text-xs">Sentinel-2 & Landsat analysis-ready data. Africa-focused with 10-30m resolution.</p>
                <p className="text-xs mt-1"><strong>Best for:</strong> Detailed field-level monitoring in Africa</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="mt-3 p-3 bg-muted/50 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            {currentSource === 'nasa' 
              ? 'NASA provides global satellite data from MODIS, SMAP, and GPM instruments. Lower resolution but excellent for understanding large-scale patterns.'
              : 'Digital Earth Africa offers high-resolution Sentinel-2 and Landsat imagery optimized for African agricultural monitoring with 10-30m resolution.'
            }
          </p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground">
          <strong>Current capabilities:</strong> Both sources use live APIs with fallback to seasonal models for East Africa
        </p>
      </div>
    </Card>
  );
};
