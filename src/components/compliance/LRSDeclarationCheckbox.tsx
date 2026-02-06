import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";
import { AssistedLRSHandling } from "./AssistedLRSHandling";

export type LRSDeclarationChoice = "within_limit" | "exceeds_limit" | null;

interface LRSDeclarationCheckboxProps {
  onSelect: (choice: LRSDeclarationChoice) => void;
  selected: LRSDeclarationChoice;
  usdAmount?: number;
  disabled?: boolean;
  serviceType?: string;
  referenceId?: string;
  purpose?: string;
}

/**
 * LRS Declaration Two-Option System
 * 
 * Two mutually exclusive options:
 * - Yes: Within USD 250,000 limit → Allow payment
 * - No: Exceeds limit → Route to assisted handling (WhatsApp/Callback)
 * 
 * Disclaimer: "LRS limits are defined by the Reserve Bank of India and tracked per financial year."
 */
export const LRSDeclarationCheckbox = ({
  onSelect,
  selected,
  usdAmount = 0,
  disabled = false,
  serviceType = "Currency Exchange",
  referenceId,
  purpose,
}: LRSDeclarationCheckboxProps) => {
  const handleSelect = (choice: LRSDeclarationChoice) => {
    if (disabled) return;
    onSelect(choice === selected ? null : choice);
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            LRS Declaration
          </CardTitle>
          <Badge variant="destructive" className="text-xs">Mandatory</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Transaction Amount Display */}
        {usdAmount > 0 && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">This Transaction:</span>
              <span className="font-semibold">USD {usdAmount.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Two Mutually Exclusive Options */}
        <div className="space-y-3">
          {/* Option 1: Within Limit */}
          <button
            onClick={() => handleSelect("within_limit")}
            disabled={disabled}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              selected === "within_limit"
                ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                : "border-border hover:border-primary/50"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-start gap-3">
              <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                selected === "within_limit" 
                  ? "border-green-500 bg-green-500" 
                  : "border-muted-foreground/50"
              }`}>
                {selected === "within_limit" && (
                  <CheckCircle className="h-4 w-4 text-white" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">
                  Yes, my total foreign exchange transactions are within USD 2,50,000 in this financial year
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  I confirm that this transaction, combined with my previous remittances, does not exceed the LRS limit.
                </p>
              </div>
            </div>
          </button>

          {/* Option 2: Exceeds Limit */}
          <button
            onClick={() => handleSelect("exceeds_limit")}
            disabled={disabled}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              selected === "exceeds_limit"
                ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20"
                : "border-border hover:border-primary/50"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-start gap-3">
              <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                selected === "exceeds_limit" 
                  ? "border-amber-500 bg-amber-500" 
                  : "border-muted-foreground/50"
              }`}>
                {selected === "exceeds_limit" && (
                  <XCircle className="h-4 w-4 text-white" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">
                  No, my total foreign exchange transactions exceed USD 2,50,000 in this financial year
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  I need assisted processing for this transaction.
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Assisted Handling Flow - Shown when exceeds limit */}
        {selected === "exceeds_limit" && (
          <AssistedLRSHandling
            serviceType={serviceType}
            referenceId={referenceId}
            amount={usdAmount}
            currency="USD"
            purpose={purpose}
          />
        )}

        {/* Within Limit Confirmation */}
        {selected === "within_limit" && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
            <p className="text-sm text-green-700 dark:text-green-400">
              LRS declaration confirmed. You may proceed with payment.
            </p>
          </div>
        )}

        {/* Regulatory Disclaimer */}
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
          <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            LRS limits are defined by the Reserve Bank of India and tracked per financial year (April to March).
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
