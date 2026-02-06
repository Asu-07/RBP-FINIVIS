import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, FileCheck } from "lucide-react";

interface CurrencyExchangeDeclarationProps {
  onAccept: (accepted: boolean) => void;
  accepted: boolean;
  exchangeType: "buy" | "sell";
}

/**
 * Streamlined Currency Exchange Declaration
 * 
 * Single checkbox pattern per FINAL MASTER PROMPT:
 * Buy Forex: ☐ I confirm that this currency exchange transaction complies with RBI and FEMA guidelines.
 * Sell Forex: ☐ I confirm that the foreign currency being sold was legally obtained and complies with RBI guidelines.
 */
export const CurrencyExchangeDeclaration = ({
  onAccept,
  accepted,
  exchangeType,
}: CurrencyExchangeDeclarationProps) => {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const checkboxText = exchangeType === "buy"
    ? "I confirm that this currency exchange transaction complies with RBI and FEMA guidelines."
    : "I confirm that the foreign currency being sold was legally obtained and complies with RBI guidelines.";

  const detailedDeclaration = exchangeType === "buy"
    ? [
        "This transaction is for a permitted purpose under FEMA, 1999",
        "The funds used are from legitimate and lawfully earned sources",
        "This is not for any prohibited purpose (gambling, crypto speculation, margin trading, etc.)",
        "I authorize Form A2 submission on my behalf as per RBI guidelines",
        "All information provided is true, complete, and accurate",
        "Acceptance of currency notes is subject to physical verification",
      ]
    : [
        "The foreign currency being sold was legally acquired",
        "The currency is genuine and not counterfeit",
        "I am the rightful owner of this currency or authorized to sell it",
        "This transaction complies with all applicable RBI and FEMA regulations",
        "Final acceptance is subject to physical verification of currency notes",
        "The denomination breakdown provided is accurate",
      ];

  return (
    <div className="space-y-3">
      {/* Single Mandatory Checkbox */}
      <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
        <Checkbox
          id="currency-exchange-declaration"
          checked={accepted}
          onCheckedChange={(checked) => onAccept(checked === true)}
          className="mt-0.5"
        />
        <div className="flex-1">
          <Label 
            htmlFor="currency-exchange-declaration" 
            className="text-sm font-medium cursor-pointer leading-relaxed"
          >
            {checkboxText}
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
              {detailedDeclaration.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
