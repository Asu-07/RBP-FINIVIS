import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Smartphone,
  Building,
  ArrowLeft,
  Lock,
  Shield,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { PlanData } from "./PlanSelectionStep";

interface PaymentStepProps {
  planData: PlanData;
  onNext: (paymentData: PaymentData) => void;
  onBack: () => void;
  isProcessing: boolean;
}

export interface PaymentData {
  paymentMethod: "upi" | "card" | "netbanking";
  transactionId?: string;
}

export const PaymentStep = ({ planData, onNext, onBack, isProcessing }: PaymentStepProps) => {
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [selectedBank, setSelectedBank] = useState("");

  const banks = [
    "State Bank of India",
    "HDFC Bank",
    "ICICI Bank",
    "Axis Bank",
    "Kotak Mahindra Bank",
    "Punjab National Bank",
    "Bank of Baroda",
    "Yes Bank",
  ];

  const handlePayment = () => {
    // Simulate payment processing
    const paymentData: PaymentData = {
      paymentMethod,
      transactionId: `TXN${Date.now()}`,
    };
    onNext(paymentData);
  };

  const isFormValid = () => {
    if (paymentMethod === "upi") {
      return upiId.includes("@");
    }
    if (paymentMethod === "card") {
      return cardNumber.length >= 16 && cardExpiry.length >= 5 && cardCvv.length >= 3 && cardName.length > 0;
    }
    if (paymentMethod === "netbanking") {
      return selectedBank.length > 0;
    }
    return false;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Payment Amount */}
      <Card className="shadow-card border-accent/30 bg-accent/5">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-muted-foreground">Amount to Pay</div>
              <div className="text-3xl font-heading font-bold text-accent">
                ₹{planData.premium.toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              Secure Payment
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent/10">
              <CreditCard className="h-6 w-6 text-accent" />
            </div>
            <div>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Choose your preferred payment method (INR only)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={paymentMethod}
            onValueChange={(value) => setPaymentMethod(value as "upi" | "card" | "netbanking")}
            className="space-y-4"
          >
            {/* UPI */}
            <div
              className={cn(
                "p-4 rounded-xl border-2 transition-all cursor-pointer",
                paymentMethod === "upi" ? "border-accent bg-accent/5" : "border-border"
              )}
              onClick={() => setPaymentMethod("upi")}
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem value="upi" id="upi" />
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <Label htmlFor="upi" className="flex-1 cursor-pointer font-semibold">
                  UPI
                </Label>
                <div className="flex gap-2">
                  <img src="/placeholder.svg" alt="GPay" className="h-6 w-6" />
                  <img src="/placeholder.svg" alt="PhonePe" className="h-6 w-6" />
                  <img src="/placeholder.svg" alt="Paytm" className="h-6 w-6" />
                </div>
              </div>
              {paymentMethod === "upi" && (
                <div className="mt-4 pl-8">
                  <Label htmlFor="upiId">UPI ID</Label>
                  <Input
                    id="upiId"
                    placeholder="yourname@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="mt-2"
                  />
                </div>
              )}
            </div>

            {/* Card */}
            <div
              className={cn(
                "p-4 rounded-xl border-2 transition-all cursor-pointer",
                paymentMethod === "card" ? "border-accent bg-accent/5" : "border-border"
              )}
              onClick={() => setPaymentMethod("card")}
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem value="card" id="card" />
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <Label htmlFor="card" className="flex-1 cursor-pointer font-semibold">
                  Credit / Debit Card
                </Label>
              </div>
              {paymentMethod === "card" && (
                <div className="mt-4 pl-8 space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                      className="mt-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cardExpiry">Expiry (MM/YY)</Label>
                      <Input
                        id="cardExpiry"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, "");
                          if (value.length >= 2) {
                            value = value.slice(0, 2) + "/" + value.slice(2, 4);
                          }
                          setCardExpiry(value);
                        }}
                        maxLength={5}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardCvv">CVV</Label>
                      <Input
                        id="cardCvv"
                        placeholder="123"
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Net Banking */}
            <div
              className={cn(
                "p-4 rounded-xl border-2 transition-all cursor-pointer",
                paymentMethod === "netbanking" ? "border-accent bg-accent/5" : "border-border"
              )}
              onClick={() => setPaymentMethod("netbanking")}
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem value="netbanking" id="netbanking" />
                <Building className="h-5 w-5 text-muted-foreground" />
                <Label htmlFor="netbanking" className="flex-1 cursor-pointer font-semibold">
                  Net Banking
                </Label>
              </div>
              {paymentMethod === "netbanking" && (
                <div className="mt-4 pl-8">
                  <Label>Select Bank</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {banks.map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={cn(
                          "p-3 rounded-lg border text-left text-sm transition-all",
                          selectedBank === bank
                            ? "border-accent bg-accent/5"
                            : "border-border hover:border-accent/50"
                        )}
                      >
                        {bank}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </RadioGroup>

          <Separator />

          {/* Security Info */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
            <Shield className="h-6 w-6 text-success" />
            <div className="text-sm">
              <p className="font-semibold">100% Secure Payments</p>
              <p className="text-muted-foreground">
                All transactions are encrypted with 256-bit SSL security
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} disabled={isProcessing}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handlePayment}
          disabled={!isFormValid() || isProcessing}
          className="flex-1"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>Pay ₹{planData.premium.toLocaleString()}</>
          )}
        </Button>
      </div>
    </motion.div>
  );
};
