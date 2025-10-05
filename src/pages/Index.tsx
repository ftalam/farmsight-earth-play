import { useState } from "react";
import { MapView } from "@/components/MapView";
import { ArcGISMapView } from "@/components/ArcGISMapView";
import { DataPanel } from "@/components/DataPanel";
import { TimeSlider } from "@/components/TimeSlider";
import { DecisionPanel } from "@/components/DecisionPanel";
import { ScenarioInfo } from "@/components/ScenarioInfo";
import { TeacherGuide } from "@/components/TeacherGuide";
import { DataSourceSwitcher } from "@/components/DataSourceSwitcher";
import { Sprout, BookOpen, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Droplets, FlaskConical, DollarSign } from "lucide-react";
import { getSatelliteData } from "@/lib/satelliteData";
import { useEffect } from "react";

const Index = () => {
  const [currentMonth, setCurrentMonth] = useState(6); // Start in June (dry season)
  const [showGuide, setShowGuide] = useState(false);
  const [dataSource, setDataSource] = useState<'nasa' | 'de-africa'>('nasa');
  const [location] = useState({ lat: -1.2921, lon: 36.8219, name: "Kajiado, Kenya" }); // Default location
  const [mapView, setMapView] = useState<'simple' | 'arcgis'>('simple');

  // Initial constants per scenario
  const INITIAL_FUNDS = 1000;
  const INITIAL_WATER = 100;
  const INITIAL_FERTILIZER = 50;
  const INITIAL_SCORE = 0;

  // Resource and score state
  const [funds, setFunds] = useState(INITIAL_FUNDS);
  const [water, setWater] = useState(INITIAL_WATER);
  const [fertilizer, setFertilizer] = useState(INITIAL_FERTILIZER);
  const [score, setScore] = useState(INITIAL_SCORE);

  const { season } = getSatelliteData(currentMonth);

  // Reset at the start of every new scenario (season change)
  useEffect(() => {
    setFunds(INITIAL_FUNDS);
    setWater(INITIAL_WATER);
    setFertilizer(INITIAL_FERTILIZER);
    setScore(INITIAL_SCORE);
  }, [season]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-success">
              <Sprout className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">FarmSight</h1>
              <p className="text-sm text-muted-foreground">Learn farming with real satellite data</p>
            </div>
          </div>
          <Sheet open={showGuide} onOpenChange={setShowGuide}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Teacher Guide
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
              <TeacherGuide />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 space-y-4">
        {/* Scenario Info */}
        <ScenarioInfo 
          currentMonth={currentMonth}
        />

        {/* Score and Resources below Scenario */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-primary" />
              <div className="text-xs text-muted-foreground">Score</div>
            </div>
            <div className="text-2xl font-bold text-foreground">{score}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-primary" />
              <div className="text-xs text-muted-foreground">Funds</div>
            </div>
            <div className="text-2xl font-bold text-foreground">${funds}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Droplets className="w-4 h-4 text-secondary" />
                  <div className="text-xs text-muted-foreground">Water</div>
                </div>
                <div className="text-xl font-bold text-foreground">{water} L</div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FlaskConical className="w-4 h-4 text-success" />
                  <div className="text-xs text-muted-foreground">Fertilizer</div>
                </div>
                <div className="text-xl font-bold text-foreground">{fertilizer} kg</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Map and Timeline - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            <Tabs value={mapView} onValueChange={(v) => setMapView(v as 'simple' | 'arcgis')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="simple" className="gap-2">
                  <MapIcon className="w-4 h-4" />
                  Simple View
                </TabsTrigger>
                <TabsTrigger value="arcgis" className="gap-2">
                  <MapIcon className="w-4 h-4" />
                  Satellite Map
                </TabsTrigger>
              </TabsList>
              <TabsContent value="simple" className="mt-4">
                <MapView currentMonth={currentMonth} />
              </TabsContent>
              <TabsContent value="arcgis" className="mt-4">
                <ArcGISMapView 
                  currentMonth={currentMonth} 
                  dataSource={dataSource}
                  location={location}
                />
              </TabsContent>
            </Tabs>
            <TimeSlider currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
          </div>

          {/* Data Panels - Takes 1 column */}
          <div className="space-y-4">
            <DataSourceSwitcher 
              currentSource={dataSource}
              onSourceChange={setDataSource}
            />
            <DataPanel currentMonth={currentMonth} />
            <DecisionPanel 
              currentMonth={currentMonth}
              funds={funds}
              setFunds={setFunds}
              water={water}
              setWater={setWater}
              fertilizer={fertilizer}
              setFertilizer={setFertilizer}
              score={score}
              setScore={setScore}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
