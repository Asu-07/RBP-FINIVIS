import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Download,
  Mail,
  FileText,
  Shield,
  Phone,
  Plane,
  Calendar,
  User,
  ArrowRight,
  AlertTriangle,
  Building2,
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { downloadPolicy } from "@/services/asegoInsuranceService";
import { toast } from "sonner";
import type { TripDetailsData } from "./TripDetailsStep";
import type { PlanData } from "./PlanSelectionStep";
import type { TravellersFormData } from "./TravellerDetailsStep";

interface PolicyIssuedStepProps {
  tripDetails: TripDetailsData;
  planData: PlanData;
  travellersData: TravellersFormData;
  policyNumber: string;
}

export const PolicyIssuedStep = ({
  tripDetails,
  planData,
  travellersData,
  policyNumber,
}: PolicyIssuedStepProps) => {
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);

  const planNames: Record<string, string> = {
    basic: "Basic",
    standard: "Standard",
    premium: "Premium",
  };

  const handleDownloadPolicy = async () => {
    if (!policyNumber) {
      toast.error("No policy number available");
      return;
    }

    setIsDownloading(true);
    const policies = policyNumber.split(',').map(p => p.trim());

    try {
      for (const pNo of policies) {
        const blob = await downloadPolicy(pNo);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Policy-${pNo}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      toast.success("Policy download started");
    } catch (error) {
      console.error("Download failed", error);
      toast.error("Failed to download policy PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      {/* Success Header */}
      <Card className="shadow-card border-success/30 bg-success/5 overflow-hidden">
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
          </motion.div>
          <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
            Policy Issued Successfully!
          </h1>
          <p className="text-muted-foreground mb-4">
            Your travel insurance policy has been issued by our partner insurer and is now active.
          </p>
          <Badge variant="outline" className="text-lg px-4 py-2">
            Policy No: {policyNumber}
          </Badge>
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
                This insurance policy is underwritten and issued by our partner insurance company.
                RBP FINIVIS acts solely as a facilitator/distributor for this insurance product.
                All claims and policy servicing will be handled directly by the insurer.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policy Summary */}
      <Card className="shadow-card">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-accent" />
            <h2 className="font-heading font-semibold text-lg">Policy Summary</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Plane className="h-4 w-4" />
                <span className="text-sm">Destination</span>
              </div>
              <div className="font-semibold">{tripDetails.destinationCountry}</div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Travel Dates</span>
              </div>
              <div className="font-semibold">
                {tripDetails.travelStartDate && format(tripDetails.travelStartDate, "dd MMM")} -{" "}
                {tripDetails.travelEndDate && format(tripDetails.travelEndDate, "dd MMM yyyy")}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <User className="h-4 w-4" />
                <span className="text-sm">Travellers</span>
              </div>
              <div className="font-semibold">
                {travellersData.travellers.map((t) => t.fullName).join(", ")}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Shield className="h-4 w-4" />
                <span className="text-sm">Plan</span>
              </div>
              <div className="font-semibold">
                {planNames[planData.selectedPlan]} ({planData.planType === "single" ? "Single Trip" : "Multi-Trip"})
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-muted-foreground">Premium Paid</div>
              <div className="text-2xl font-heading font-bold text-accent">
                ₹{planData.premium.toLocaleString()}
              </div>
            </div>
            <Badge variant="default" className="bg-success">
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <h3 className="font-heading font-semibold mb-4">Your Policy Documents</h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={handleDownloadPolicy}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Download className="h-5 w-5 text-accent" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Download Policy PDF</div>
                  <div className="text-sm text-muted-foreground">
                    Policy document issued by partner insurer
                  </div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Mail className="h-5 w-5 text-accent" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Email Sent</div>
                  <div className="text-sm text-muted-foreground">
                    Policy sent to {travellersData.travellers[0]?.email}
                  </div>
                </div>
              </div>
              <CheckCircle className="h-5 w-5 text-success" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Claims Info */}
      <Card className="shadow-card bg-muted/30">
        <CardContent className="p-6">
          <h3 className="font-heading font-semibold mb-4">How to File a Claim</h3>
          <div className="space-y-4 text-sm">
            <div className="flex gap-3">
              <Phone className="h-5 w-5 text-accent shrink-0" />
              <div>
                <div className="font-semibold">Cashless Medical Emergency</div>
                <p className="text-muted-foreground">
                  Contact the insurer's 24/7 helpline and share your policy number for instant cashless hospitalization at network hospitals.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <FileText className="h-5 w-5 text-accent shrink-0" />
              <div>
                <div className="font-semibold">Reimbursement Claims</div>
                <p className="text-muted-foreground">
                  Upload bills, tickets, and reports through your dashboard for quick reimbursement processing by the insurer.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Disclaimers */}
      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div className="text-sm space-y-2">
              <p className="font-semibold">Important Disclaimers</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• This policy is issued by our partner insurer, not RBP FINIVIS.</li>
                <li>• Policy number is generated by the insurer's system.</li>
                <li>• All claims are processed directly by the insurer.</li>
                <li>• RBP FINIVIS acts only as a facilitator/distributor.</li>
                <li>• Pre-existing conditions may have limited coverage as per policy terms.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate("/dashboard")} className="flex-1">
          Go to Dashboard
        </Button>
        <Button onClick={() => navigate("/")} className="flex-1">
          Back to Home
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
};
