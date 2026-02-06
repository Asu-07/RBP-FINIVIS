import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileCheck,
  ArrowLeft,
  MapPin,
  Users,
  Shield,
  User,
  AlertTriangle,
  CheckCircle,
  Building2,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { TravelInsuranceDeclaration } from "@/components/compliance/TravelInsuranceDeclaration";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import type { TripDetailsData } from "./TripDetailsStep";
import type { PlanData } from "./PlanSelectionStep";
import type { TravellersFormData } from "./TravellerDetailsStep";

interface ReviewConfirmStepProps {
  tripDetails: TripDetailsData;
  planData: PlanData;
  travellersData: TravellersFormData;
  onNext: () => void;
  onBack: () => void;
}

export const ReviewConfirmStep = ({
  tripDetails,
  planData,
  travellersData,
  onNext,
  onBack,
}: ReviewConfirmStepProps) => {
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [acceptedPartnerInsurer, setAcceptedPartnerInsurer] = useState(false);
  const { scrollToTop } = useAutoScroll();

  const canProceed = declarationAccepted && acceptedPartnerInsurer;
  
  const handleProceed = () => {
    scrollToTop();
    onNext();
  };

  const tripDays = tripDetails.travelEndDate && tripDetails.travelStartDate
    ? Math.ceil((tripDetails.travelEndDate.getTime() - tripDetails.travelStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 0;

  const planNames = {
    basic: "Basic",
    standard: "Standard",
    premium: "Premium",
  };

  const addOnNames: Record<string, string> = {
    adventure: "Adventure Sports",
    cancellation: "Trip Cancellation",
    gadget: "Gadget Protection",
    covid: "COVID-19 Cover",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Trip Summary */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent/10">
              <FileCheck className="h-6 w-6 text-accent" />
            </div>
            <div>
              <CardTitle>Review Your Details</CardTitle>
              <CardDescription>Please verify all information before proceeding</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Trip Details */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-accent" />
              Trip Details
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
              <div>
                <div className="text-sm text-muted-foreground">Destination</div>
                <div className="font-semibold">{tripDetails.destinationCountry}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Duration</div>
                <div className="font-semibold">{tripDays} Days</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Travel Dates</div>
                <div className="font-semibold">
                  {tripDetails.travelStartDate && format(tripDetails.travelStartDate, "dd MMM yyyy")}
                  {" → "}
                  {tripDetails.travelEndDate && format(tripDetails.travelEndDate, "dd MMM yyyy")}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Travellers</div>
                <div className="font-semibold">{tripDetails.numberOfTravellers}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Plan Details */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-accent" />
              Coverage Details
            </h3>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Badge variant="default" className="mb-2">
                    {planNames[planData.selectedPlan]} Plan
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {planData.planType === "single" ? "Single Trip" : "Multi-Trip Annual"}
                  </div>
                </div>
              </div>
              {planData.addOns.length > 0 && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Add-ons:</div>
                  <div className="flex flex-wrap gap-2">
                    {planData.addOns.map((addOn) => (
                      <Badge key={addOn} variant="secondary">
                        {addOnNames[addOn]}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Traveller Details */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-accent" />
              Traveller Information
            </h3>
            <div className="space-y-3">
              {travellersData.travellers.map((traveller, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-muted/50 flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-accent" />
                  </div>
                  <div className="flex-1 grid sm:grid-cols-2 gap-2">
                    <div>
                      <div className="font-semibold">{traveller.fullName}</div>
                      <div className="text-sm text-muted-foreground">
                        Passport: {traveller.passportNumber}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div>{traveller.email}</div>
                      <div>{traveller.mobile}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partner Insurer Notice */}
      <Card className="shadow-card border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Building2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Policy Issued by Partner Insurer</p>
              <p className="text-xs text-muted-foreground mt-1">
                This insurance policy will be underwritten and issued by our partner insurance company. 
                RBP FINIVIS acts solely as a facilitator/distributor for this insurance product and 
                does not underwrite or issue insurance policies. All claims and policy servicing will 
                be handled directly by the insurer.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Premium Summary */}
      <Card className="shadow-card border-accent/30 bg-accent/5">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Premium</div>
              <div className="text-3xl font-heading font-bold text-accent">
                ₹{planData.premium.toLocaleString()}
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div>Inclusive of GST</div>
              <div className="text-success flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Instant Policy
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partner Insurer Acknowledgment */}
      <Card className="shadow-card">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="partner-insurer"
              checked={acceptedPartnerInsurer}
              onCheckedChange={(checked) => setAcceptedPartnerInsurer(checked as boolean)}
            />
            <Label htmlFor="partner-insurer" className="text-sm leading-relaxed cursor-pointer">
              I understand that this policy will be <strong>issued by a partner insurer</strong>. 
              RBP FINIVIS acts only as a facilitator.
              <span className="text-destructive ml-1">*</span>
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Streamlined Declaration - Single Checkbox */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <TravelInsuranceDeclaration
            onAccept={setDeclarationAccepted}
            accepted={declarationAccepted}
          />
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-semibold">Important Notice</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Travel insurance is provided by partner insurers and is subject to policy terms.</li>
                <li>• Coverage starts only after policy issuance and trip commencement.</li>
                <li>• RBP FINIVIS does not underwrite or issue insurance policies.</li>
                <li>• Pre-existing medical conditions may have limited or no coverage.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleProceed}
          disabled={!canProceed}
          className="flex-1"
          size="lg"
        >
          Proceed to Payment
        </Button>
      </div>
    </motion.div>
  );
};
