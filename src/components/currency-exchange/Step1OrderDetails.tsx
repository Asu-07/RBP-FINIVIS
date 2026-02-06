import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  TrendingUp,
  Clock,
  Info,
  ShoppingCart,
  Wallet,
  AlertTriangle,
} from "lucide-react";
import type { ExchangeOrderData } from "@/pages/CurrencyExchange";
import { useForexRates } from "@/hooks/useForexRates";
import { CitySelectionWithValidation } from "./CitySelectionWithValidation";
import { CurrencyDenominationInput, type DenominationBreakdown } from "./CurrencyDenominationInput";
import { DeliveryModeSelection, type DeliveryMode } from "./DeliveryModeSelection";
import { validateCityDistance, type ValidationResult } from "@/utils/cityDistanceValidation";
import { calculateExchangeRate, calculateExchangeRateWithBreakdown } from "@/utils/pricing";

const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", flag: "🇦🇪" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", flag: "🇨🇭" },
  { code: "THB", name: "Thai Baht", symbol: "฿", flag: "🇹🇭" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", flag: "🇲🇾" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼", flag: "🇸🇦" },
];

interface Step1OrderDetailsProps {
  orderData: ExchangeOrderData;
  onUpdateData: (data: Partial<ExchangeOrderData>) => void;
  onContinue: () => void;
}

export const Step1OrderDetails = ({
  orderData,
  onUpdateData,
  onContinue,
}: Step1OrderDetailsProps) => {
  const { rates } = useForexRates();
  const [exchangeType, setExchangeType] = useState<"buy" | "sell">(orderData.exchangeType || "buy");
  const [currency, setCurrency] = useState(orderData.exchangeType === "sell" ? orderData.fromCurrency : orderData.toCurrency || "USD");
  const [amount, setAmount] = useState(orderData.amount?.toString() || "");
  const [city, setCity] = useState(orderData.city || "");
  const [cityValidation, setCityValidation] = useState<ValidationResult | null>(null);
  const [denominationBreakdown, setDenominationBreakdown] = useState<DenominationBreakdown | undefined>(orderData.denominationBreakdown);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>(orderData.deliveryPreference || "home_delivery");

  const selectedCurrency = currencies.find(c => c.code === currency);


  const getRate = () => {
    const rate = rates.find(r => r.currency === currency);
    // Base IBR (simulated from sellRate or buyRate)
    // Buy Forex: Customer buys FCY. Rate = INR/FCY. We use IBR + Markup.
    // Sell Forex: Customer sells FCY. Rate = INR/FCY. We use IBR - Markup (or just IBR for now? 
    // The user image implies "Forex Rate" + Slab. Usually "Rate" is the selling rate to customer.
    // For Buying from customer (Sell Forex), banks usually deduct margin.
    // Let's assume the slab table is for 'Sale of Forex' (Education TT, Currency Card, Note).
    // For 'Purchase of Forex' (customer sells to us), we might need inverse or different logic.
    // Given the context of "Product: Education TT, Gift TT", these are OUTWARD remittances (Sale).
    // "Currency Note" is likely Sale of notes to customer.
    // For now, I will apply this logic to "Buy Forex" (Customer Buys).
    // For "Sell Forex" (Customer Sells), I will keep existing logic or use IBR directly.

    if (!rate) return exchangeType === "buy" ? 84.5 : 83.5;

    if (exchangeType === "buy") {
      // Customer buying FCY. Rate = IBR + Markup.
      // Use sellRate as proxy for IBR if no raw IBR available, or assume sellRate IS the slab rate?
      // No, user wants me to IMPLEMENT the calculation. So I should start with a base.
      // Let's assume rate.sellRate from hook is the market IBR.
      return calculateExchangeRate("Currency Note", parseFloat(amount) || 0, rate.sellRate);
    } else {
      // Customer selling FCY.
      return rate.buyRate;
    }
  };

  const exchangeRate = getRate();
  const numAmount = parseFloat(amount) || 0;

  // Calculate based on exchange type
  const forexAmount = numAmount;
  const inrAmount = forexAmount * exchangeRate;

  // Service fee removed (Revenue is in the rate)
  const serviceFee = 0;
  const totalAmount = inrAmount; // No +/- fee, it's all in the rate now.

  // USD equivalent for LRS tracking
  const usdEquivalent = currency === "USD"
    ? forexAmount
    : forexAmount * (rates.find(r => r.currency === "USD")?.buyRate || 84) / exchangeRate;

  // Validate denomination for Sell Forex
  const denominationValid = exchangeType === "sell"
    ? denominationBreakdown && Math.abs(denominationBreakdown.totalAmount - forexAmount) < 0.01
    : true;

  // Branch pickup is always valid, doorstep requires valid city
  const deliveryModeValid = deliveryMode === "branch_pickup" || cityValidation?.isValid === true;

  const canContinue = exchangeType &&
    currency &&
    numAmount > 0 &&
    city &&
    deliveryModeValid &&
    denominationValid;

  const handleCityChange = (newCity: string, validation: ValidationResult) => {
    setCity(newCity);
    setCityValidation(validation);
  };

  // Initialize city validation if city is pre-filled
  useEffect(() => {
    if (city && !cityValidation) {
      const validation = validateCityDistance(city);
      setCityValidation(validation);
    }
  }, []);

  const handleDenominationChange = (breakdown: DenominationBreakdown) => {
    setDenominationBreakdown(breakdown);
  };

  const handleDeliveryModeChange = (mode: DeliveryMode) => {
    setDeliveryMode(mode);
  };

  const handleContinue = () => {
    onUpdateData({
      exchangeType,
      city,
      fromCurrency: exchangeType === "buy" ? "INR" : currency,
      toCurrency: exchangeType === "buy" ? currency : "INR",
      amount: forexAmount,
      convertedAmount: inrAmount,
      exchangeRate,
      serviceFee,
      totalAmount,
      rateLockAmount: 0, // No advance payment - full payment only
      balanceAmount: totalAmount, // Full amount to be paid
      usdEquivalent,
      exceedsCashLimit: usdEquivalent > 3000,
      denominationBreakdown: exchangeType === "sell" ? denominationBreakdown : undefined,
      deliveryPreference: deliveryMode,
    });
    onContinue();
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <ShoppingCart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Step 1: Order Details</CardTitle>
            <CardDescription>
              Select transaction type, city, currency, and amount
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Delivery Radius Notice */}
        <Alert className="bg-primary/5 border-primary/20">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Currency exchange delivery is available only within a 150 km radius of Panchkula, Haryana.
          </AlertDescription>
        </Alert>

        {/* Exchange Type Selection */}
        <div className="space-y-3">
          <Label>I want to</Label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                setExchangeType("buy");
                setDenominationBreakdown(undefined);
              }}
              className={`p-4 rounded-xl border-2 transition-all text-left ${exchangeType === "buy"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
                }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${exchangeType === "buy" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <span className="font-semibold">Buy Forex</span>
              </div>
              <p className="text-xs text-muted-foreground">
                INR → Foreign Currency
              </p>
            </button>

            <button
              onClick={() => setExchangeType("sell")}
              className={`p-4 rounded-xl border-2 transition-all text-left ${exchangeType === "sell"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
                }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${exchangeType === "sell" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>
                  <Wallet className="h-5 w-5" />
                </div>
                <span className="font-semibold">Sell Forex</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Foreign Currency → INR
              </p>
            </button>
          </div>
        </div>

        {/* City Selection with Validation */}
        <CitySelectionWithValidation
          value={city}
          onChange={handleCityChange}
        />

        {/* Delivery Mode Selection */}
        {city && (
          <DeliveryModeSelection
            city={city}
            cityValidation={cityValidation}
            value={deliveryMode}
            onChange={handleDeliveryModeChange}
          />
        )}

        {/* Currency Selection */}
        <div className="space-y-2">
          <Label>Select Currency <span className="text-destructive">*</span></Label>
          <Select value={currency} onValueChange={(val) => {
            setCurrency(val);
            // Reset denomination when currency changes
            setDenominationBreakdown(undefined);
          }}>
            <SelectTrigger className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  <span className="flex items-center gap-2">
                    <span>{c.flag}</span>
                    <span>{c.code}</span>
                    <span className="text-muted-foreground">- {c.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <Label>
            Foreign Currency Amount <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
              {selectedCurrency?.symbol || "$"}
            </span>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-10 h-14 text-xl font-semibold"
              placeholder="0.00"
              min="0"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Enter the foreign currency amount you want to {exchangeType === "buy" ? "purchase" : "sell"}
          </p>
        </div>

        {/* Denomination Input for Sell Forex - PROMINENTLY DISPLAYED */}
        {exchangeType === "sell" && currency && (
          <div className="mt-6">
            <CurrencyDenominationInput
              currency={currency}
              expectedTotal={forexAmount}
              onChange={handleDenominationChange}
              value={denominationBreakdown}
            />

            {/* Sell Forex Disclaimer */}
            <Alert className="mt-4 bg-amber-500/10 border-amber-500/20">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-sm text-amber-700 dark:text-amber-400">
                Currency acceptance is subject to physical verification of notes. Final acceptance will be confirmed at pickup.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Exchange Rate Display */}
        {numAmount > 0 && (() => {
          const rate = rates.find(r => r.currency === currency);
          const baseRate = rate ? rate.sellRate : 84.5;
          const breakdown = calculateExchangeRateWithBreakdown("Currency Note", forexAmount, baseRate);
          const serviceChargeTotal = breakdown.serviceChargePerUnit * forexAmount;

          return (
            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
              {/* Base Currency Rate */}
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  Currency Rate
                </span>
                <span className="font-mono font-semibold">
                  1 {currency} = ₹{breakdown.baseRate.toFixed(2)}
                </span>
              </div>

              {/* Service Charges */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Service Charges ({breakdown.markupPercent.toFixed(2)}%)
                </span>
                <span className="font-mono">
                  ₹{serviceChargeTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="h-px bg-border" />

              {/* Total Amount */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="text-lg">{selectedCurrency?.flag}</span>
                  <span className="font-medium">
                    {exchangeType === "buy" ? "You Pay" : "You Receive"}
                  </span>
                </span>
                <span className="text-xl font-bold text-primary">
                  ₹{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          );
        })()}

        {/* LRS Warning */}
        {usdEquivalent > 3000 && (
          <div className="flex items-start gap-2 p-3 bg-warning/10 rounded-lg border border-warning/20">
            <Info className="h-4 w-4 text-warning shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-warning">Cash Limit Notice</p>
              <p className="text-muted-foreground">
                Orders exceeding USD 3,000 require additional documentation as per RBI guidelines.
              </p>
            </div>
          </div>
        )}

        {/* Rate Info - Updated to remove advance payment mention */}
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Exchange rates are indicative. Final rate will be locked after KYC verification.
          </p>
        </div>

        {/* Denomination Mismatch Warning */}
        {exchangeType === "sell" && numAmount > 0 && denominationBreakdown && !denominationValid && (
          <Alert className="bg-destructive/10 border-destructive/20">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              Denomination total ({denominationBreakdown.totalAmount.toLocaleString()} {currency}) does not match the entered amount ({forexAmount.toLocaleString()} {currency}). Please adjust the note quantities.
            </AlertDescription>
          </Alert>
        )}

        {/* Continue Button */}
        <Button
          className="w-full h-12"
          disabled={!canContinue}
          onClick={handleContinue}
        >
          Continue to Customer Details
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>

        {/* Validation Hints */}
        {!canContinue && (
          <div className="text-xs text-muted-foreground space-y-1">
            {!city && <p>• Please select a city</p>}
            {city && !deliveryModeValid && <p>• Please select a valid delivery option</p>}
            {!currency && <p>• Please select a currency</p>}
            {numAmount <= 0 && <p>• Please enter an amount</p>}
            {exchangeType === "sell" && !denominationValid && (
              <p>• Please enter denomination breakdown matching the amount</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
