// Mock satellite data service simulating NASA MODIS and Digital Earth Africa data

export interface SatelliteData {
  month: number;
  season: string;
  ndvi: number; // 0-1 scale
  soilMoisture: number; // percentage
  precipitation: number; // mm
  temperature: number; // celsius
  rainfallPattern: number[]; // weekly pattern for visualization
}

export interface Decision {
  type: string;
  label: string;
  description: string;
  impact: number;
  feedback: string;
}

// Simulated annual data for East Africa
const ANNUAL_DATA: SatelliteData[] = [
  // Jan - Dry season
  { month: 1, season: "Short Dry", ndvi: 0.45, soilMoisture: 35, precipitation: 45, temperature: 28, rainfallPattern: [20, 30, 15, 35] },
  // Feb - Dry season
  { month: 2, season: "Short Dry", ndvi: 0.42, soilMoisture: 32, precipitation: 40, temperature: 29, rainfallPattern: [15, 25, 20, 40] },
  // Mar - Start of long rains
  { month: 3, season: "Long Rains", ndvi: 0.55, soilMoisture: 52, precipitation: 95, temperature: 27, rainfallPattern: [60, 70, 80, 85] },
  // Apr - Peak long rains
  { month: 4, season: "Long Rains", ndvi: 0.72, soilMoisture: 68, precipitation: 145, temperature: 26, rainfallPattern: [85, 90, 75, 95] },
  // May - End of long rains
  { month: 5, season: "Long Rains", ndvi: 0.78, soilMoisture: 62, precipitation: 115, temperature: 26, rainfallPattern: [70, 65, 60, 55] },
  // Jun - Dry season begins
  { month: 6, season: "Long Dry", ndvi: 0.65, soilMoisture: 45, precipitation: 35, temperature: 27, rainfallPattern: [25, 20, 15, 10] },
  // Jul - Peak dry season
  { month: 7, season: "Long Dry", ndvi: 0.48, soilMoisture: 28, precipitation: 20, temperature: 28, rainfallPattern: [10, 8, 5, 7] },
  // Aug - Continued dry
  { month: 8, season: "Long Dry", ndvi: 0.38, soilMoisture: 22, precipitation: 18, temperature: 29, rainfallPattern: [5, 3, 8, 4] },
  // Sep - End of dry season
  { month: 9, season: "Long Dry", ndvi: 0.35, soilMoisture: 25, precipitation: 25, temperature: 29, rainfallPattern: [8, 10, 12, 15] },
  // Oct - Short rains start
  { month: 10, season: "Short Rains", ndvi: 0.52, soilMoisture: 48, precipitation: 85, temperature: 28, rainfallPattern: [50, 60, 65, 70] },
  // Nov - Peak short rains
  { month: 11, season: "Short Rains", ndvi: 0.68, soilMoisture: 62, precipitation: 125, temperature: 27, rainfallPattern: [75, 80, 70, 75] },
  // Dec - End of short rains
  { month: 12, season: "Short Rains", ndvi: 0.58, soilMoisture: 52, precipitation: 75, temperature: 27, rainfallPattern: [50, 45, 40, 35] }
];

export const getSatelliteData = (month: number): SatelliteData => {
  return ANNUAL_DATA[month - 1];
};

export const getDecisions = (month: number): Decision[] => {
  const data = getSatelliteData(month);
  const decisions: Decision[] = [];

  // Irrigation decision
  if (data.soilMoisture < 40) {
    decisions.push({
      type: "irrigation",
      label: "Apply Irrigation",
      description: "Use available water resources to supplement low rainfall",
      impact: 25,
      feedback: "Smart choice! Irrigation during dry periods helps maintain crop health and prevents yield loss."
    });
  }

  // Drought-resistant crops
  if (data.ndvi < 0.5 && data.soilMoisture < 35) {
    decisions.push({
      type: "drought-crops",
      label: "Plant Drought-Resistant Crops",
      description: "Switch to varieties that need less water",
      impact: 30,
      feedback: "Excellent adaptation! Drought-resistant crops like sorghum and millet are perfect for dry conditions."
    });
  }

  // Fertilizer application
  if (data.ndvi < 0.6 && data.soilMoisture > 40) {
    decisions.push({
      type: "fertilizer",
      label: "Apply Organic Fertilizer",
      description: "Boost soil nutrients while moisture is adequate",
      impact: 20,
      feedback: "Good timing! Applying fertilizer when soil moisture is adequate maximizes nutrient uptake."
    });
  }

  // Mulching
  if (data.soilMoisture < 45) {
    decisions.push({
      type: "mulching",
      label: "Apply Mulch",
      description: "Cover soil to reduce water evaporation",
      impact: 15,
      feedback: "Wise conservation! Mulching can reduce water loss by up to 70% and improves soil health."
    });
  }

  // Water harvesting
  if (data.precipitation < 50) {
    decisions.push({
      type: "water-harvest",
      label: "Install Rainwater Harvesting",
      description: "Collect and store available rainfall",
      impact: 20,
      feedback: "Great planning! Rainwater harvesting provides water security during dry spells."
    });
  }

  // Monitoring
  decisions.push({
    type: "monitor",
    label: "Continue Monitoring",
    description: "Watch satellite data and wait for better conditions",
    impact: 5,
    feedback: "Sometimes patience is wise. Keep monitoring the data to time your interventions perfectly."
  });

  return decisions;
};
