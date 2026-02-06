import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { currencySymbols, rbpBankDetails, generateReferenceCode } from "@/config/bankDetails";
import { 
  ArrowLeft, 
  ArrowRight, 
  Wallet,
  Shield,
  Loader2,
  CheckCircle,
  Building2,
  CreditCard,
  Copy,
  Clock,
} from "lucide-react";
import type { ExchangeOrderData } from "@/pages/CurrencyExchange";

interface BalancePaymentProps {
  orderData: ExchangeOrderData;
  onUpdateData: (data: Partial<ExchangeOrderData>) => void;
  onBack: () => void;
  onContinue: () => void;
}

type PaymentMethod = "gateway" | "bank_transfer";

export const BalancePayment = ({ 
  orderData, 
  onUpdateData, 
  onBack, 
  onContinue 
}: BalancePaymentProps) => {
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("bank_transfer");
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [referenceCode] = useState(() => generateReferenceCode("RBPBAL"));

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} copied to clipboard` });
  };

  const handleProceed = () => {
    if (selectedMethod === "bank_transfer") {
      setShowBankDetails(true);
    } else {
      handlePaymentConfirm();
    }
  };

  const handlePaymentConfirm = async () => {
    if (!orderData.orderId) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("currency_exchange_orders")
        .update({
          balance_paid: true,
          balance_paid_at: new Date().toISOString(),
          balance_payment_method: selectedMethod,
          balance_reference: referenceCode,
          status: "balance_paid",
        })
        .eq("id", orderData.orderId);

      if (error) throw error;

      toast({
        title: "Balance Payment Submitted",
        description: "Your order is confirmed. Please schedule delivery.",
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
            <CardTitle>Bank Transfer - Balance Payment</CardTitle>
          </div>
          <CardDescription>
            Transfer the remaining 90% to complete your order
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Amount */}
          <div className="p-4 bg-primary/10 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-1">Balance Amount to Pay</p>
            <p className="text-3xl font-bold text-primary">
              {currencySymbols[orderData.fromCurrency]}{orderData.balanceAmount.toFixed(2)}
            </p>
            <Badge variant="secondary" className="mt-2">90% of {currencySymbols[orderData.fromCurrency]}{orderData.totalAmount.toFixed(2)}</Badge>
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
                You can schedule delivery once we confirm the payment.
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
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Balance Payment</CardTitle>
            <CardDescription>
              Pay the remaining 90% to complete your order
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance Amount */}
        <div className="p-4 bg-primary/10 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Balance Amount (90%)</p>
              <p className="text-sm text-muted-foreground">Rate Lock Amount of {currencySymbols[orderData.fromCurrency]}{orderData.rateLockAmount.toFixed(2)} already paid</p>
            </div>
            <span className="text-2xl font-bold text-primary">
              {currencySymbols[orderData.fromCurrency]}{orderData.balanceAmount.toFixed(2)}
            </span>
          </div>
        </div>

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
