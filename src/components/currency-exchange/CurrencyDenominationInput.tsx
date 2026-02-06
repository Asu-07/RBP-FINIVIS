import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Banknote } from "lucide-react";

export interface DenominationEntry {
  denomination: number;
  quantity: number;
  subtotal: number;
}

export interface DenominationBreakdown {
  currency: string;
  entries: DenominationEntry[];
  totalAmount: number;
}

interface CurrencyDenominationInputProps {
  currency: string;
  expectedTotal: number;
  onChange: (breakdown: DenominationBreakdown) => void;
  value?: DenominationBreakdown;
}

// Currency denomination configurations
const CURRENCY_DENOMINATIONS: Record<string, number[]> = {
  USD: [1, 5, 10, 20, 50, 100],
  EUR: [5, 10, 20, 50, 100, 200, 500],
  GBP: [5, 10, 20, 50],
  AED: [5, 10, 20, 50, 100, 200, 500, 1000],
  SGD: [2, 5, 10, 50, 100, 1000],
  AUD: [5, 10, 20, 50, 100],
  CAD: [5, 10, 20, 50, 100],
  JPY: [1000, 2000, 5000, 10000],
  CHF: [10, 20, 50, 100, 200, 1000],
  THB: [20, 50, 100, 500, 1000],
  MYR: [1, 5, 10, 20, 50, 100],
  SAR: [1, 5, 10, 50, 100, 500],
  QAR: [1, 5, 10, 50, 100, 500],
  KWD: [0.25, 0.5, 1, 5, 10, 20],
  OMR: [0.1, 0.5, 1, 5, 10, 20, 50],
  BHD: [0.5, 1, 5, 10, 20],
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "د.إ",
  SGD: "S$",
  AUD: "A$",
  CAD: "C$",
  JPY: "¥",
  CHF: "CHF",
  THB: "฿",
  MYR: "RM",
  SAR: "﷼",
  QAR: "﷼",
  KWD: "KD",
  OMR: "OMR",
  BHD: "BD",
};

export const CurrencyDenominationInput = ({
  currency,
  expectedTotal,
  onChange,
  value,
}: CurrencyDenominationInputProps) => {
  const denominations = CURRENCY_DENOMINATIONS[currency] || [1, 5, 10, 20, 50, 100];
  const symbol = CURRENCY_SYMBOLS[currency] || currency;

  const [quantities, setQuantities] = useState<Record<number, number>>(() => {
    if (value?.entries) {
      const q: Record<number, number> = {};
      value.entries.forEach(e => {
        q[e.denomination] = e.quantity;
      });
      return q;
    }
    return {};
  });

  const calculateTotal = () => {
    return denominations.reduce((sum, denom) => {
      const qty = quantities[denom] || 0;
      return sum + (denom * qty);
    }, 0);
  };

  const totalAmount = calculateTotal();
  const difference = totalAmount - expectedTotal;
  const isMatching = Math.abs(difference) < 0.01;

  useEffect(() => {
    const entries: DenominationEntry[] = denominations
      .filter(denom => (quantities[denom] || 0) > 0)
      .map(denom => ({
        denomination: denom,
        quantity: quantities[denom] || 0,
        subtotal: denom * (quantities[denom] || 0),
      }));

    onChange({
      currency,
      entries,
      totalAmount,
    });
  }, [quantities, currency, totalAmount]);

  const handleQuantityChange = (denomination: number, value: string) => {
    const qty = parseInt(value) || 0;
    setQuantities(prev => ({
      ...prev,
      [denomination]: Math.max(0, qty),
    }));
  };

  return (
    <Card className="border-2 border-dashed border-primary/30">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-primary" />
            <Label className="font-semibold">Currency Note Breakdown</Label>
            <Badge variant="outline" className="text-xs">Mandatory for Sell Forex</Badge>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Enter the number of notes for each denomination you wish to sell
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {denominations.map((denom) => {
            const qty = quantities[denom] || 0;
            const subtotal = denom * qty;
            
            return (
              <div key={denom} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <span className="font-mono font-medium text-sm min-w-[60px]">
                  {symbol}{denom.toLocaleString()}
                </span>
                <span className="text-muted-foreground">×</span>
                <Input
                  type="number"
                  min="0"
                  value={qty || ""}
                  onChange={(e) => handleQuantityChange(denom, e.target.value)}
                  className="h-9 w-20 text-center font-mono"
                  placeholder="0"
                />
                {qty > 0 && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    = {symbol}{subtotal.toLocaleString()}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Total Display */}
        <div className={`p-4 rounded-lg border-2 ${
          isMatching 
            ? "border-green-500 bg-green-50 dark:bg-green-950/20" 
            : totalAmount > 0 
              ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20"
              : "border-muted"
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-medium">Total from Notes:</span>
            <span className="text-xl font-bold font-mono">
              {symbol}{totalAmount.toLocaleString()}
            </span>
          </div>
          
          {expectedTotal > 0 && (
            <>
              <div className="flex items-center justify-between mt-2 text-sm">
                <span className="text-muted-foreground">Expected Amount:</span>
                <span className="font-mono">{symbol}{expectedTotal.toLocaleString()}</span>
              </div>
              
              {totalAmount > 0 && !isMatching && (
                <div className="flex items-start gap-2 mt-3 p-2 bg-amber-100 dark:bg-amber-900/30 rounded text-sm">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-700 dark:text-amber-400">
                      Amount Mismatch
                    </p>
                    <p className="text-amber-600 dark:text-amber-500">
                      Difference: {symbol}{Math.abs(difference).toLocaleString()} 
                      {difference > 0 ? " (excess)" : " (short)"}
                    </p>
                    <p className="text-xs mt-1">
                      Please adjust note quantities to match the expected amount.
                    </p>
                  </div>
                </div>
              )}
              
              {isMatching && totalAmount > 0 && (
                <div className="flex items-center gap-2 mt-3 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Amount matches! You can proceed.</span>
                </div>
              )}
            </>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Note: All notes must be in good condition and genuine. Damaged or suspected counterfeit notes will be rejected.
        </p>
      </CardContent>
    </Card>
  );
};
