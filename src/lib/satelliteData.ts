// Satellite data service with live NASA and Digital Earth Africa integration

import { fetchNASAData } from './nasaDataService';
import { fetchDEAfricaData } from './deAfricaService';

export interface SatelliteData {
  month: number;
  season: string;
  ndvi: number; // 0-1 scale
  soilMoisture: number; // percentage
  precipitation: number; // mm
  temperature: number; // celsius
  rainfallPattern: number[]; // weekly pattern for visualization
  dataSource?: 'nasa' | 'de-africa' | 'simulated';
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

export const getSatelliteData = (month: number, dataSource: 'nasa' | 'de-africa' | 'simulated' = 'simulated'): SatelliteData => {
  const data = ANNUAL_DATA[month - 1];
  return { ...data, dataSource };
};

/**
 * Fetch live satellite data for a specific month and location
 */
export async function getLiveSatelliteData(
  month: number,
  lat: number,
  lon: number,
  dataSource: 'nasa' | 'de-africa'
): Promise<SatelliteData> {
  const year = new Date().getFullYear();
  const date = new Date(year, month - 1, 15); // Mid-month
  
  try {
    if (dataSource === 'nasa') {
      const startDate = new Date(date);
      startDate.setDate(1);
      const endDate = new Date(date);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      
      const data = await fetchNASAData(lat, lon, startDate, endDate);
      if (data.length > 0) {
        const avgData = data[Math.floor(data.length / 2)];
        return {
          month,
          season: getSeasonName(month),
          ndvi: avgData.ndvi,
          soilMoisture: avgData.soilMoisture,
          precipitation: avgData.precipitation,
          temperature: avgData.temperature,
          rainfallPattern: data.slice(0, 4).map(d => d.precipitation),
          dataSource: 'nasa'
        };
      }
    } else if (dataSource === 'de-africa') {
      const startDate = new Date(date);
      startDate.setDate(1);
      const endDate = new Date(date);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      
      const data = await fetchDEAfricaData(lat, lon, startDate, endDate);
      if (data.length > 0) {
        const avgData = data[Math.floor(data.length / 2)];
        return {
          month,
          season: getSeasonName(month),
          ndvi: avgData.ndvi,
          soilMoisture: avgData.soilMoisture,
          precipitation: avgData.precipitation,
          temperature: 27, // DE Africa doesn't provide temp directly
          rainfallPattern: data.slice(0, 4).map(d => d.precipitation),
          dataSource: 'de-africa'
        };
      }
    }
  } catch (error) {
    console.error('Error fetching live data, using simulated:', error);
  }
  
  // Fallback to simulated data
  return getSatelliteData(month, 'simulated');
}

function getSeasonName(month: number): string {
  if ([1, 2].includes(month)) return "Short Dry";
  if ([3, 4, 5].includes(month)) return "Long Rains";
  if ([6, 7, 8, 9].includes(month)) return "Long Dry";
  if ([10, 11, 12].includes(month)) return "Short Rains";
  return "Unknown";
}

export const getDecisions = (month: number): Decision[] => {
  const data = getSatelliteData(month);
  const decisions: Decision[] = [];

  // Helper predicates
  const isVeryDry = data.soilMoisture < 35;
  const isDry = data.soilMoisture < 45;
  const adequateMoisture = data.soilMoisture > 40;
  const vegetationLow = data.ndvi < 0.5;

  // Irrigation: good when dry; bad when moisture already adequate
  if (isDry) {
    decisions.push({
      type: "irrigation",
      label: "Apply Irrigation",
      description: "Use available water resources to supplement low rainfall",
      impact: 25,
      feedback: "Smart choice! Irrigation during dry periods helps maintain crop health and prevents yield loss."
    });
  } else {
    decisions.push({
      type: "irrigation",
      label: "Apply Irrigation",
      description: "Irrigating when soil is already moist can harm roots and waste water",
      impact: -15,
      feedback: "Over‑irrigation now could waterlog soils, increase disease risk, and wastes resources."
    });
  }

  // Drought-resistant crops: great when very dry and low vegetation; otherwise costly switch
  if (vegetationLow && isVeryDry) {
    decisions.push({
      type: "drought-crops",
      label: "Plant Drought-Resistant Crops",
      description: "Switch to varieties that need less water",
      impact: 30,
      feedback: "Excellent adaptation! Drought‑resistant crops like sorghum and millet suit current dry conditions."
    });
  } else {
    decisions.push({
      type: "drought-crops",
      label: "Plant Drought-Resistant Crops",
      description: "Switching crops at the wrong time can reduce yields",
      impact: -20,
      feedback: "Timing isn’t ideal for switching to drought‑resistant crops; stick with current plan for now."
    });
  }

  // Fertilizer: best when NDVI is moderate and moisture is adequate; negative otherwise
  if (data.ndvi < 0.6 && adequateMoisture) {
    decisions.push({
      type: "fertilizer",
      label: "Apply Organic Fertilizer",
      description: "Boost soil nutrients while moisture is adequate",
      impact: 20,
      feedback: "Good timing! Moist soils improve nutrient uptake and reduce burn risk."
    });
  } else {
    decisions.push({
      type: "fertilizer",
      label: "Apply Organic Fertilizer",
      description: "Fertilizer on dry or very lush fields is inefficient",
      impact: -10,
      feedback: "Poor timing: low moisture reduces uptake (or high canopy makes little difference). Consider waiting."
    });
  }

  // Mulching: useful under dry conditions; minor negative when already wet
  if (isDry) {
    decisions.push({
      type: "mulching",
      label: "Apply Mulch",
      description: "Cover soil to reduce water evaporation",
      impact: 15,
      feedback: "Wise conservation! Mulching reduces evaporation and improves soil health."
    });
  } else {
    decisions.push({
      type: "mulching",
      label: "Apply Mulch",
      description: "Mulch adds little benefit when moisture is already adequate",
      impact: -5,
      feedback: "Not harmful, but less useful right now; save labor and materials for later."
    });
  }

  // Water harvesting: best when rain is scarce; small negative if already plenty
  if (data.precipitation < 50) {
    decisions.push({
      type: "water-harvest",
      label: "Install Rainwater Harvesting",
      description: "Collect and store available rainfall",
      impact: 20,
      feedback: "Great planning! Rainwater harvesting builds resilience in dry periods."
    });
  } else {
    decisions.push({
      type: "water-harvest",
      label: "Install Rainwater Harvesting",
      description: "Infrastructure now may not be the best priority",
      impact: -5,
      feedback: "With sufficient rain, the immediate payoff is limited. Consider lower‑cost actions."
    });
  }

  // Monitoring: good if conditions are stable; negative if stressed and action needed
  const stressed = data.soilMoisture < 30 || data.ndvi < 0.4;
  if (stressed) {
    decisions.push({
      type: "monitor",
      label: "Continue Monitoring",
      description: "Watch satellite data and wait",
      impact: -10,
      feedback: "Conditions are stressed; inaction now may worsen outcomes. Consider irrigation or mulching."
    });
  } else {
    decisions.push({
      type: "monitor",
      label: "Continue Monitoring",
      description: "Wait for better conditions",
      impact: 5,
      feedback: "Patience is fine; keep monitoring to time interventions."
    });
  }

  return decisions;
};
