import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MapPin, 
  Building2, 
  Truck,
  CheckCircle,
  Info,
} from "lucide-react";
import { MAX_DELIVERY_RADIUS_KM, type ValidationResult } from "@/utils/cityDistanceValidation";

export type DeliveryMode = "home_delivery" | "branch_pickup";

interface DeliveryModeSelectionProps {
  city: string;
  cityValidation: ValidationResult | null;
  value: DeliveryMode;
  onChange: (mode: DeliveryMode) => void;
}

// Branch details
const BRANCH_DETAILS = {
  name: "RBP FINIVIS Panchkula Branch",
  address: "Office No. 1, Haryana Agro Mall, Sector 20, Panchkula, Haryana",
  phone: "+91-XXXXXXXXXX",
  hours: "Mon-Sat: 10:00 AM - 6:00 PM",
};

export const DeliveryModeSelection = ({
  city,
  cityValidation,
  value,
  onChange,
}: DeliveryModeSelectionProps) => {
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>(value);

  // Check if doorstep delivery is available
  const isWithinRadius = cityValidation?.isValid === true;
  
  // If outside radius, force branch pickup
  useEffect(() => {
    if (city && !isWithinRadius && deliveryMode === "home_delivery") {
      setDeliveryMode("branch_pickup");
      onChange("branch_pickup");
    }
  }, [city, isWithinRadius, deliveryMode, onChange]);

  const handleSelect = (mode: DeliveryMode) => {
    if (mode === "home_delivery" && !isWithinRadius) {
      return; // Can't select doorstep if outside radius
    }
    setDeliveryMode(mode);
    onChange(mode);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Delivery / Collection Mode
        </h4>
        {deliveryMode === "branch_pickup" && (
          <Badge variant="outline" className="text-xs">Branch Collection</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Doorstep Delivery Option */}
        <button
          onClick={() => handleSelect("home_delivery")}
          disabled={!isWithinRadius}
          className={`p-4 rounded-xl border-2 transition-all text-left ${
            deliveryMode === "home_delivery"
              ? "border-primary bg-primary/5"
              : isWithinRadius
                ? "border-border hover:border-primary/50"
                : "border-muted bg-muted/30 cursor-not-allowed opacity-60"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
              deliveryMode === "home_delivery" 
                ? "bg-primary text-primary-foreground" 
                : isWithinRadius 
                  ? "bg-muted" 
                  : "bg-muted/50"
            }`}>
              <Truck className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Doorstep Delivery</span>
                {deliveryMode === "home_delivery" && (
                  <CheckCircle className="h-4 w-4 text-primary" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Currency delivered to your address
              </p>
              {!isWithinRadius && (
                <p className="text-xs text-destructive mt-2">
                  Not available for your location
                </p>
              )}
            </div>
          </div>
        </button>

        {/* Branch Pickup Option */}
        <button
          onClick={() => handleSelect("branch_pickup")}
          className={`p-4 rounded-xl border-2 transition-all text-left ${
            deliveryMode === "branch_pickup"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
              deliveryMode === "branch_pickup" ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}>
              <Building2 className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Branch Collection</span>
                {deliveryMode === "branch_pickup" && (
                  <CheckCircle className="h-4 w-4 text-primary" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Collect from Panchkula branch
              </p>
              <Badge variant="secondary" className="text-xs mt-2">
                Available for all locations
              </Badge>
            </div>
          </div>
        </button>
      </div>

      {/* Outside Radius Notice */}
      {city && !isWithinRadius && (
        <Alert className="bg-blue-500/10 border-blue-500/20">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-700 dark:text-blue-400">
            Doorstep delivery is available only within {MAX_DELIVERY_RADIUS_KM} km of Panchkula. 
            You may collect the currency from our Panchkula branch.
          </AlertDescription>
        </Alert>
      )}

      {/* Branch Details */}
      {deliveryMode === "branch_pickup" && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <h5 className="font-semibold flex items-center gap-2 mb-3">
              <Building2 className="h-4 w-4 text-primary" />
              Branch Collection Address
            </h5>
            <div className="space-y-2 text-sm">
              <p className="font-medium">{BRANCH_DETAILS.name}</p>
              <p className="text-muted-foreground">{BRANCH_DETAILS.address}</p>
              <p className="text-muted-foreground">
                <strong>Hours:</strong> {BRANCH_DETAILS.hours}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-4 italic">
              Branch collection is subject to availability and RBI guidelines.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
