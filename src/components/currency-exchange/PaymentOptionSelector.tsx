import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Lock, 
  Percent, 
  CheckCircle,
  Info,
  Star,
  IndianRupee,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type PaymentOption = "advance_10" | "full_100";

interface PaymentOptionSelectorProps {
  totalAmount: number;
  exchangeRate: number;
  currency: string;
  selectedOption: PaymentOption | null;
  onOptionSelect: (option: PaymentOption) => void;
}

export const PaymentOptionSelector = ({
  totalAmount,
  exchangeRate,
  currency,
  selectedOption,
  onOptionSelect,
}: PaymentOptionSelectorProps) => {
  const advanceAmount = Math.round(totalAmount * 0.1 * 100) / 100;
  const balanceAmount = totalAmount - advanceAmount;

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <IndianRupee className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Select Payment Option</CardTitle>
            <CardDescription>
              Choose how you'd like to pay for your order
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Amount Display */}
        <div className="bg-muted/50 rounded-lg p-4 border">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Order Value:</span>
            <span className="text-xl font-bold">
              ₹{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Rate: ₹{exchangeRate.toFixed(2)} / {currency}
          </p>
        </div>

        {/* Payment Options */}
        <RadioGroup 
          value={selectedOption || ""} 
          onValueChange={(value) => onOptionSelect(value as PaymentOption)}
          className="space-y-4"
        >
          {/* 10% Advance Option - USP */}
          <div 
            className={`relative rounded-xl border-2 transition-all cursor-pointer ${
              selectedOption === "advance_10"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
            onClick={() => onOptionSelect("advance_10")}
          >
            {/* USP Badge */}
            <Badge className="absolute -top-2 left-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              <Star className="h-3 w-3 mr-1" />
              Recommended
            </Badge>
            
            <div className="p-4 pt-6">
              <div className="flex items-start gap-4">
                <RadioGroupItem value="advance_10" id="advance_10" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="advance_10" className="text-base font-semibold cursor-pointer flex items-center gap-2">
                    <Percent className="h-5 w-5 text-primary" />
                    10% Advance Payment
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Lock today's rate with just 10% advance. Pay balance on delivery.
                  </p>
                  
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-background/50 rounded-lg p-3">
                      <p className="text-muted-foreground">Pay Now</p>
                      <p className="text-lg font-bold text-primary">
                        ₹{advanceAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="bg-background/50 rounded-lg p-3">
                      <p className="text-muted-foreground">Pay on Delivery</p>
                      <p className="text-lg font-bold">
                        ₹{balanceAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-start gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <Lock className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-green-700 dark:text-green-400">
                      <strong>Rate Lock Benefit:</strong> Your exchange rate is locked for 24 hours once payment is confirmed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full Payment Option */}
          <div 
            className={`relative rounded-xl border-2 transition-all cursor-pointer ${
              selectedOption === "full_100"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
            onClick={() => onOptionSelect("full_100")}
          >
            <div className="p-4">
              <div className="flex items-start gap-4">
                <RadioGroupItem value="full_100" id="full_100" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="full_100" className="text-base font-semibold cursor-pointer flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    100% Full Payment
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pay the entire amount upfront and complete your order instantly.
                  </p>
                  
                  <div className="mt-3 bg-background/50 rounded-lg p-3 inline-block">
                    <p className="text-muted-foreground text-sm">Total Amount</p>
                    <p className="text-lg font-bold text-primary">
                      ₹{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </RadioGroup>

        {/* Info Note */}
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
          <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Both options include full compliance verification. Advance payment is refundable if order is cancelled or rejected.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
