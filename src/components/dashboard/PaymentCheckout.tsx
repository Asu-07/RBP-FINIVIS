import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Shield, 
  Lock,
  ArrowRight,
  Loader2,
  CreditCard,
  Building2,
  Copy,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface FeeBreakdown {
  label: string;
  amount: number;
  currency: string;
  type?: "base" | "fee" | "tax" | "total";
}

type PaymentMethod = "gateway" | "bank_transfer";

interface PaymentCheckoutProps {
  serviceName: string;
  fees: FeeBreakdown[];
  totalAmount: number;
  totalCurrency: string;
  onConfirm: (paymentMethod: PaymentMethod) => Promise<void>;
  onCancel: () => void;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    ifsc: string;
    accountName: string;
    referenceCode?: string;
  };
  isProcessing?: boolean;
  enableGateway?: boolean;
}

const currencySymbols: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "د.إ",
};

export const PaymentCheckout = ({
  serviceName,
  fees,
  totalAmount,
  totalCurrency,
  onConfirm,
  onCancel,
  bankDetails,
  isProcessing = false,
  enableGateway = false,
}: PaymentCheckoutProps) => {
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("bank_transfer");
  const [confirmed, setConfirmed] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);

  const getSymbol = (currency: string) => currencySymbols[currency] || currency;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} copied to clipboard` });
  };

  const handleConfirm = async () => {
    if (selectedMethod === "bank_transfer") {
      setShowBankDetails(true);
    } else {
      // Gateway payment - proceed directly
      setConfirmed(true);
      await onConfirm(selectedMethod);
    }
  };

  const handleBankTransferConfirm = async () => {
    setConfirmed(true);
    await onConfirm("bank_transfer");
  };

  // Show bank transfer instructions
  if (showBankDetails && bankDetails && !confirmed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle>Bank Transfer Instructions</CardTitle>
            </div>
            <CardDescription>
              Transfer the exact amount to complete your {serviceName}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Amount to Transfer */}
            <div className="p-4 bg-primary/10 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">Amount to Transfer</p>
              <p className="text-3xl font-bold text-primary">
                {getSymbol(totalCurrency)}{totalAmount.toLocaleString()}
              </p>
            </div>

            {/* Bank Details */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Bank Name</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{bankDetails.bankName}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(bankDetails.bankName, "Bank name")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Account Number</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium">{bankDetails.accountNumber}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(bankDetails.accountNumber, "Account number")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">IFSC Code</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium">{bankDetails.ifsc}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(bankDetails.ifsc, "IFSC code")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Account Name</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{bankDetails.accountName}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(bankDetails.accountName, "Account name")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {bankDetails.referenceCode && (
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-muted-foreground">Reference Code</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono">
                      {bankDetails.referenceCode}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(bankDetails.referenceCode!, "Reference code")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Important Note */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <p className="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  <strong>Important:</strong> Include the reference code in your payment remarks. 
                  Your service will be activated once we confirm the payment (usually within 1-2 business hours).
                </span>
              </p>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-4 w-4 text-green-500" />
              <span>RBI Licensed • Secure Payment Processing</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowBankDetails(false)}
                disabled={isProcessing}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={handleBankTransferConfirm}
                disabled={isProcessing}
                className="flex-1 gap-2"
              >
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
      </motion.div>
    );
  }

  // Success state
  if (confirmed && !isProcessing) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="pt-8 text-center">
            <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-heading font-bold mb-2">
              {selectedMethod === "bank_transfer" ? "Payment Submitted!" : "Payment Successful!"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {selectedMethod === "bank_transfer" 
                ? "Your payment is awaiting confirmation. We'll notify you once verified."
                : `Your payment of ${getSymbol(totalCurrency)}${totalAmount.toLocaleString()} has been processed.`
              }
            </p>
            <div className="flex items-center justify-center gap-2 mb-6">
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                {selectedMethod === "bank_transfer" ? "Awaiting Confirmation" : "Payment Confirmed"}
              </Badge>
            </div>
            <Button onClick={onCancel}>Continue</Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Main checkout view
  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-green-500" />
          <CardTitle>Secure Checkout</CardTitle>
        </div>
        <CardDescription>
          Complete your payment for {serviceName}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Fee Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Payment Summary
          </h4>
          
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            {fees.map((fee, index) => (
              <div 
                key={index} 
                className={`flex justify-between items-center ${
                  fee.type === "total" ? "font-bold text-lg pt-2 border-t" : ""
                }`}
              >
                <span className={fee.type === "total" ? "" : "text-muted-foreground"}>
                  {fee.label}
                </span>
                <span className={fee.type === "total" ? "text-primary" : ""}>
                  {getSymbol(fee.currency)}{fee.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Payment Method Selection */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Payment Method
          </h4>
          
          <div className="grid gap-2">
            {/* Bank Transfer - Always available */}
            <button
              onClick={() => setSelectedMethod("bank_transfer")}
              className={`
                flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left
                ${selectedMethod === "bank_transfer" 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
                }
              `}
            >
              <Building2 className={`h-5 w-5 ${
                selectedMethod === "bank_transfer" ? "text-primary" : "text-muted-foreground"
              }`} />
              <div className="flex-1">
                <span className="font-medium">Bank Transfer</span>
                <p className="text-xs text-muted-foreground">Transfer to our bank account</p>
              </div>
              {selectedMethod === "bank_transfer" && (
                <CheckCircle className="h-4 w-4 text-primary" />
              )}
            </button>

            {/* Payment Gateway - Conditionally available */}
            {enableGateway && (
              <button
                onClick={() => setSelectedMethod("gateway")}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left
                  ${selectedMethod === "gateway" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                  }
                `}
              >
                <CreditCard className={`h-5 w-5 ${
                  selectedMethod === "gateway" ? "text-primary" : "text-muted-foreground"
                }`} />
                <div className="flex-1">
                  <span className="font-medium">Pay Online</span>
                  <p className="text-xs text-muted-foreground">Debit/Credit Card, UPI, Net Banking</p>
                </div>
                {selectedMethod === "gateway" && (
                  <CheckCircle className="h-4 w-4 text-primary" />
                )}
              </button>
            )}
          </div>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg">
          <span className="font-medium">Total Payable</span>
          <span className="text-2xl font-bold text-primary">
            {getSymbol(totalCurrency)}{totalAmount.toLocaleString()}
          </span>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-4 w-4 text-green-500" />
          <span>256-bit SSL Encrypted • RBI Licensed • Secure Processing</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isProcessing}
            className="flex-1 gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {selectedMethod === "bank_transfer" ? "Get Bank Details" : "Pay Now"}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
