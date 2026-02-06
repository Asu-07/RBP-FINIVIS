import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calculator, 
  Info,
  CheckCircle,
  IndianRupee,
} from "lucide-react";
import { type TDSCalculationResult } from "@/hooks/useTDSCalculation";

interface TDSDisplayProps {
  tdsResult: TDSCalculationResult | null;
  onAcknowledge: (acknowledged: boolean) => void;
  acknowledged: boolean;
  exchangeType: "buy" | "sell";
}

/**
 * TDS Display Component
 * 
 * Shows TDS calculation as per Section 206C(1G) of Income Tax Act.
 * 
 * Disclaimer: "TDS is collected as mandated by the Income Tax Department and is not a fee charged by RBP FINIVIS."
 */
export const TDSDisplay = ({
  tdsResult,
  onAcknowledge,
  acknowledged,
  exchangeType,
}: TDSDisplayProps) => {
  if (!tdsResult) return null;

  // No TDS display for sell forex
  if (exchangeType === "sell") {
    return (
      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
        <Info className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          TDS is not applicable on sale of foreign currency.
        </p>
      </div>
    );
  }

  // No TDS if below threshold
  if (!tdsResult.tdsApplicable) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-green-700 dark:text-green-400">No TDS Applicable</p>
            <p className="text-green-600 dark:text-green-500">
              Your FY remittances are within ₹7,00,000 threshold.
            </p>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
          <div className="flex justify-between">
            <span>FY Threshold Used:</span>
            <span className="font-medium">₹{tdsResult.thresholdUsed.toLocaleString()} / ₹7,00,000</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Remaining Before TDS:</span>
            <span className="font-medium text-green-600">₹{tdsResult.remainingThreshold.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }

  // TDS is applicable
  return (
    <Card className="border-amber-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-5 w-5 text-amber-600" />
            TDS Calculation
          </CardTitle>
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400">
            Government TDS
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* TDS Amount Display */}
        <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">TDS Rate ({tdsResult.tdsRateName}):</span>
            <span className="font-semibold">{tdsResult.tdsRate}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">TDS Amount:</span>
            <span className="text-xl font-bold text-amber-700 dark:text-amber-400 flex items-center">
              <IndianRupee className="h-5 w-5" />
              {tdsResult.tdsAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Threshold Info */}
        <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg space-y-1">
          <div className="flex justify-between">
            <span>Annual Threshold:</span>
            <span className="font-medium">₹7,00,000</span>
          </div>
          <div className="flex justify-between">
            <span>Your FY Remittances:</span>
            <span className="font-medium">₹{tdsResult.totalFYUsage.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-amber-600">
            <span>Amount Above Threshold:</span>
            <span className="font-medium">TDS Applicable</span>
          </div>
        </div>

        {/* Acknowledgment Checkbox */}
        <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border">
          <Checkbox
            id="tds-acknowledge"
            checked={acknowledged}
            onCheckedChange={(checked) => onAcknowledge(checked === true)}
            className="mt-0.5"
          />
          <Label htmlFor="tds-acknowledge" className="text-sm leading-relaxed cursor-pointer">
            I understand that TDS of ₹{tdsResult.tdsAmount.toLocaleString()} is a government requirement and 
            can be claimed while filing my income tax return. TDS is not a fee charged by RBP FINIVIS.
          </Label>
        </div>

        {/* Regulatory Note */}
        <Alert className="bg-muted/50 border-muted">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            TDS is collected as per Section 206C(1G) of the Income Tax Act. This amount will be deposited 
            with the Government and you will receive Form 26AS for claiming credit while filing your ITR.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
