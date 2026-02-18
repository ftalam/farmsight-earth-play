import { useEffect, useRef, useState, useCallback } from "react";
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
import { Slider } from "@/components/ui/slider";
import { Layers, Satellite, MapPin, Eye } from "lucide-react";
import { getDEAfricaLayers, fetchDEAfricaNDVI } from "@/lib/deAfricaService";
import { useToast } from "@/hooks/use-toast";
import "@arcgis/core/assets/esri/themes/light/main.css";

interface ArcGISMapViewProps {
  currentMonth: number;
  dataSource: 'nasa' | 'de-africa';
  location: { lat: number; lon: number; name: string };
  onLocationChange?: (location: { lat: number; lon: number; name: string }) => void;
}

// NDVI display mode: composite only or blended overlay
type NDVIMode = 'composite' | 'blend';

const NDVI_MODE_LABELS: Record<NDVIMode, string> = {
  composite: 'Satellite Composite',
  blend: 'NDVI Overlay'
};

// Returns a readable NDVI value description
function ndviHealthLabel(value: number): { label: string; color: string } {
  if (value > 0.6) return { label: 'Dense Vegetation', color: 'text-green-600' };
  if (value > 0.4) return { label: 'Moderate Vegetation', color: 'text-lime-600' };
  if (value > 0.2) return { label: 'Sparse Vegetation', color: 'text-yellow-600' };
  return { label: 'Bare/Stressed', color: 'text-red-600' };
}

export const ArcGISMapView = ({ currentMonth, dataSource, location, onLocationChange }: ArcGISMapViewProps) => {
  const mapDiv = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MapView | null>(null);
  const ndviLayerRef = useRef<WMSLayer | null>(null);
  const farmLayerRef = useRef<GraphicsLayer | null>(null);

  const [ndviMode, setNdviMode] = useState<NDVIMode>('composite');
  const [ndviOpacity, setNdviOpacity] = useState(70); // 0–100
  const [overlayLayers, setOverlayLayers] = useState({
    boundaries: false,
    roads: false,
    water: false,
    elevation: false
  });
  const [showPopup, setShowPopup] = useState(true);
  const [hoveredNDVI, setHoveredNDVI] = useState<number | null>(null);
  const [viewReady, setViewReady] = useState(false);

  const { toast } = useToast();

  // ── 1. Initialise the map once ────────────────────────────────────────────
  useEffect(() => {
    if (!mapDiv.current) return;

    const map = new Map({ basemap: "satellite" });

    const farmLayer = new GraphicsLayer({ title: "Farm Plot" });
    farmLayerRef.current = farmLayer;
    map.add(farmLayer);

    const mapView = new MapView({
      container: mapDiv.current,
      map,
      center: [location.lon, location.lat],
      zoom: 12,
      constraints: { minZoom: 6, maxZoom: 18 }
    });

    mapView.when(() => {
      setViewReady(true);
    });

    mapView.on("click", async (event) => {
      const lon = event.mapPoint.longitude;
      const lat = event.mapPoint.latitude;

      if (onLocationChange) {
        onLocationChange({ lat, lon, name: `Selected (${lat.toFixed(4)}, ${lon.toFixed(4)})` });
      }

      let ndviValue: number | null = null;
      try {
        // Always use DE Africa NDVI for the point value so it matches the NDVI overlay
        ndviValue = await fetchDEAfricaNDVI(lat, lon, new Date());
        setHoveredNDVI(ndviValue);
      } catch (error) {
        console.error("Error fetching DE Africa NDVI for clicked point:", error);
      }

      if (!showPopup) return;
      mapView.popup.open({
        location: event.mapPoint,
        content: `
          <div style="padding:8px;min-width:200px;">
            <p style="margin:0 0 4px;font-size:13px;"><strong>Lat:</strong> ${lat.toFixed(5)}</p>
            <p style="margin:0 0 4px;font-size:13px;"><strong>Lon:</strong> ${lon.toFixed(5)}</p>
            <p style="margin:4px 0 0;font-size:13px;"><strong>NDVI (DE Africa):</strong> ${ndviValue !== null ? ndviValue.toFixed(3) : "N/A"}</p>
          </div>`,
        title: "Selected Location"
      });
    });

    viewRef.current = mapView;

    return () => {
      mapView.destroy();
      viewRef.current = null;
      ndviLayerRef.current = null;
      farmLayerRef.current = null;
      setViewReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 2. Update farm marker when location changes ───────────────────────────
  useEffect(() => {
    const farmLayer = farmLayerRef.current;
    if (!farmLayer) return;

    farmLayer.removeAll();

    const marker = new Graphic({
      geometry: {
        type: "point",
        longitude: location.lon,
        latitude: location.lat
      } as any,
      symbol: {
        type: "simple-marker",
        color: [255, 99, 71],
        size: 18,
        outline: { color: [255, 255, 255], width: 3 }
      } as any,
      attributes: { name: location.name }
    });

    farmLayer.add(marker);

    if (viewRef.current) {
      viewRef.current.goTo({ center: [location.lon, location.lat] }, { animate: true, duration: 800 });
    }
  }, [location.lat, location.lon, location.name]);

  // ── 3. NDVI layer management ──────────────────────────────────────────────
  const applyNDVILayer = useCallback(() => {
    const view = viewRef.current;
    if (!view || !viewReady) return;

    const map = view.map as Map;

    // Remove old NDVI layer
    if (ndviLayerRef.current) {
      map.remove(ndviLayerRef.current);
      ndviLayerRef.current = null;
    }

    // In composite mode we keep only the satellite basemap (no NDVI overlay)
    if (ndviMode === 'composite') {
      map.basemap = "satellite" as any;
      return;
    }

    // Use Digital Earth Africa NDVI WMS layer for overlay
    const deAfricaLayers = getDEAfricaLayers();
    const ndviConfig = deAfricaLayers['NDVI Anomaly'];

    const ndviLayer = new WMSLayer({
      url: ndviConfig.url,
      sublayers: [{ name: ndviConfig.layers }],
      title: ndviConfig.title,
      opacity: ndviOpacity / 100
    } as any);

    ndviLayerRef.current = ndviLayer;
    map.add(ndviLayer);

    // Always keep satellite basemap under the NDVI overlay
    map.basemap = "satellite" as any;
  }, [ndviMode, ndviOpacity, viewReady]);

  useEffect(() => {
    applyNDVILayer();
  }, [applyNDVILayer]);

  // Update opacity live when slider changes (without removing/re-adding layer)
  useEffect(() => {
    if (ndviLayerRef.current && ndviMode === 'blend') {
      ndviLayerRef.current.opacity = ndviOpacity / 100;
    }
  }, [ndviOpacity, ndviMode]);

  // ── 4. DE Africa data source layer ───────────────────────────────────────
  useEffect(() => {
    const view = viewRef.current;
    if (!view || !viewReady) return;

    const map = view.map as Map;

    // Remove existing DE Africa layers
    const toRemove = map.layers.filter(l =>
      l.title?.includes('Fractional') || l.title?.includes('Cropland')
    );
    map.removeMany(toRemove.toArray());

    if (dataSource !== 'de-africa') return;

    const deAfricaLayers = getDEAfricaLayers();

    const fcLayer = new WMSLayer({
      url: deAfricaLayers['Fractional Cover'].url,
      sublayers: [{ name: deAfricaLayers['Fractional Cover'].layers }],
      title: "Fractional Cover",
      opacity: 0.6
    });
    map.add(fcLayer);
  }, [dataSource, viewReady]);

  // ── 5. Map overlay layers (boundaries, roads, etc.) ──────────────────────
  useEffect(() => {
    const view = viewRef.current;
    if (!view || !viewReady) return;

    const map = view.map as Map;

    const existing = map.layers.filter(l =>
      l.title?.includes('Boundaries') ||
      l.title?.includes('Roads') ||
      l.title?.includes('Water Bodies') ||
      l.title?.includes('Elevation')
    );
    map.removeMany(existing.toArray());

    if (overlayLayers.boundaries) {
      map.add(new FeatureLayer({
        url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Countries_(Generalized)/FeatureServer/0",
        title: "Country Boundaries",
        opacity: 0.7,
        renderer: {
          type: "simple",
          symbol: { type: "simple-line", color: [100, 100, 100, 0.8], width: 1 }
        } as any
      }));
    }

    if (overlayLayers.roads) {
      map.add(new TileLayer({
        url: "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer",
        title: "Roads",
        opacity: 0.6
      }));
    }

    if (overlayLayers.water) {
      map.add(new FeatureLayer({
        url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Water_Bodies/FeatureServer/0",
        title: "Water Bodies",
        opacity: 0.5,
        renderer: {
          type: "simple",
          symbol: { type: "simple-fill", color: [0, 100, 200, 0.5], outline: { color: [0, 50, 100, 0.8], width: 1 } }
        } as any
      }));
    }

    if (overlayLayers.elevation) {
      map.add(new TileLayer({
        url: "https://services.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer",
        title: "Elevation",
        opacity: 0.4
      }));
    }
  }, [overlayLayers, viewReady]);

  // ── Simulated NDVI value for the legend (based on month/season, used as fallback) ───────────
  const simulatedNDVI = (() => {
    const base = 0.35;
    const seasonal = Math.sin(((currentMonth - 3) / 12) * 2 * Math.PI) * 0.25;
    return Math.min(0.9, Math.max(0.1, base + seasonal));
  })();

  const displayNDVI = hoveredNDVI ?? simulatedNDVI;
  const health = ndviHealthLabel(displayNDVI);

  return (
    <Card className="overflow-hidden shadow-lg">
      {/* ── Header controls ──────────────────────────────────────────────── */}
      <div className="bg-card p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Satellite Map View</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Badge variant="outline" className="gap-1">
              <Satellite className="w-3 h-3" />
              {dataSource === 'nasa' ? 'NASA GIBS' : 'DE Africa'}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <MapPin className="w-3 h-3" />
              {location.name}
            </Badge>
          </div>
        </div>

        {/* ── NDVI Mode Selector ────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Vegetation (NDVI) View</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(NDVI_MODE_LABELS) as NDVIMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setNdviMode(mode)}
                className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-colors
                  ${ndviMode === mode
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted/50 text-foreground border-border hover:bg-muted'
                  }`}
              >
                {NDVI_MODE_LABELS[mode]}
              </button>
            ))}
          </div>
        </div>

        {/* ── Opacity slider (only in blend mode) ─────────────────────── */}
        {ndviMode === 'blend' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">NDVI Opacity</span>
              <span className="text-xs font-medium text-foreground">{ndviOpacity}%</span>
            </div>
            <Slider
              min={10}
              max={100}
              step={5}
              value={[ndviOpacity]}
              onValueChange={([v]) => setNdviOpacity(v)}
              className="w-full"
            />
          </div>
        )}

        {/* ── NDVI legend ──────────────────────────────────────────────── */}
        {ndviMode !== 'composite' && (
          <div className="rounded-lg bg-muted/50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">NDVI Legend</span>
              <span className={`text-xs font-semibold ${health.color}`}>{health.label}</span>
            </div>
            {/* Colour ramp */}
            <div className="flex h-3 w-full rounded overflow-hidden">
              <div className="flex-1 bg-[#a50026]" title="-0.2 – 0" />
              <div className="flex-1 bg-[#d73027]" title="0 – 0.1" />
              <div className="flex-1 bg-[#f46d43]" title="0.1 – 0.2" />
              <div className="flex-1 bg-[#fdae61]" title="0.2 – 0.3" />
              <div className="flex-1 bg-[#fee08b]" title="0.3 – 0.4" />
              <div className="flex-1 bg-[#d9ef8b]" title="0.4 – 0.5" />
              <div className="flex-1 bg-[#a6d96a]" title="0.5 – 0.6" />
              <div className="flex-1 bg-[#66bd63]" title="0.6 – 0.7" />
              <div className="flex-1 bg-[#1a9850]" title="0.7 – 0.8" />
              <div className="flex-1 bg-[#006837]" title="0.8 – 1.0" />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>−0.2 (Bare/Water)</span>
              <span>0.5</span>
              <span>1.0 (Dense)</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground">
                {hoveredNDVI !== null
                  ? "NDVI at selected point (DE Africa)"
                  : `Estimated NDVI (Month ${currentMonth})`}
              </span>
              <span className={`text-sm font-bold ${health.color}`}>{displayNDVI.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* ── Map Overlays ─────────────────────────────────────────────── */}
        <div className="space-y-2 pt-1 border-t border-border">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Map Overlays</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(overlayLayers) as Array<keyof typeof overlayLayers>).map((key) => (
              <div key={key} className="flex items-center space-x-2">
                <Switch
                  id={key}
                  checked={overlayLayers[key]}
                  onCheckedChange={(checked) =>
                    setOverlayLayers(prev => ({ ...prev, [key]: checked }))
                  }
                />
                <Label htmlFor={key} className="text-xs capitalize">{key}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* ── Interaction row ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-1 border-t border-border">
          <div className="flex items-center space-x-2">
            <Switch id="popup" checked={showPopup} onCheckedChange={setShowPopup} />
            <Label htmlFor="popup" className="text-xs">Click Info</Label>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => {
              if (viewRef.current) {
                viewRef.current.goTo({ center: [location.lon, location.lat], zoom: 12 });
                toast({ title: "Map Centered", description: `Focused on ${location.name}` });
              }
            }}
          >
            <MapPin className="w-3 h-3" />
            Centre
          </Button>
        </div>
      </div>

      {/* ── Map container ────────────────────────────────────────────────── */}
      <div ref={mapDiv} className="w-full h-[500px]" />

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div className="bg-muted/50 p-3 text-xs text-muted-foreground">
        <p>
          NDVI: Digital Earth Africa (Sentinel-2 derived) · Basemap: Esri Satellite ·{" "}
          {dataSource === 'nasa' ? 'NASA GIBS & POWER API' : 'Digital Earth Africa'} ·{" "}
          {location.lat.toFixed(4)}°, {location.lon.toFixed(4)}°
        </p>
      </div>
    </Card>
  );
};
