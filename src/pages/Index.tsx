import { useState } from "react";
import { MapView } from "@/components/MapView";
import { DataPanel } from "@/components/DataPanel";
import { TimeSlider } from "@/components/TimeSlider";
import { DecisionPanel } from "@/components/DecisionPanel";
import { ScenarioInfo } from "@/components/ScenarioInfo";
import { TeacherGuide } from "@/components/TeacherGuide";
import { Sprout, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Index = () => {
  const [currentMonth, setCurrentMonth] = useState(6); // Start in June (dry season)
  const [showGuide, setShowGuide] = useState(false);

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
        <ScenarioInfo currentMonth={currentMonth} />

        {/* Main Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Map and Timeline - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            <MapView currentMonth={currentMonth} />
            <TimeSlider currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
          </div>

          {/* Data Panels - Takes 1 column */}
          <div className="space-y-4">
            <DataPanel currentMonth={currentMonth} />
            <DecisionPanel currentMonth={currentMonth} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
