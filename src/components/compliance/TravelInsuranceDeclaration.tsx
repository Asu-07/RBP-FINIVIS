import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, FileCheck } from "lucide-react";

interface TravelInsuranceDeclarationProps {
  onAccept: (accepted: boolean) => void;
  accepted: boolean;
}

/**
 * Streamlined Travel Insurance Declaration
 * 
 * Single checkbox pattern per FINAL MASTER PROMPT:
 * ☐ I confirm that the information provided is true and accurate.
 */
export const TravelInsuranceDeclaration = ({
  onAccept,
  accepted,
}: TravelInsuranceDeclarationProps) => {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <div className="space-y-3">
      {/* Single Mandatory Checkbox */}
      <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
        <Checkbox
          id="travel-insurance-declaration"
          checked={accepted}
          onCheckedChange={(checked) => onAccept(checked === true)}
          className="mt-0.5"
        />
        <div className="flex-1">
          <Label 
            htmlFor="travel-insurance-declaration" 
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
            <p>By proceeding, I declare and confirm that:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>All information provided about travellers and trip details is true, complete, and accurate</li>
              <li>I have disclosed all pre-existing medical conditions that may affect coverage</li>
              <li>I understand that this policy is issued by a partner insurer and RBP FINIVIS acts only as a facilitator</li>
              <li>I have read and understood the policy terms, conditions, and exclusions</li>
              <li>Any misrepresentation may result in claim rejection or policy cancellation</li>
              <li>Coverage is subject to the terms and conditions of the insurance provider</li>
            </ul>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
