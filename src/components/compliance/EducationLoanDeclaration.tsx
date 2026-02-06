import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, FileCheck, Info } from "lucide-react";

interface EducationLoanDeclarationProps {
  onAccept: (accepted: boolean) => void;
  accepted: boolean;
}

/**
 * Streamlined Education Loan Declaration
 * 
 * Single checkbox pattern per FINAL MASTER PROMPT:
 * ☐ I confirm that the information provided is true and accurate.
 * 
 * Text disclaimer (no checkbox):
 * "RBP FINIVIS acts as a facilitator only. Loan approval is solely at lender discretion."
 */
export const EducationLoanDeclaration = ({
  onAccept,
  accepted,
}: EducationLoanDeclarationProps) => {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Mandatory Facilitator Disclaimer (Text only, no checkbox) */}
      <Alert className="bg-primary/5 border-primary/20">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          RBP FINIVIS acts as a facilitator only. Loan approval is solely at lender discretion.
        </AlertDescription>
      </Alert>

      {/* Single Mandatory Checkbox */}
      <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
        <Checkbox
          id="education-loan-declaration"
          checked={accepted}
          onCheckedChange={(checked) => onAccept(checked === true)}
          className="mt-0.5"
        />
        <div className="flex-1">
          <Label 
            htmlFor="education-loan-declaration" 
            className="text-sm font-medium cursor-pointer leading-relaxed"
          >
            I confirm that the information provided is true and accurate.
            <span className="text-destructive ml-1">*</span>
          </Label>
        </div>
      </div>

      {/* Expandable Detailed Declaration */}
      <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm text-primary hover:underline">
          <FileCheck className="h-4 w-4" />
          View detailed declaration
          <ChevronDown className={`h-4 w-4 transition-transform ${detailsOpen ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground space-y-2">
            <p>By submitting this application, I declare and confirm that:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>All personal, academic, and financial information provided is true and accurate</li>
              <li>All uploaded documents are genuine and unaltered</li>
              <li>I understand that loan approval is at the sole discretion of the lending institution</li>
              <li>RBP FINIVIS is acting only as a facilitator and does not guarantee loan approval</li>
              <li>I authorize RBP FINIVIS to share my application details with partner lenders</li>
              <li>I understand that providing false information may result in application rejection</li>
            </ul>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
