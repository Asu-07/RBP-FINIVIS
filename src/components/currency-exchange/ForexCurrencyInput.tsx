import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForexRates } from "@/hooks/useForexRates";
import { currencySymbols } from "@/config/bankDetails";
import { 
  ArrowLeft, 
  ArrowRight, 
  ArrowDown,
  Clock, 
  RefreshCw,
  TrendingUp,
  Shield,
  AlertTriangle,
  Info,
} from "lucide-react";
import type { ExchangeOrderData } from "@/pages/CurrencyExchange";

const foreignCurrencies = [
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
  { code: "NZD", name: "New Zealand Dollar", flag: "🇳🇿" },
  { code: "HKD", name: "Hong Kong Dollar", flag: "🇭🇰" },
  { code: "SEK", name: "Swedish Krona", flag: "🇸🇪" },
];

interface ForexCurrencyInputProps {
  orderData: ExchangeOrderData;
  onUpdateData: (data: Partial<ExchangeOrderData>) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const ForexCurrencyInput = ({ 
  orderData, 
  onUpdateData, 
  onBack, 
  onContinue 
}: ForexCurrencyInputProps) => {
  const { rates, isLoading, refetch } = useForexRates();
  const isBuy = orderData.exchangeType === "buy";
  
  const [foreignCurrency, setForeignCurrency] = useState(orderData.toCurrency || "USD");
  const [amount, setAmount] = useState(orderData.amount > 0 ? orderData.amount.toString() : "");
  const [inputMode, setInputMode] = useState<"foreign" | "inr">("foreign");
  const [rateExpiry, setRateExpiry] = useState(300);

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

  // Get exchange rate
  const getRate = () => {
    const rate = rates.find(r => r.currency === foreignCurrency);
    if (!rate) return { buy: 83, sell: 83.5 };
    return { buy: rate.buyRate, sell: rate.sellRate };
  };

  const exchangeRates = getRate();
  // For Buy: Customer pays INR at sell rate (bank sells FX)
  // For Sell: Customer gets INR at buy rate (bank buys FX)
  const applicableRate = isBuy ? exchangeRates.sell : exchangeRates.buy;
  
  const numAmount = parseFloat(amount) || 0;
  
  // Calculate amounts based on input mode
  let foreignAmount: number;
  let inrAmount: number;
  
  if (inputMode === "foreign") {
    foreignAmount = numAmount;
    inrAmount = numAmount * applicableRate;
  } else {
    inrAmount = numAmount;
    foreignAmount = numAmount / applicableRate;
  }
  
  // Calculate fees and totals
  const spreadPercentage = ((exchangeRates.sell - exchangeRates.buy) / exchangeRates.buy * 100).toFixed(2);
  const serviceFee = Math.max(inrAmount * 0.002, 50); // 0.2% or min ₹50
  
  // For Buy: total INR to pay = inrAmount + fee
  // For Sell: total INR to receive = inrAmount - fee
  const totalInr = isBuy ? inrAmount + serviceFee : inrAmount - serviceFee;
  
  const rateLockAmount = isBuy ? totalInr * 0.1 : 0; // 10% rate lock for buy
  const balanceAmount = isBuy ? totalInr * 0.9 : totalInr;
  
  // USD equivalent for limit checking
  const usdEquivalent = foreignCurrency === "USD" 
    ? foreignAmount 
    : foreignAmount * (rates.find(r => r.currency === foreignCurrency)?.buyRate || 1) / (rates.find(r => r.currency === "USD")?.buyRate || 83);
  
  const exceedsCashLimit = usdEquivalent > 3000;
  const exceedsLrsLimit = usdEquivalent > 250000;
  
  const minAmount = 50; // Min 50 in foreign currency
  const canContinue = foreignAmount >= minAmount && !exceedsLrsLimit;

  const handleContinue = () => {
    onUpdateData({
      fromCurrency: isBuy ? "INR" : foreignCurrency,
      toCurrency: isBuy ? foreignCurrency : "INR",
      amount: isBuy ? inrAmount : foreignAmount,
      convertedAmount: isBuy ? foreignAmount : inrAmount,
      exchangeRate: applicableRate,
      serviceFee,
      totalAmount: totalInr,
      rateLockAmount,
      balanceAmount,
      usdEquivalent,
      exceedsCashLimit,
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
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
              isBuy ? "bg-green-500/10" : "bg-blue-500/10"
            }`}>
              <TrendingUp className={`h-5 w-5 ${isBuy ? "text-green-600" : "text-blue-600"}`} />
            </div>
            <div>
              <CardTitle>{isBuy ? "Buy Forex" : "Sell Forex"}</CardTitle>
              <CardDescription>
                {isBuy ? "INR → Foreign Currency" : "Foreign Currency → INR"}
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
        {/* Currency Selection */}
        <div className="space-y-2">
          <Label>Select Currency</Label>
          <Select value={foreignCurrency} onValueChange={setForeignCurrency}>
            <SelectTrigger className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {foreignCurrencies.map(c => (
                <SelectItem key={c.code} value={c.code}>
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{c.flag}</span>
                    <span className="font-medium">{c.code}</span>
                    <span className="text-muted-foreground">- {c.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Amount Input */}
        <div className="space-y-4">
          {/* Toggle Input Mode */}
          <div className="flex gap-2">
            <Button
              variant={inputMode === "foreign" ? "default" : "outline"}
              size="sm"
              onClick={() => { setInputMode("foreign"); setAmount(""); }}
            >
              Enter in {foreignCurrency}
            </Button>
            <Button
              variant={inputMode === "inr" ? "default" : "outline"}
              size="sm"
              onClick={() => { setInputMode("inr"); setAmount(""); }}
            >
              Enter in INR
            </Button>
          </div>

          {/* Input Field */}
          <div className="space-y-2">
            <Label>
              {isBuy 
                ? (inputMode === "foreign" ? `${foreignCurrency} Amount You Need` : "INR Amount You'll Pay")
                : (inputMode === "foreign" ? `${foreignCurrency} Amount to Sell` : "INR Amount You'll Get")}
            </Label>
            <div className="flex gap-3">
              <div className="flex items-center gap-2 px-4 bg-muted rounded-lg shrink-0">
                {inputMode === "foreign" ? (
                  <>
                    <span className="text-lg">{foreignCurrencies.find(c => c.code === foreignCurrency)?.flag}</span>
                    <span className="font-medium">{foreignCurrency}</span>
                  </>
                ) : (
                  <>
                    <span className="text-lg">🇮🇳</span>
                    <span className="font-medium">INR</span>
                  </>
                )}
              </div>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 text-xl font-semibold h-14"
              />
            </div>
          </div>

          {/* Conversion Arrow */}
          <div className="flex justify-center py-2">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <ArrowDown className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          {/* Output Field */}
          <div className="space-y-2">
            <Label>
              {isBuy 
                ? (inputMode === "foreign" ? "INR You'll Pay" : `${foreignCurrency} You'll Get`)
                : (inputMode === "foreign" ? "INR You'll Receive" : `${foreignCurrency} to Sell`)}
            </Label>
            <div className="flex gap-3">
              <div className="flex items-center gap-2 px-4 bg-muted rounded-lg shrink-0">
                {inputMode === "foreign" ? (
                  <>
                    <span className="text-lg">🇮🇳</span>
                    <span className="font-medium">INR</span>
                  </>
                ) : (
                  <>
                    <span className="text-lg">{foreignCurrencies.find(c => c.code === foreignCurrency)?.flag}</span>
                    <span className="font-medium">{foreignCurrency}</span>
                  </>
                )}
              </div>
              <Input
                type="text"
                value={numAmount > 0 
                  ? (inputMode === "foreign" ? inrAmount.toFixed(2) : foreignAmount.toFixed(2))
                  : ""}
                readOnly
                className="flex-1 text-xl font-semibold h-14 bg-muted"
                placeholder="Calculated amount"
              />
            </div>
          </div>
        </div>

        {/* Rate & Breakdown */}
        <div className="bg-muted/50 p-4 rounded-xl space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Exchange Rate ({isBuy ? "Sell" : "Buy"})
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-medium">
                1 {foreignCurrency} = ₹{applicableRate.toFixed(2)}
              </span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => refetch()} disabled={isLoading}>
                <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Spread</span>
            <span className="font-mono">{spreadPercentage}%</span>
          </div>

          {numAmount > 0 && (
            <>
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{foreignCurrency} Amount</span>
                  <span className="font-mono">{currencySymbols[foreignCurrency] || ''}{foreignAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">INR Amount</span>
                  <span className="font-mono">₹{inrAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Service Fee (0.2%)</span>
                  <span className="font-mono">{isBuy ? "+" : "-"}₹{serviceFee.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t font-medium">
                <span>{isBuy ? "Total INR to Pay" : "Total INR to Receive"}</span>
                <span className={`text-lg ${isBuy ? "text-destructive" : "text-green-600"}`}>
                  ₹{totalInr.toFixed(2)}
                </span>
              </div>

              {isBuy && (
                <div className="flex justify-between items-center p-2 bg-primary/10 rounded-lg text-sm">
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Rate Lock Amount (10%)
                  </span>
                  <span className="font-medium text-primary">₹{rateLockAmount.toFixed(2)}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Limit Warnings */}
        {exceedsCashLimit && !exceedsLrsLimit && (
          <div className="p-3 bg-warning/10 rounded-lg border border-warning/20 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              <strong>Cash Limit:</strong> Amount exceeds USD 3,000 equivalent. Forex will be 
              provided via Forex Card. Valid travel documents required.
            </p>
          </div>
        )}

        {exceedsLrsLimit && (
          <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs text-destructive">
              <strong>LRS Limit Exceeded:</strong> Amount exceeds the annual LRS limit of USD 2,50,000. 
              Please reduce the amount to proceed.
            </p>
          </div>
        )}

        {/* RBI Notice */}
        <div className="flex items-start gap-2 p-3 bg-accent/5 rounded-lg">
          <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Exchange rates are indicative and will be locked upon payment confirmation. 
            All transactions are processed as per RBI FEMA guidelines.
          </p>
        </div>

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
