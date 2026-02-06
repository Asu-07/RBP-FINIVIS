import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useForexRates } from "@/hooks/useForexRates";
import { currencySymbols } from "@/config/bankDetails";
import { 
  ArrowRightLeft, 
  ArrowRight, 
  ArrowLeft, 
  Clock, 
  RefreshCw,
  Lock,
  TrendingUp,
} from "lucide-react";
import type { ExchangeOrderData } from "@/pages/CurrencyExchange";

const currencyData = [
  { code: "INR", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "USD", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧" },
  { code: "AED", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "SGD", name: "Singapore Dollar", flag: "🇸🇬" },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "SAR", name: "Saudi Riyal", flag: "🇸🇦" },
  { code: "THB", name: "Thai Baht", flag: "🇹🇭" },
];

interface CurrencySelectionProps {
  orderData: ExchangeOrderData;
  onUpdateData: (data: Partial<ExchangeOrderData>) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const CurrencySelection = ({ 
  orderData, 
  onUpdateData, 
  onBack, 
  onContinue 
}: CurrencySelectionProps) => {
  const { rates, isLoading, refetch } = useForexRates();
  const [amount, setAmount] = useState(orderData.amount > 0 ? orderData.amount.toString() : "");
  const [fromCurrency, setFromCurrency] = useState(orderData.fromCurrency || "INR");
  const [toCurrency, setToCurrency] = useState(orderData.toCurrency || "USD");
  const [rateExpiry, setRateExpiry] = useState(300); // 5 minutes in seconds

  // Rate expiry countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setRateExpiry(prev => {
        if (prev <= 0) {
          refetch();
          return 300;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [refetch]);

  const getExchangeRate = (from: string, to: string) => {
    if (from === to) return 1;
    const fromRate = from === "INR" ? 1 : rates.find(r => r.currency === from)?.sellRate || 1;
    const toRate = to === "INR" ? 1 : rates.find(r => r.currency === to)?.buyRate || 1;
    return fromRate / toRate;
  };

  const exchangeRate = getExchangeRate(fromCurrency, toCurrency);
  const numAmount = parseFloat(amount) || 0;
  const convertedAmount = numAmount * exchangeRate;
  const serviceFee = Math.max(numAmount * 0.002, 50); // 0.2% or min ₹50
  const totalAmount = numAmount + serviceFee;
  const rateLockAmount = totalAmount * 0.1; // 10% rate lock
  const balanceAmount = totalAmount * 0.9; // 90% balance

  const canContinue = numAmount >= 1000 && fromCurrency !== toCurrency;

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setAmount("");
  };

  const handleContinue = () => {
    onUpdateData({
      fromCurrency,
      toCurrency,
      amount: numAmount,
      convertedAmount,
      exchangeRate,
      serviceFee,
      totalAmount,
      rateLockAmount,
      balanceAmount,
    });
    onContinue();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ArrowRightLeft className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Select Currency & Amount</CardTitle>
              <CardDescription>
                Choose currency and enter amount to exchange
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Rate expires in {formatTime(rateExpiry)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* From Currency */}
        <div className="space-y-2">
          <Label>You Pay</Label>
          <div className="flex gap-4">
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {currencyData.map(c => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="flex items-center gap-2">
                      <span>{c.flag}</span>
                      <span>{c.code}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 text-lg"
              min="1000"
            />
          </div>
          {numAmount > 0 && numAmount < 1000 && (
            <p className="text-xs text-destructive">Minimum amount is {currencySymbols[fromCurrency]}1,000</p>
          )}
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSwapCurrencies}
            className="rounded-full h-12 w-12"
          >
            <ArrowRightLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* To Currency */}
        <div className="space-y-2">
          <Label>You Get</Label>
          <div className="flex gap-4">
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {currencyData.filter(c => c.code !== fromCurrency).map(c => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="flex items-center gap-2">
                      <span>{c.flag}</span>
                      <span>{c.code}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="text"
              value={numAmount > 0 ? convertedAmount.toFixed(2) : ""}
              readOnly
              className="flex-1 text-lg bg-muted"
              placeholder="Converted amount"
            />
          </div>
        </div>

        {/* Rate Info */}
        {fromCurrency !== toCurrency && (
          <div className="bg-muted p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Exchange Rate
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium">
                  1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                </span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => refetch()} disabled={isLoading}>
                  <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
            
            {numAmount > 0 && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Service Fee (0.2%)</span>
                  <span className="font-mono text-sm">
                    {currencySymbols[fromCurrency]}{serviceFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-medium">Total Amount</span>
                  <span className="font-medium text-primary">
                    {currencySymbols[fromCurrency]}{totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-primary/10 p-2 rounded">
                  <span className="text-sm flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Rate Lock Amount (10%)
                  </span>
                  <span className="font-medium text-primary">
                    {currencySymbols[fromCurrency]}{rateLockAmount.toFixed(2)}
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            className="flex-1"
            disabled={!canContinue}
            onClick={handleContinue}
          >
            Lock Rate & Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
