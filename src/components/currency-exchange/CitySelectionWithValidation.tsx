import { useState, useEffect, useMemo, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  MapPin,
  CheckCircle,
  AlertCircle,
  Navigation,
  Search,
} from "lucide-react";
import {
  PREDEFINED_CITIES,
  validateCityDistance,
  searchCities,
  type CityData,
  type ValidationResult,
  MAX_DELIVERY_RADIUS_KM,
} from "@/utils/cityDistanceValidation";

interface CitySelectionWithValidationProps {
  value: string;
  onChange: (city: string, validation: ValidationResult) => void;
  error?: string;
}

export const CitySelectionWithValidation = ({
  value,
  onChange,
  error,
}: CitySelectionWithValidationProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get filtered cities based on input
  const filteredCities = useMemo(() => {
    return searchCities(inputValue);
  }, [inputValue]);

  // Validate when input changes
  useEffect(() => {
    if (inputValue && inputValue.trim().length > 0) {
      const result = validateCityDistance(inputValue);
      setValidation(result);
    } else {
      setValidation(null);
    }
  }, [inputValue]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectCity = (city: CityData) => {
    setInputValue(city.name);
    const result = validateCityDistance(city.name);
    setValidation(result);
    onChange(city.name, result);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);

    if (newValue.trim().length > 0) {
      const result = validateCityDistance(newValue);
      onChange(newValue, result);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label className="flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        City for Pickup/Delivery <span className="text-destructive">*</span>
      </Label>

      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder="Type or select a city..."
            className={`pl-10 h-12 ${validation?.isValid === false
              ? "border-destructive focus-visible:ring-destructive"
              : validation?.isValid === true
                ? "border-green-500 focus-visible:ring-green-500"
                : ""
              }`}
          />
          {validation?.isValid === true && (
            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
          )}
          {validation?.isValid === false && inputValue && (
            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-destructive" />
          )}
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div
            className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
          >
            <div className="max-h-[300px] overflow-y-auto">
              {filteredCities.length > 0 ? (
                <div className="p-1">
                  {filteredCities.map((city) => (
                    <button
                      key={`${city.name}-${city.state}`}
                      type="button"
                      onClick={() => handleSelectCity(city)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-md transition-colors hover:bg-accent ${inputValue.toLowerCase() === city.name.toLowerCase()
                        ? "bg-accent"
                        : ""
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <Navigation className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <span className="font-medium">{city.name}</span>
                          <span className="text-muted-foreground text-sm ml-2">
                            ({city.state})
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {city.distanceFromPanchkula} km
                      </Badge>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  <p className="text-sm">No cities found matching "{inputValue}"</p>
                  <p className="text-xs mt-1">
                    Delivery is only available within {MAX_DELIVERY_RADIUS_KM} km of Panchkula
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Validation Message */}
      {validation && (
        <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${validation.isValid
          ? "bg-green-500/10 border border-green-500/20"
          : "bg-destructive/10 border border-destructive/20"
          }`}>
          {validation.isValid ? (
            <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          )}
          <p className={validation.isValid ? "text-green-700 dark:text-green-400" : "text-destructive"}>
            {validation.message}
          </p>
        </div>
      )}

      {/* Delivery Radius Notice */}
      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
        <p className="text-xs text-muted-foreground">
          Home delivery available only within {MAX_DELIVERY_RADIUS_KM} km of Panchkula, Haryana.
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};
