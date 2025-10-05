import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Target, CheckCircle2, Users, Clock, Lightbulb } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const TeacherGuide = () => {
  return (
    <div className="space-y-6 py-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Teacher Guide</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          FarmSight Educational Farming Simulator - Complete Lesson Plan
        </p>
      </div>

      <Separator />

      {/* Overview */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Lesson Overview
        </h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 mt-0.5 text-primary" />
            <div>
              <span className="font-medium text-foreground">Duration:</span> 45-60 minutes
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 mt-0.5 text-primary" />
            <div>
              <span className="font-medium text-foreground">Grade Level:</span> 6-12 (Adaptable)
            </div>
          </div>
        </div>
      </Card>

      {/* Learning Objectives */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Learning Objectives</h3>
        <div className="space-y-2">
          {[
            "Understand how satellite data helps farmers make decisions",
            "Learn about NDVI and its role in measuring crop health",
            "Recognize the importance of soil moisture and rainfall patterns",
            "Develop critical thinking about resource management during droughts",
            "Apply scientific data to real-world agricultural problems"
          ].map((objective, i) => (
            <div key={i} className="flex gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{objective}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Concepts */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Key Concepts</h3>
        <div className="space-y-3">
          <Card className="p-3">
            <h4 className="font-medium text-sm text-foreground mb-1">NDVI (Normalized Difference Vegetation Index)</h4>
            <p className="text-xs text-muted-foreground">
              A measure of plant health using satellite imagery. Values range from -1 to 1, 
              with higher values indicating healthier, denser vegetation.
            </p>
          </Card>

          <Card className="p-3">
            <h4 className="font-medium text-sm text-foreground mb-1">Soil Moisture</h4>
            <p className="text-xs text-muted-foreground">
              The amount of water held in the soil. Critical for crop growth, typically 
              measured as a percentage. Most crops need 40-60% for optimal growth.
            </p>
          </Card>

          <Card className="p-3">
            <h4 className="font-medium text-sm text-foreground mb-1">Precipitation Patterns</h4>
            <p className="text-xs text-muted-foreground">
              Rainfall distribution over time. Understanding seasonal patterns helps farmers 
              plan planting, irrigation, and harvest times.
            </p>
          </Card>
        </div>
      </div>

      {/* Activity Structure */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Suggested Activity Flow</h3>
        <div className="space-y-3">
          <Card className="p-3 border-l-4 border-l-primary">
            <div className="flex items-start gap-2 mb-2">
              <Badge variant="outline" className="font-mono">5 min</Badge>
              <h4 className="font-medium text-sm text-foreground">Introduction</h4>
            </div>
            <p className="text-xs text-muted-foreground pl-14">
              Discuss how farmers traditionally made decisions vs. using satellite data. 
              Show examples of real satellite imagery from NASA and Digital Earth Africa.
            </p>
          </Card>

          <Card className="p-3 border-l-4 border-l-success">
            <div className="flex items-start gap-2 mb-2">
              <Badge variant="outline" className="font-mono">10 min</Badge>
              <h4 className="font-medium text-sm text-foreground">Guided Exploration</h4>
            </div>
            <p className="text-xs text-muted-foreground pl-14">
              Walk through the interface together. Demonstrate the time slider, explain each 
              data metric, and show how conditions change through the year.
            </p>
          </Card>

          <Card className="p-3 border-l-4 border-l-secondary">
            <div className="flex items-start gap-2 mb-2">
              <Badge variant="outline" className="font-mono">20 min</Badge>
              <h4 className="font-medium text-sm text-foreground">Independent Challenge</h4>
            </div>
            <p className="text-xs text-muted-foreground pl-14">
              Students complete the Dry Season Challenge scenario individually or in pairs. 
              They make decisions and try to achieve the highest score.
            </p>
          </Card>

          <Card className="p-3 border-l-4 border-l-warning">
            <div className="flex items-start gap-2 mb-2">
              <Badge variant="outline" className="font-mono">10 min</Badge>
              <h4 className="font-medium text-sm text-foreground">Discussion & Reflection</h4>
            </div>
            <p className="text-xs text-muted-foreground pl-14">
              Compare strategies, discuss what worked and why. Connect to real-world impacts 
              of climate change on agriculture.
            </p>
          </Card>
        </div>
      </div>

      {/* Discussion Questions */}
      <div>
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-warning" />
          Discussion Questions
        </h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• How does satellite data help farmers in remote areas?</p>
          <p>• What challenges do farmers face during dry seasons?</p>
          <p>• How might climate change affect farming in East Africa?</p>
          <p>• What other technologies could help farmers adapt?</p>
          <p>• How can we balance food production with environmental protection?</p>
        </div>
      </div>

      {/* Extensions */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Extension Activities</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Research real farmers using satellite data in their region</p>
          <p>• Compare dry season strategies across different climates</p>
          <p>• Create presentations on sustainable farming practices</p>
          <p>• Explore NASA and Digital Earth Africa websites for more data</p>
          <p>• Investigate local water management and conservation efforts</p>
        </div>
      </div>

      {/* Assessment */}
      <Card className="p-4 bg-success/5 border-success/20">
        <h3 className="font-semibold text-foreground mb-2">Assessment Criteria</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Understanding of satellite data concepts (NDVI, soil moisture)</p>
          <p>• Ability to interpret data visualizations</p>
          <p>• Quality of decision-making in the scenario</p>
          <p>• Explanation of reasoning behind choices</p>
          <p>• Connection to real-world agricultural challenges</p>
        </div>
      </Card>

      {/* Resources */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Additional Resources</h3>
        <div className="space-y-2 text-xs text-muted-foreground">
          <p>• NASA Earthdata: earthdata.nasa.gov</p>
          <p>• Digital Earth Africa: digitalearthafrica.org</p>
          <p>• USGS Earth Explorer: earthexplorer.usgs.gov</p>
          <p>• FAO Agricultural Data: fao.org/home/en</p>
        </div>
      </div>
    </div>
  );
};
