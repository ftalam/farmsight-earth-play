import { useEffect, useRef, useState } from "react";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import TileLayer from "@arcgis/core/layers/TileLayer";
import WMSLayer from "@arcgis/core/layers/WMSLayer";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Layers, Satellite, MapPin, Eye, EyeOff, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getNASAGIBSLayers } from "@/lib/nasaDataService";
import { getDEAfricaLayers } from "@/lib/deAfricaService";
import { useToast } from "@/hooks/use-toast";
import "@arcgis/core/assets/esri/themes/light/main.css";
import { getCrops } from "@/lib/crops";

interface ArcGISMapViewProps {
  currentMonth: number;
  dataSource: 'nasa' | 'de-africa';
  location: { lat: number; lon: number; name: string };
  selectedCrop?: import("@/lib/crops").CropKey;
  onCropChange?: (crop: import("@/lib/crops").CropKey) => void;
}

export const ArcGISMapView = ({ currentMonth, dataSource, location, selectedCrop, onCropChange }: ArcGISMapViewProps) => {
  const mapDiv = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<MapView | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<string>('basemap');
  const [overlayLayers, setOverlayLayers] = useState<{[key: string]: boolean}>({
    boundaries: false,
    roads: false,
    water: false,
    elevation: false
  });
  const [showPopup, setShowPopup] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!mapDiv.current) return;

    // Create map
    const map = new Map({
      basemap: "satellite"
    });

    // Create view
    const mapView = new MapView({
      container: mapDiv.current,
      map: map,
      center: [location.lon, location.lat],
      zoom: 12,
      constraints: {
        minZoom: 8,
        maxZoom: 16
      }
    });

    // Add farm plot marker with enhanced styling
    const farmPlotLayer = new GraphicsLayer();
    map.add(farmPlotLayer);

    const farmPlotGraphic = new Graphic({
      geometry: {
        type: "point",
        longitude: location.lon,
        latitude: location.lat
      },
      symbol: {
        type: "simple-marker",
        color: [255, 99, 71],
        size: 16,
        outline: {
          color: [255, 255, 255],
          width: 3
        }
      },
      attributes: {
        name: location.name,
        type: "Farm Plot",
        coordinates: `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`,
        status: "Active",
        lastUpdated: new Date().toLocaleDateString()
      }
    });

    farmPlotLayer.add(farmPlotGraphic);

    // Add click event for popup
    if (showPopup) {
      mapView.on("click", async (event) => {
        try {
          const hitTest = await mapView.hitTest(event);
          if (hitTest.results.length > 0) {
            const result = hitTest.results[0];
            if (result.type === "graphic" && result.graphic && result.graphic.attributes) {
              const graphic = result.graphic;
              const { name, type, coordinates, status, lastUpdated } = graphic.attributes;
              
              // Create popup content
              const popupContent = `
                <div style="padding: 10px; min-width: 200px;">
                  <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 16px; font-weight: bold;">${name}</h3>
                  <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px;"><strong>Type:</strong> ${type}</p>
                  <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px;"><strong>Coordinates:</strong> ${coordinates}</p>
                  <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px;"><strong>Status:</strong> <span style="color: #10b981;">${status}</span></p>
                  <p style="margin: 0; color: #6b7280; font-size: 12px;"><strong>Last Updated:</strong> ${lastUpdated}</p>
                </div>
              `;
              
              // Show popup at clicked location
              mapView.popup.open({
                location: event.mapPoint,
                content: popupContent,
                title: "Location Details"
              });
            }
          }
        } catch (error) {
          console.error("Error handling map click:", error);
        }
      });
    }

    setView(mapView);

    return () => {
      mapView?.destroy();
    };
  }, [location.lat, location.lon, location.name, showPopup]);

  // Handle overlay layers
  useEffect(() => {
    if (!view) return;

    const map = view.map as Map;
    
    // Remove existing overlay layers
    const existingOverlays = map.layers.filter(layer => 
      layer.title?.includes('Boundaries') || 
      layer.title?.includes('Roads') ||
      layer.title?.includes('Water') ||
      layer.title?.includes('Elevation')
    );
    map.removeMany(existingOverlays.toArray());

    // Add overlay layers based on state
    if (overlayLayers.boundaries) {
      const boundariesLayer = new FeatureLayer({
        url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Countries_(Generalized)/FeatureServer/0",
        title: "Country Boundaries",
        opacity: 0.7,
        renderer: {
          type: "simple",
          symbol: {
            type: "simple-line",
            color: [100, 100, 100, 0.8],
            width: 1
          }
        }
      });
      map.add(boundariesLayer);
    }

    if (overlayLayers.roads) {
      const roadsLayer = new TileLayer({
        url: "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer",
        title: "Roads",
        opacity: 0.6
      });
      map.add(roadsLayer);
    }

    if (overlayLayers.water) {
      const waterLayer = new FeatureLayer({
        url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Water_Bodies/FeatureServer/0",
        title: "Water Bodies",
        opacity: 0.5,
        renderer: {
          type: "simple",
          symbol: {
            type: "simple-fill",
            color: [0, 100, 200, 0.6],
            outline: {
              color: [0, 50, 100, 0.8],
              width: 1
            }
          }
        }
      });
      map.add(waterLayer);
    }

    if (overlayLayers.elevation) {
      const elevationLayer = new TileLayer({
        url: "https://services.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer",
        title: "Elevation",
        opacity: 0.4
      });
      map.add(elevationLayer);
    }
  }, [view, overlayLayers]);

  // Update satellite layers based on data source
  useEffect(() => {
    if (!view) return;

    const map = view.map as Map;
    
    // Remove existing overlay layers (keep basemap and farm plot)
    const layersToRemove = map.layers.filter(layer => 
      layer.title?.includes('NDVI') || 
      layer.title?.includes('Temperature') ||
      layer.title?.includes('Fractional') ||
      layer.title?.includes('Cropland')
    );
    map.removeMany(layersToRemove.toArray());

    if (selectedLayer === 'basemap') return;

    // Add appropriate layer based on data source
    if (dataSource === 'nasa') {
      const nasaLayers = getNASAGIBSLayers();
      if (selectedLayer === 'ndvi') {
        // NASA GIBS WMTS layer
        const ndviLayer = new TileLayer({
          url: "https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Terra_NDVI_8Day/default/{level}/{row}/{col}.png",
          title: "MODIS Terra NDVI",
          opacity: 0.7
        });
        map.add(ndviLayer);
      }
    } else if (dataSource === 'de-africa') {
      const deAfricaLayers = getDEAfricaLayers();
      if (selectedLayer === 'fractional-cover') {
        const fcLayer = new WMSLayer({
          url: deAfricaLayers['Fractional Cover'].url,
          sublayers: [{
            name: deAfricaLayers['Fractional Cover'].layers
          }],
          title: "Fractional Cover",
          opacity: 0.7
        });
        map.add(fcLayer);
      } else if (selectedLayer === 'cropland') {
        const croplandLayer = new WMSLayer({
          url: deAfricaLayers['Cropland Extent'].url,
          sublayers: [{
            name: deAfricaLayers['Cropland Extent'].layers
          }],
          title: "Cropland Extent",
          opacity: 0.7
        });
        map.add(croplandLayer);
      }
    }
  }, [view, dataSource, selectedLayer]);

  return (
    <Card className="overflow-hidden shadow-lg">
      <div className="bg-card p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Satellite Map View</h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Satellite className="w-3 h-3" />
              {dataSource === 'nasa' ? 'NASA' : 'DE Africa'}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <MapPin className="w-3 h-3" />
              {location.name}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <Select value={selectedCrop} onValueChange={v => onCropChange && onCropChange(v as any)}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Select crop" />
            </SelectTrigger>
            <SelectContent>
              {getCrops().map(c => (
                <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Select value={selectedLayer} onValueChange={setSelectedLayer}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select layer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basemap">Satellite Basemap Only</SelectItem>
              {dataSource === 'nasa' && (
                <>
                  <SelectItem value="ndvi">MODIS NDVI (Vegetation)</SelectItem>
                  <SelectItem value="temperature">Land Surface Temperature</SelectItem>
                </>
              )}
              {dataSource === 'de-africa' && (
                <>
                  <SelectItem value="fractional-cover">Fractional Cover</SelectItem>
                  <SelectItem value="cropland">Cropland Extent</SelectItem>
                  <SelectItem value="water">Water Observations</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

          {/* Overlay Controls */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Map Overlays</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="boundaries"
                  checked={overlayLayers.boundaries}
                  onCheckedChange={(checked) => 
                    setOverlayLayers(prev => ({ ...prev, boundaries: checked }))
                  }
                />
                <Label htmlFor="boundaries" className="text-xs">Boundaries</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="roads"
                  checked={overlayLayers.roads}
                  onCheckedChange={(checked) => 
                    setOverlayLayers(prev => ({ ...prev, roads: checked }))
                  }
                />
                <Label htmlFor="roads" className="text-xs">Roads</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="water"
                  checked={overlayLayers.water}
                  onCheckedChange={(checked) => 
                    setOverlayLayers(prev => ({ ...prev, water: checked }))
                  }
                />
                <Label htmlFor="water" className="text-xs">Water</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="elevation"
                  checked={overlayLayers.elevation}
                  onCheckedChange={(checked) => 
                    setOverlayLayers(prev => ({ ...prev, elevation: checked }))
                  }
                />
                <Label htmlFor="elevation" className="text-xs">Elevation</Label>
              </div>
            </div>
          </div>

          {/* Interaction Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center space-x-2">
              <Switch
                id="popup"
                checked={showPopup}
                onCheckedChange={setShowPopup}
              />
              <Label htmlFor="popup" className="text-xs">Click Info</Label>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (view) {
                  view.goTo({
                    center: [location.lon, location.lat],
                    zoom: 12
                  });
                  toast({
                    title: "Map Centered",
                    description: `Focused on ${location.name}`,
                  });
                }
              }}
              className="gap-1"
            >
              <MapPin className="w-3 h-3" />
              Center
            </Button>
          </div>
        </div>
      </div>

      <div ref={mapDiv} className="w-full h-[500px]" />

      <div className="bg-muted/50 p-3 text-xs text-muted-foreground">
        <p>
          Data Source: {dataSource === 'nasa' ? 'NASA GIBS & POWER API' : 'Digital Earth Africa'} • 
          Powered by Esri ArcGIS • Location: {location.lat.toFixed(4)}°N, {location.lon.toFixed(4)}°E
        </p>
      </div>
    </Card>
  );
};
