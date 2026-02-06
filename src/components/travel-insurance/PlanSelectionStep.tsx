import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Shield, Check, ArrowLeft, Zap, Crown, Star, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { TripDetailsData } from "./TripDetailsStep";
import { getPlans, type AsegoPlanRoot, type AsegoPlan } from "@/services/asegoInsuranceService";
import { toast } from "sonner";
import { differenceInDays } from "date-fns";

export interface PlanData {
  planType: "single" | "multi";
  selectedPlan: string;
  selectedPlanObject?: AsegoPlan;
  insurerId?: string;
  addOns: string[];
  premium: number;
}

interface PlanSelectionStepProps {
  tripDetails: TripDetailsData;
  initialData?: Partial<PlanData>;
  onNext: (data: PlanData) => void;
  onBack: () => void;
}

const addOnOptions = [
  { id: "adventure", name: "Adventure Sports", price: 150, description: "Covers skiing, scuba diving, etc." },
  { id: "cancellation", name: "Trip Cancellation", price: 200, description: "Full refund on trip cancellation" },
  { id: "gadget", name: "Gadget Protection", price: 100, description: "Cover for electronics up to ₹50,000" },
  { id: "covid", name: "COVID-19 Cover", price: 75, description: "Extended COVID-related coverage" },
];

export const PlanSelectionStep = ({
  tripDetails,
  initialData,
  onNext,
  onBack
}: PlanSelectionStepProps) => {
  const [planType, setPlanType] = useState<"single" | "multi">(initialData?.planType || "single");
  const [selectedPlanId, setSelectedPlanId] = useState<string>(initialData?.selectedPlan || "");
  const [addOns, setAddOns] = useState<string[]>(initialData?.addOns || []);
  const [availablePlans, setAvailablePlans] = useState<AsegoPlanRoot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const [selectedInsurerId, setSelectedInsurerId] = useState<string>("");
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const tripDays = tripDetails.travelEndDate && tripDetails.travelStartDate
    ? differenceInDays(tripDetails.travelEndDate, tripDetails.travelStartDate) + 1
    : 7;

  useEffect(() => {
    const fetchPlans = async () => {
      if (!tripDetails.destinationCategoryId) {
        toast.error("Missing destination category");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const { data: plans, debug } = await getPlans(
          tripDays,
          tripDetails.travellerAges,
          tripDetails.destinationCategoryId
        );
        setAvailablePlans(plans);
        setDebugInfo(debug);

        // Auto-select first plan if none selected
        if (!selectedPlanId && plans.length > 0 && plans[0].plans.length > 0) {
          setSelectedPlanId(plans[0].plans[0].id);
          setSelectedInsurerId(plans[0].insurerId);
        } else if (initialData?.selectedPlan) {
          // Find insurer for selected plan
          const insurer = plans.find(root => root.plans.some(p => p.id === initialData.selectedPlan));
          if (insurer) setSelectedInsurerId(insurer.insurerId);
        }

      } catch (error: any) {
        console.error("Failed to fetch plans", error);
        setError(error.message || "Failed to fetch insurance plans");
        setAvailablePlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [tripDays, tripDetails.destinationCategoryId, tripDetails.travellerAges, retryTrigger]); // Dependencies

  // Flatten plans for easy access
  const allPlans = availablePlans.flatMap(root => root.plans.map(p => ({ ...p, insurerId: root.insurerId, insurerName: root.insurerName })));
  const selectedPlanData = allPlans.find(p => p.id === selectedPlanId);

  const calculatePremium = () => {
    if (!selectedPlanData) return 0;

    // Sum up premiums for all travellers for this plan
    // agePremiums in API response is typically an array of { age, premium }
    // We assume the API returns agePremiums matching the requested ages? 
    // OR it returns a rate card? Usually for a quote API, it returns the calculated premium for the request.
    // Let's assume agePremiums contains the calculated premium for each requested age (or mapping).
    // If it's a quote response, it should be specific to the request.

    let basePremium = 0;
    if (selectedPlanData.agePremiums) {
      basePremium = selectedPlanData.agePremiums.reduce((sum, item) => sum + item.premium, 0);
    }

    // Multi-trip multiplier (mock logic if not in API)
    if (planType === "multi") {
      basePremium *= 1.5; // Example scaling
    }

    // Add-ons
    const addOnTotal = addOns.reduce((sum, addOnId) => {
      const addOn = addOnOptions.find((a) => a.id === addOnId);
      return sum + (addOn?.price || 0) * tripDetails.numberOfTravellers;
    }, 0);

    return Math.round(basePremium + addOnTotal);
  };

  const premium = calculatePremium();

  const handleAddOnToggle = (addOnId: string) => {
    setAddOns((prev) =>
      prev.includes(addOnId) ? prev.filter((id) => id !== addOnId) : [...prev, addOnId]
    );
  };

  const handleContinue = () => {
    if (!selectedPlanData) {
      toast.error("Please select a plan");
      return;
    }
    onNext({
      planType,
      selectedPlan: selectedPlanId,
      selectedPlanObject: selectedPlanData,
      insurerId: selectedInsurerId || selectedPlanData.insurerId,
      addOns,
      premium,
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4 min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
        <p className="text-muted-foreground">Finding best plans for you...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="shadow-card border-destructive/20 bg-destructive/5">
        <CardContent className="p-8 text-center">
          <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-destructive">Failed to Load Plans</h3>
          <p className="text-destructive/80 mb-6">{error}</p>
          <div className="flex justify-center gap-4">
            <Button onClick={onBack} variant="outline" className="border-destructive/30 hover:bg-destructive/10 text-destructive">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={() => setRetryTrigger(prev => prev + 1)}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If no plans found
  if (!loading && availablePlans.length === 0) {
    return (
      <Card className="shadow-card">
        <CardContent className="p-8 text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Plans Found</h3>
          <p className="text-muted-foreground mb-6">We couldn't find any insurance plans for your specific criteria.</p>

          <div className="bg-muted/50 p-4 rounded-lg text-left text-xs font-mono mb-6 overflow-auto">
            <p className="font-semibold mb-2">Debug Criteria Sent to API:</p>
            <p>Region ID: {tripDetails.destinationCategoryId}</p>
            <p>Duration: {tripDays} days</p>
            <p>Travellers: {tripDetails.numberOfTravellers}</p>
            <p>Ages: {JSON.stringify(tripDetails.travellerAges)}</p>

            {debugInfo && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="font-semibold mb-1 text-red-500">API Debug Info:</p>
                <p className="mb-1"><span className="font-semibold">URL:</span> {debugInfo.url}</p>
                <div className="mt-2">
                  <span className="font-semibold">Raw Response:</span>
                  <pre className="mt-1 p-2 bg-black/10 rounded overflow-x-auto text-[10px]">
                    {JSON.stringify(debugInfo.rawResponse, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back & Modify
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Plan Type */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent/10">
              <Zap className="h-6 w-6 text-accent" />
            </div>
            <div>
              <CardTitle>Select Plan Type</CardTitle>
              <CardDescription>Choose between single trip or annual multi-trip coverage</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={() => setPlanType("single")}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all",
                planType === "single"
                  ? "border-accent bg-accent/5"
                  : "border-border hover:border-accent/50"
              )}
            >
              <div className="font-semibold mb-1">Single Trip</div>
              <p className="text-sm text-muted-foreground">
                Coverage for one trip ({tripDays} days)
              </p>
            </button>
            <button
              onClick={() => setPlanType("multi")}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all",
                planType === "multi"
                  ? "border-accent bg-accent/5"
                  : "border-border hover:border-accent/50"
              )}
            >
              <div className="font-semibold mb-1">Multi-Trip Annual</div>
              <p className="text-sm text-muted-foreground">
                Unlimited trips for 1 year (max 45 days/trip)
              </p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Choose Your Coverage</CardTitle>
          <CardDescription>Select a plan that best fits your travel needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {allPlans.map((plan) => {
              // Calculate display premium for this plan
              const displayPremium = plan.agePremiums ? plan.agePremiums.reduce((sum, x) => sum + x.premium, 0) : 0;

              return (
                <button
                  key={plan.id}
                  onClick={() => {
                    setSelectedPlanId(plan.id);
                    setSelectedInsurerId(plan.insurerId);
                  }}
                  className={cn(
                    "relative p-6 rounded-xl border-2 text-left transition-all",
                    selectedPlanId === plan.id
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-accent/50"
                  )}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn(
                      "p-2 rounded-lg",
                      selectedPlanId === plan.id ? "bg-accent/20" : "bg-muted"
                    )}>
                      <Shield className={cn(
                        "h-5 w-5",
                        selectedPlanId === plan.id ? "text-accent" : "text-muted-foreground"
                      )} />
                    </div>
                    <div>
                      <div className="font-heading font-semibold text-sm">{plan.displayName || plan.name}</div>
                      <div className="text-xs text-muted-foreground">
                        by {plan.insurerName}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-2xl font-bold text-accent">₹{displayPremium}</div>
                    <div className="text-xs text-muted-foreground">Total Premium (excl. GST)</div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Sum Insured:</span>{" "}
                      <span className="font-semibold">{plan.sumInsured}</span>
                    </div>
                  </div>

                  {plan.coverages && plan.coverages.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <div className="text-xs font-semibold uppercase text-muted-foreground">Key Benefits</div>
                      {plan.coverages.slice(0, 3).map((cov: any, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <Check className="h-3 w-3 text-success shrink-0" />
                          <span>{cov.coverage || cov}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Add-ons */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Optional Add-ons</CardTitle>
          <CardDescription>Enhance your coverage with additional protection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {addOnOptions.map((addOn) => (
              <div
                key={addOn.id}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all cursor-pointer",
                  addOns.includes(addOn.id)
                    ? "border-accent bg-accent/5"
                    : "border-border hover:border-accent/50"
                )}
                onClick={() => handleAddOnToggle(addOn.id)}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={addOns.includes(addOn.id)}
                    onCheckedChange={() => handleAddOnToggle(addOn.id)}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div className="font-semibold">{addOn.name}</div>
                      <Badge variant="secondary">+₹{addOn.price}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {addOn.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Premium Summary */}
      <Card className="shadow-card border-accent/30 bg-accent/5">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Total Premium</div>
              <div className="text-3xl font-heading font-bold text-accent">
                ₹{premium.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                {tripDetails.numberOfTravellers} traveller(s) • {tripDays} days • {selectedPlanData?.displayName || selectedPlanData?.name || "Selected"} Plan
              </div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleContinue} className="flex-1 sm:flex-none">
                Continue
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
