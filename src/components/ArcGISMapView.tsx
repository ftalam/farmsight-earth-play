import { useEffect, useRef, useState } from "react";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import TileLayer from "@arcgis/core/layers/TileLayer";
import WMSLayer from "@arcgis/core/layers/WMSLayer";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Layers, Satellite, MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getNASAGIBSLayers } from "@/lib/nasaDataService";
import { getDEAfricaLayers } from "@/lib/deAfricaService";
import "@arcgis/core/assets/esri/themes/light/main.css";

interface ArcGISMapViewProps {
  currentMonth: number;
  dataSource: 'nasa' | 'de-africa';
  location: { lat: number; lon: number; name: string };
}

export const ArcGISMapView = ({ currentMonth, dataSource, location }: ArcGISMapViewProps) => {
  const mapDiv = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<MapView | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<string>('basemap');

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

    // Add farm plot marker
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
        size: 12,
        outline: {
          color: [255, 255, 255],
          width: 2
        }
      },
      attributes: {
        name: location.name,
        type: "Farm Plot"
      }
    });

    farmPlotLayer.add(farmPlotGraphic);

    setView(mapView);

    return () => {
      mapView?.destroy();
    };
  }, [location.lat, location.lon, location.name]);

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
