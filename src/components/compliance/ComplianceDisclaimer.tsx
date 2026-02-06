import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, Shield, Building2 } from "lucide-react";

interface ComplianceDisclaimerProps {
  type: "travel_insurance" | "education_loan" | "forex" | "remittance";
  variant?: "compact" | "full";
  className?: string;
}

const disclaimers = {
  travel_insurance: {
    title: "Travel Insurance Facilitation",
    icon: Shield,
    compact: "Policy issued by partner insurer. RBP FINIVIS acts as a facilitator/distributor only.",
    full: [
      "RBP FINIVIS Private Limited acts solely as a facilitator/distributor for travel insurance.",
      "All insurance policies are issued by our partner insurance companies who are licensed by IRDAI.",
      "Policy number and coverage details are generated and provided by the partner insurer.",
      "RBP FINIVIS does not underwrite, issue, or guarantee any insurance policy.",
      "Claims processing and settlement is handled directly by the partner insurer.",
      "RBP FINIVIS is not liable for any claims, disputes, or policy-related matters.",
    ],
    regulatory: "Insurance is subject to IRDAI regulations. Policy terms and conditions apply.",
  },
  education_loan: {
    title: "Education Loan Facilitation",
    icon: Building2,
    compact: "RBP FINIVIS does not sanction or disburse loans. Approval is solely at lender discretion.",
    full: [
      "RBP FINIVIS Private Limited acts solely as a facilitator connecting you with lending partners.",
      "RBP FINIVIS does not sanction, approve, or disburse any loans.",
      "Loan approval, interest rates, and terms are at the sole discretion of the lending institution.",
      "Your application may be shared with multiple lending partners for processing.",
      "RBP FINIVIS does not guarantee loan approval or any specific terms.",
      "All loan agreements are between you and the lending institution directly.",
    ],
    regulatory: "Lending is regulated by RBI. Loan terms are subject to lender policies.",
  },
  forex: {
    title: "Forex Exchange Services",
    icon: Shield,
    compact: "Services under RBI FFMC license. Subject to LRS limits and FEMA regulations.",
    full: [
      "RBP FINIVIS Private Limited is an RBI-licensed Full-Fledged Money Changer (FFMC).",
      "All forex transactions are subject to the Liberalised Remittance Scheme (LRS) limit of USD 250,000 per financial year.",
      "Cash forex is subject to RBI guidelines based on purpose and destination.",
      "Transactions require KYC verification and supporting documents as per FEMA regulations.",
      "Exchange rates are indicative and subject to change until rate lock confirmation.",
      "All transactions are reported to RBI as per regulatory requirements.",
    ],
    regulatory: "Licensed by RBI under FEMA 1999. Subject to PMLA and KYC requirements.",
  },
  remittance: {
    title: "Outward Remittance Services",
    icon: Shield,
    compact: "Subject to LRS limits and FEMA/RBI regulations. KYC mandatory for all remittances.",
    full: [
      "All outward remittances are processed under the Liberalised Remittance Scheme (LRS).",
      "Annual limit of USD 250,000 per financial year applies to all LRS transactions combined.",
      "Purpose of remittance must comply with permitted categories under FEMA.",
      "Form A2 will be submitted to the Authorized Dealer bank on your behalf.",
      "Certain transactions require prior RBI approval or specific documentation.",
      "Processing time depends on compliance verification and banking cut-off times.",
    ],
    regulatory: "Subject to FEMA 1999, RBI LRS guidelines, and PMLA requirements.",
  },
};

export function ComplianceDisclaimer({ type, variant = "compact", className }: ComplianceDisclaimerProps) {
  const disclaimer = disclaimers[type];
  const Icon = disclaimer.icon;

  if (variant === "compact") {
    return (
      <div className={`flex items-start gap-2 p-3 bg-muted/50 rounded-lg border text-xs text-muted-foreground ${className}`}>
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <div>
          <span className="font-medium">{disclaimer.title}: </span>
          {disclaimer.compact}
        </div>
      </div>
    );
  }

  return (
    <Card className={`border-muted ${className}`}>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon className="h-5 w-5 text-primary" />
          <h4 className="font-semibold text-sm">{disclaimer.title}</h4>
          <Badge variant="outline" className="text-xs">Important</Badge>
        </div>
        
        <ul className="space-y-1.5 text-xs text-muted-foreground mb-3">
          {disclaimer.full.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-muted-foreground/50">•</span>
              {item}
            </li>
          ))}
        </ul>
        
        <div className="flex items-start gap-2 p-2 bg-muted rounded text-xs">
          <AlertTriangle className="h-3.5 w-3.5 text-yellow-600 shrink-0 mt-0.5" />
          <span className="text-muted-foreground">{disclaimer.regulatory}</span>
        </div>
      </CardContent>
    </Card>
  );
}
