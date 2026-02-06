import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ChevronDown, 
  ChevronUp, 
  Shield, 
  FileCheck,
  Info
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface RemittanceDeclarationProps {
  accepted: boolean;
  onAcceptChange: (accepted: boolean) => void;
  disabled?: boolean;
}

/**
 * Streamlined Remittance Declaration Component
 * 
 * Features:
 * - ONE visible mandatory checkbox with optimized wording
 * - Expandable detailed declaration (text-only, no extra checkboxes)
 * - Form A2 informational text
 * - Clean, bank-grade, non-threatening UI
 */
export const RemittanceDeclaration = ({
  accepted,
  onAcceptChange,
  disabled = false,
}: RemittanceDeclarationProps) => {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <Card className="border-primary/20">
      <CardContent className="pt-6 space-y-4">
        {/* Single Mandatory Checkbox */}
        <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border">
          <Checkbox
            id="remittance-compliance"
            checked={accepted}
            onCheckedChange={(checked) => onAcceptChange(checked === true)}
            disabled={disabled}
            className="mt-0.5"
          />
          <Label 
            htmlFor="remittance-compliance" 
            className="text-sm leading-relaxed cursor-pointer"
          >
            I confirm that this remittance is for a permitted purpose and complies with RBI's Liberalised Remittance Scheme (LRS) and FEMA regulations.
            <span className="text-destructive ml-1">*</span>
          </Label>
        </div>

        {/* Form A2 Informational Notice */}
        <div className="flex items-start gap-2 p-3 bg-accent/5 rounded-lg border border-accent/20">
          <FileCheck className="h-4 w-4 text-accent shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Form A2 will be generated and submitted automatically as per RBI guidelines.
          </p>
        </div>

        {/* Expandable Detailed Declaration */}
        <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm text-primary hover:underline w-full justify-center py-2">
            {detailsOpen ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Hide detailed declaration
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                View detailed declaration
              </>
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-3 p-4 bg-muted/30 rounded-lg border border-dashed space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Shield className="h-4 w-4 text-primary" />
                Detailed Declaration (For Reference)
              </div>
              <ul className="space-y-2 list-disc list-inside">
                <li>The transaction purpose is permitted under FEMA, 1999 and LRS guidelines</li>
                <li>Funds used for this remittance are from legitimate and lawfully earned sources</li>
                <li>This remittance is not for any prohibited purpose including margin trading, speculation, lottery, or purchase of crypto/virtual assets</li>
                <li>I authorize RBP FINIVIS Private Limited to submit Form A2 on my behalf to the Authorized Dealer</li>
                <li>All information provided is true, complete, and accurate to the best of my knowledge</li>
              </ul>
              <div className="pt-2 border-t text-xs">
                <p className="text-muted-foreground">
                  <Info className="h-3 w-3 inline mr-1" />
                  Making a false declaration is an offence under FEMA, 1999. International remittances are processed through RBI-authorised partner banks.
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Acceptance Confirmation */}
        {accepted && (
          <div className="flex items-center gap-2 p-3 bg-accent/10 rounded-lg border border-accent/20">
            <Shield className="h-4 w-4 text-accent shrink-0" />
            <p className="text-sm text-accent-foreground">
              Declaration accepted. You may proceed with payment.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
