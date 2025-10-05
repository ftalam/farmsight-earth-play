import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Navigation, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Location {
  lat: number;
  lon: number;
  name: string;
}

interface LocationInputProps {
  currentLocation: Location;
  onLocationChange: (location: Location) => void;
}

const predefinedLocations: Location[] = [
  { lat: -1.2921, lon: 36.8219, name: "Kajiado, Kenya" },
  { lat: -0.0236, lon: 37.9062, name: "Embu, Kenya" },
  { lat: -1.9441, lon: 30.0619, name: "Kigali, Rwanda" },
  { lat: -6.7924, lon: 39.2083, name: "Dar es Salaam, Tanzania" },
  { lat: 1.3733, lon: 32.2903, name: "Kampala, Uganda" },
  { lat: -15.3875, lon: 28.3228, name: "Lusaka, Zambia" },
  { lat: -26.2041, lon: 28.0473, name: "Johannesburg, South Africa" },
  { lat: -33.9249, lon: 18.4241, name: "Cape Town, South Africa" },
  { lat: 9.6412, lon: -13.5784, name: "Conakry, Guinea" },
  { lat: 6.5244, lon: 3.3792, name: "Lagos, Nigeria" }
];

export const LocationInput = ({ currentLocation, onLocationChange }: LocationInputProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const handleLocationSelect = async (location: Location) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      onLocationChange(location);
      toast({
        title: "Location Updated",
        description: `Now viewing data for ${location.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update location",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoordinateInput = async () => {
    const coords = searchQuery.split(',').map(c => parseFloat(c.trim()));
    if (coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) {
      toast({
        title: "Invalid Coordinates",
        description: "Please enter coordinates in format: latitude, longitude",
        variant: "destructive",
      });
      return;
    }

    const [lat, lon] = coords;
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      toast({
        title: "Invalid Coordinates",
        description: "Latitude must be between -90 and 90, longitude between -180 and 180",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Reverse geocoding simulation
      await new Promise(resolve => setTimeout(resolve, 1000));
      const location: Location = {
        lat,
        lon,
        name: `Custom Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`
      };
      onLocationChange(location);
      toast({
        title: "Location Updated",
        description: `Now viewing data for coordinates ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process coordinates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Simulate reverse geocoding
          await new Promise(resolve => setTimeout(resolve, 1000));
          const location: Location = {
            lat: latitude,
            lon: longitude,
            name: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
          };
          onLocationChange(location);
          toast({
            title: "Location Updated",
            description: `Using your current location`,
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to process current location",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        toast({
          title: "Location Access Denied",
          description: "Please enable location access or use predefined locations",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    );
  };

  const filteredLocations = predefinedLocations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="overflow-hidden">
      <div className="bg-card p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Location Selector</h3>
        </div>
        
        <div className="space-y-3">
          {/* Current Location Display */}
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <Badge variant="outline" className="gap-1">
              <MapPin className="w-3 h-3" />
              Current
            </Badge>
            <span className="text-sm text-foreground">{currentLocation.name}</span>
            <span className="text-xs text-muted-foreground ml-auto">
              {currentLocation.lat.toFixed(4)}, {currentLocation.lon.toFixed(4)}
            </span>
          </div>

          {/* Coordinate Input */}
          <div className="space-y-2">
            <Label htmlFor="coordinates" className="text-sm font-medium">
              Enter Coordinates (lat, lon)
            </Label>
            <div className="flex gap-2">
              <Input
                id="coordinates"
                placeholder="e.g., -1.2921, 36.8219"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCoordinateInput()}
                disabled={isLoading}
              />
              <Button 
                onClick={handleCoordinateInput}
                disabled={isLoading || !searchQuery}
                size="sm"
                variant="outline"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Current Location Button */}
          <Button
            onClick={getCurrentLocation}
            disabled={isLoading}
            variant="outline"
            className="w-full gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            Use Current Location
          </Button>
        </div>
      </div>

      <div className="p-4">
        <h4 className="text-sm font-medium text-foreground mb-3">Predefined Locations</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredLocations.map((location) => (
            <Button
              key={`${location.lat}-${location.lon}`}
              onClick={() => handleLocationSelect(location)}
              disabled={isLoading}
              variant="ghost"
              className="w-full justify-start text-left h-auto p-3"
            >
              <div className="flex flex-col items-start gap-1">
                <span className="text-sm font-medium text-foreground">
                  {location.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
};
