import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { currencySymbols, rbpBankDetails, generateReferenceCode } from "@/config/bankDetails";
import { 
  ArrowLeft, 
  ArrowRight, 
  Lock, 
  Shield,
  Loader2,
  CheckCircle,
  Building2,
  CreditCard,
  Copy,
  Clock,
} from "lucide-react";
import type { ExchangeOrderData } from "@/pages/CurrencyExchange";

interface AdvancePaymentProps {
  orderData: ExchangeOrderData;
  onUpdateData: (data: Partial<ExchangeOrderData>) => void;
  onBack: () => void;
  onContinue: () => void;
}

type PaymentMethod = "gateway" | "bank_transfer";

export const AdvancePayment = ({ 
  orderData, 
  onUpdateData, 
  onBack, 
  onContinue 
}: AdvancePaymentProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("bank_transfer");
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [referenceCode] = useState(() => generateReferenceCode("RBPFX"));

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} copied to clipboard` });
  };

  const handleProceed = () => {
    if (selectedMethod === "bank_transfer") {
      setShowBankDetails(true);
    } else {
      // Gateway payment - would integrate with SBI gateway
      handlePaymentConfirm();
    }
  };

  const handlePaymentConfirm = async () => {
    if (!user) return;

    setIsProcessing(true);
    try {
      // Create the order in database
      const { data, error } = await supabase
        .from("currency_exchange_orders")
        .insert({
          user_id: user.id,
          city: orderData.city,
          from_currency: orderData.fromCurrency,
          to_currency: orderData.toCurrency,
          amount: orderData.amount,
          converted_amount: orderData.convertedAmount,
          exchange_rate: orderData.exchangeRate,
          service_fee: orderData.serviceFee,
          total_amount: orderData.totalAmount,
          advance_amount: orderData.rateLockAmount,
          balance_amount: orderData.balanceAmount,
          advance_paid: true,
          advance_paid_at: new Date().toISOString(),
          advance_payment_method: selectedMethod,
          advance_reference: referenceCode,
          status: "advance_paid",
          rate_locked_at: new Date().toISOString(),
          rate_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        })
        .select()
        .single();

      if (error) throw error;

      onUpdateData({
        orderId: data.id,
        orderNumber: data.order_number,
        rateLockedAt: data.rate_locked_at,
      });

      toast({
        title: "Advance Payment Submitted",
        description: "Your rate has been locked. Please complete payee details.",
      });

      onContinue();
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Bank transfer details view
  if (showBankDetails) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>Bank Transfer - Advance Payment</CardTitle>
          </div>
          <CardDescription>
            Transfer the advance amount (10%) to lock your exchange rate
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Amount */}
          <div className="p-4 bg-primary/10 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-1">Rate Lock Amount to Pay</p>
            <p className="text-3xl font-bold text-primary">
              {currencySymbols[orderData.fromCurrency]}{orderData.rateLockAmount.toFixed(2)}
            </p>
            <Badge variant="secondary" className="mt-2">10% of {currencySymbols[orderData.fromCurrency]}{orderData.totalAmount.toFixed(2)}</Badge>
          </div>

          {/* Bank Details */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Bank Name</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{rbpBankDetails.bankName}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(rbpBankDetails.bankName, "Bank name")}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Account Number</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium">{rbpBankDetails.accountNumber}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(rbpBankDetails.accountNumber, "Account number")}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">IFSC Code</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium">{rbpBankDetails.ifsc}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(rbpBankDetails.ifsc, "IFSC code")}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Account Name</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{rbpBankDetails.accountName}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(rbpBankDetails.accountName, "Account name")}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-muted-foreground">Reference Code</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono">{referenceCode}</Badge>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(referenceCode, "Reference code")}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <p className="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
              <Clock className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                <strong>Important:</strong> Include the reference code in your payment remarks. 
                Your rate will be locked once we confirm the payment (usually within 1-2 hours).
              </span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowBankDetails(false)} disabled={isProcessing} className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={handlePaymentConfirm} disabled={isProcessing} className="flex-1 gap-2">
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  I've Made the Payment
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Advance Booking Payment</CardTitle>
            <CardDescription>
              Pay 10% advance to lock your exchange rate for 24 hours
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Order Summary */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Exchange</span>
            <span className="font-medium">
              {currencySymbols[orderData.fromCurrency]}{orderData.amount.toFixed(2)} → {currencySymbols[orderData.toCurrency]}{orderData.convertedAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Rate</span>
            <span className="font-mono text-sm">
              1 {orderData.fromCurrency} = {orderData.exchangeRate.toFixed(4)} {orderData.toCurrency}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Service Fee</span>
            <span>{currencySymbols[orderData.fromCurrency]}{orderData.serviceFee.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center font-medium">
            <span>Total Amount</span>
            <span>{currencySymbols[orderData.fromCurrency]}{orderData.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Rate Lock Amount */}
        <div className="p-4 bg-primary/10 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Rate Lock Amount (10%)
              </p>
              <p className="text-sm text-muted-foreground">Locks your rate for 24 hours</p>
            </div>
            <span className="text-2xl font-bold text-primary">
              {currencySymbols[orderData.fromCurrency]}{orderData.rateLockAmount.toFixed(2)}
            </span>
          </div>
        </div>

        <Separator />

        {/* Payment Method */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Payment Method
          </h4>
          
          <div className="grid gap-2">
            <button
              onClick={() => setSelectedMethod("bank_transfer")}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left
                ${selectedMethod === "bank_transfer" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
            >
              <Building2 className={`h-5 w-5 ${selectedMethod === "bank_transfer" ? "text-primary" : "text-muted-foreground"}`} />
              <div className="flex-1">
                <span className="font-medium">Bank Transfer</span>
                <p className="text-xs text-muted-foreground">Transfer to SBI account</p>
              </div>
              {selectedMethod === "bank_transfer" && <CheckCircle className="h-4 w-4 text-primary" />}
            </button>

            <button
              onClick={() => setSelectedMethod("gateway")}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left
                ${selectedMethod === "gateway" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
            >
              <CreditCard className={`h-5 w-5 ${selectedMethod === "gateway" ? "text-primary" : "text-muted-foreground"}`} />
              <div className="flex-1">
                <span className="font-medium">SBI Payment Gateway</span>
                <p className="text-xs text-muted-foreground">Debit/Credit Card, UPI, Net Banking</p>
              </div>
              {selectedMethod === "gateway" && <CheckCircle className="h-4 w-4 text-primary" />}
            </button>
          </div>
        </div>

        {/* Security */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-4 w-4 text-green-500" />
          <span>RBI Licensed • SBI Payment Partner • Secure Processing</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleProceed} disabled={isProcessing} className="flex-1">
            {selectedMethod === "bank_transfer" ? "Get Bank Details" : "Pay Now"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
