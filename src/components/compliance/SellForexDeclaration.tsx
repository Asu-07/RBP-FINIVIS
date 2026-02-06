import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, FileCheck } from "lucide-react";

interface SellForexDeclarationProps {
  onAccept: (accepted: boolean) => void;
  accepted: boolean;
}

/**
 * Streamlined Sell Foreign Currency Declaration
 * 
 * Single checkbox pattern per FINAL MASTER PROMPT:
 * ☐ I confirm that the foreign currency being sold was legally obtained and complies with RBI guidelines.
 * 
 * No LRS checkbox (selling does not count towards LRS limit)
 * No TDS (selling does not attract TDS)
 */
export const SellForexDeclaration = ({
  onAccept,
  accepted,
}: SellForexDeclarationProps) => {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <div className="space-y-3">
      {/* Single Mandatory Checkbox */}
      <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
        <Checkbox
          id="sell-forex-declaration"
          checked={accepted}
          onCheckedChange={(checked) => onAccept(checked === true)}
          className="mt-0.5"
        />
        <div className="flex-1">
          <Label 
            htmlFor="sell-forex-declaration" 
            className="text-sm font-medium cursor-pointer leading-relaxed"
          >
            I confirm that the foreign currency being sold was legally obtained and complies with RBI guidelines.
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
              <li>The foreign currency being sold was legally acquired</li>
              <li>The currency is genuine and not counterfeit</li>
              <li>I am the rightful owner of this currency or authorized to sell it</li>
              <li>This transaction complies with all applicable RBI and FEMA regulations</li>
              <li>Final acceptance is subject to physical verification of currency notes</li>
              <li>The denomination breakdown provided is accurate</li>
            </ul>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
