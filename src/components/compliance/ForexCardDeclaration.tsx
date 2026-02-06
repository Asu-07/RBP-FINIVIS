import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Shield } from "lucide-react";

interface ForexCardDeclarationProps {
  mode: "new" | "topup";
  accepted: boolean;
  onAcceptChange: (accepted: boolean) => void;
}

export const ForexCardDeclaration = ({
  mode,
  accepted,
  onAcceptChange,
}: ForexCardDeclarationProps) => {
  const [showDetails, setShowDetails] = useState(false);

  const checkboxText = mode === "new"
    ? "I confirm that this forex card application complies with RBI and FEMA guidelines."
    : "I confirm that this forex card top-up complies with RBI and FEMA guidelines.";

  const detailedDeclarations = mode === "new" ? [
    "I confirm that I am an Indian resident and eligible for a forex card under LRS.",
    "Funds used for loading are from legitimate sources.",
    "The card will not be used for prohibited purposes under FEMA.",
    "All information provided is true and accurate.",
    "I authorize RBP FINIVIS to verify my documents with relevant authorities.",
  ] : [
    "I confirm that I am the rightful holder of this forex card.",
    "This top-up is within my LRS limit for the current financial year.",
    "Funds used are from legitimate and lawfully earned sources.",
    "All information provided is true and accurate.",
  ];

  return (
    <div className="space-y-4">
      {/* Compliance Header */}
      <div className="flex items-center gap-2 text-primary">
        <Shield className="h-5 w-5" />
        <span className="font-semibold">Compliance Declaration</span>
      </div>

      {/* Single Mandatory Checkbox */}
      <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30">
        <Checkbox
          id="forex-card-declaration"
          checked={accepted}
          onCheckedChange={(checked) => onAcceptChange(checked === true)}
          className="mt-0.5"
        />
        <Label
          htmlFor="forex-card-declaration"
          className="text-sm leading-relaxed cursor-pointer"
        >
          {checkboxText} <span className="text-destructive">*</span>
        </Label>
      </div>

      {/* Expandable Detailed Declaration */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setShowDetails(!showDetails)}
        className="text-muted-foreground hover:text-foreground"
      >
        {showDetails ? (
          <>
            <ChevronUp className="h-4 w-4 mr-1" />
            Hide detailed declaration
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4 mr-1" />
            View detailed declaration
          </>
        )}
      </Button>

      {showDetails && (
        <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-2 text-muted-foreground">
          <p className="font-medium text-foreground mb-3">Detailed Declaration:</p>
          <ul className="space-y-2">
            {detailedDeclarations.map((declaration, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>{declaration}</span>
              </li>
            ))}
          </ul>
          
          <div className="mt-4 pt-3 border-t border-border">
            <p className="text-xs">
              Forex cards are issued as per RBI guidelines and partner bank policies. 
              LRS limits are tracked per financial year.
            </p>
          </div>
        </div>
      )}

      {/* Informational Disclaimer */}
      <p className="text-xs text-muted-foreground">
        By proceeding, you authorize RBP FINIVIS to process your {mode === "new" ? "application" : "top-up request"} in accordance with applicable regulations.
      </p>
    </div>
  );
};
