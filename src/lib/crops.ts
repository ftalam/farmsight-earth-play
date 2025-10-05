export type CropKey =
  | 'wheat' | 'maize' | 'rice' | 'potatoes' | 'sorghum' | 'millet' | 'beans' | 'tea'
  | 'coffee' | 'sunflowers' | 'sugarcane' | 'avocado' | 'bananas' | 'onions' | 'cabbages' | 'tomatoes' | 'pineapples';

export interface CropDef {
  key: CropKey;
  label: string;
  tempOptimal: { min: number; max: number };
  rainfallAnnual: { min: number; max: number };
  droughtTolerance: 'low' | 'medium' | 'high';
}

export const CROPS: CropDef[] = [
  { key: 'wheat', label: 'Wheat', tempOptimal: { min: 15, max: 25 }, rainfallAnnual: { min: 500, max: 1300 }, droughtTolerance: 'low' },
  { key: 'maize', label: 'Maize (Corn)', tempOptimal: { min: 20, max: 30 }, rainfallAnnual: { min: 600, max: 1200 }, droughtTolerance: 'medium' },
  { key: 'rice', label: 'Rice', tempOptimal: { min: 20, max: 35 }, rainfallAnnual: { min: 1000, max: 2000 }, droughtTolerance: 'low' },
  { key: 'potatoes', label: 'Potatoes', tempOptimal: { min: 15, max: 20 }, rainfallAnnual: { min: 500, max: 700 }, droughtTolerance: 'low' },
  { key: 'sorghum', label: 'Sorghum', tempOptimal: { min: 12, max: 34 }, rainfallAnnual: { min: 400, max: 700 }, droughtTolerance: 'high' },
  { key: 'millet', label: 'Millet', tempOptimal: { min: 25, max: 35 }, rainfallAnnual: { min: 400, max: 800 }, droughtTolerance: 'high' },
  { key: 'beans', label: 'Beans', tempOptimal: { min: 18, max: 28 }, rainfallAnnual: { min: 400, max: 600 }, droughtTolerance: 'medium' },
  { key: 'tea', label: 'Tea', tempOptimal: { min: 17, max: 25 }, rainfallAnnual: { min: 1500, max: 2000 }, droughtTolerance: 'low' },
  { key: 'coffee', label: 'Coffee', tempOptimal: { min: 15, max: 30 }, rainfallAnnual: { min: 1200, max: 2200 }, droughtTolerance: 'medium' },
  { key: 'sunflowers', label: 'Sunflowers', tempOptimal: { min: 20, max: 25 }, rainfallAnnual: { min: 500, max: 800 }, droughtTolerance: 'medium' },
  { key: 'sugarcane', label: 'Sugarcane', tempOptimal: { min: 20, max: 32 }, rainfallAnnual: { min: 1200, max: 1500 }, droughtTolerance: 'low' },
  { key: 'avocado', label: 'Avocado', tempOptimal: { min: 16, max: 26 }, rainfallAnnual: { min: 1000, max: 1500 }, droughtTolerance: 'low' },
  { key: 'bananas', label: 'Bananas', tempOptimal: { min: 26, max: 30 }, rainfallAnnual: { min: 1200, max: 2500 }, droughtTolerance: 'low' },
  { key: 'onions', label: 'Onions', tempOptimal: { min: 15, max: 25 }, rainfallAnnual: { min: 350, max: 550 }, droughtTolerance: 'medium' },
  { key: 'cabbages', label: 'Cabbages', tempOptimal: { min: 15, max: 25 }, rainfallAnnual: { min: 500, max: 800 }, droughtTolerance: 'medium' },
  { key: 'tomatoes', label: 'Tomatoes', tempOptimal: { min: 21, max: 24 }, rainfallAnnual: { min: 600, max: 800 }, droughtTolerance: 'low' },
  { key: 'pineapples', label: 'Pineapples', tempOptimal: { min: 20, max: 30 }, rainfallAnnual: { min: 1000, max: 1500 }, droughtTolerance: 'medium' },
];

export function getCrops(): CropDef[] {
  return CROPS;
}

// Suitability: 0-100 based on current monthly temperature/precipitation proxy
// We approximate annual rainfall window using current precipitation and soil moisture as proxies.
import type { SatelliteData } from './satelliteData';

export function computeSuitability(data: SatelliteData, cropKey: CropKey): number {
  const crop = CROPS.find(c => c.key === cropKey);
  if (!crop) return 50;

  let score = 100;

  // Temperature penalty if outside optimal
  if (data.temperature < crop.tempOptimal.min) {
    score -= (crop.tempOptimal.min - data.temperature) * 3;
  } else if (data.temperature > crop.tempOptimal.max) {
    score -= (data.temperature - crop.tempOptimal.max) * 3;
  }

  // Moisture proxy using precipitation and soil moisture
  const monthlyRain = data.precipitation; // mm/month
  // Roughly compare to annual band by scaling monthly to annualized proxy (x12)
  const annualized = monthlyRain * 12;
  if (annualized < crop.rainfallAnnual.min) {
    const deficit = crop.rainfallAnnual.min - annualized;
    score -= Math.min(40, deficit / 30); // scale softly
  } else if (annualized > crop.rainfallAnnual.max) {
    const excess = annualized - crop.rainfallAnnual.max;
    score -= Math.min(30, excess / 40);
  }

  // Drought tolerance and soil moisture
  if (data.soilMoisture < 35) {
    if (crop.droughtTolerance === 'low') score -= 15;
    if (crop.droughtTolerance === 'medium') score -= 8;
  }

  // Clamp
  score = Math.max(0, Math.min(100, Math.round(score)));
  return score;
}
