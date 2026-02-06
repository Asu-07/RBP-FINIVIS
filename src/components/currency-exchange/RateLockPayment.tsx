import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Lock, 
  Building2, 
  CreditCard, 
  Info,
  Loader2,
  Shield,
  Clock,
  Copy,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { rbpBankDetails, generateReferenceCode } from "@/config/bankDetails";

interface RateLockPaymentProps {
  rateLockAmount: number;
  totalAmount: number;
  exchangeRate: number;
  currency: string;
  onPaymentMethodSelect: (method: "bank_transfer" | "gateway") => void;
  onPaymentConfirm: (referenceCode: string) => Promise<void>;
  isProcessing?: boolean;
}

export const RateLockPayment = ({
  rateLockAmount,
  totalAmount,
  exchangeRate,
  currency,
  onPaymentMethodSelect,
  onPaymentConfirm,
  isProcessing = false,
}: RateLockPaymentProps) => {
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "gateway" | null>(null);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [referenceCode] = useState(() => generateReferenceCode("RBPRL"));

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleMethodSelect = (method: "bank_transfer" | "gateway") => {
    setPaymentMethod(method);
    onPaymentMethodSelect(method);
    if (method === "bank_transfer") {
      setShowBankDetails(true);
    }
  };

  const handleConfirmPayment = async () => {
    await onPaymentConfirm(referenceCode);
  };

  return (
    <Card className="border-2 border-accent/30">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
            <Lock className="h-5 w-5 text-accent" />
          </div>
          <div>
            <CardTitle className="text-lg">Rate Lock Payment</CardTitle>
            <CardDescription>
              Pay a small amount to lock today's rate
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rate Lock Message */}
        <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-accent-foreground">
                Lock today's exchange rate
              </p>
              <p className="text-muted-foreground mt-1">
                Once paid, today's rate of <span className="font-mono font-semibold">₹{exchangeRate.toFixed(2)}/{currency}</span> will 
                be locked subject to compliance approval.
              </p>
            </div>
          </div>
        </div>

        {/* Amount Display */}
        <div className="bg-primary/5 rounded-xl p-4 border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-muted-foreground">Total Order Value:</span>
            <span className="font-medium">₹{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Rate Lock Amount (10%):</span>
            <span className="text-2xl font-bold text-accent">
              ₹{rateLockAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Balance payable on delivery / pickup / settlement: ₹{(totalAmount - rateLockAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>

        {!showBankDetails ? (
          <>
            {/* Payment Method Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Select Payment Method</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleMethodSelect("bank_transfer")}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    paymentMethod === "bank_transfer"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Building2 className="h-6 w-6 mb-2 text-primary" />
                  <p className="font-medium">Bank Transfer</p>
                  <p className="text-xs text-muted-foreground">NEFT/RTGS/IMPS</p>
                </button>
                
                <button
                  onClick={() => handleMethodSelect("gateway")}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    paymentMethod === "gateway"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <CreditCard className="h-6 w-6 mb-2 text-primary" />
                  <p className="font-medium">Online Payment</p>
                  <p className="text-xs text-muted-foreground">Card/UPI/Netbanking</p>
                </button>
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                All payments are processed securely. Your rate will be locked once payment is confirmed.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Bank Transfer Details */}
            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
              <h5 className="font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Bank Transfer Details
              </h5>
              
              <div className="space-y-2">
                {[
                  { label: "Bank Name", value: rbpBankDetails.bankName },
                  { label: "Account Name", value: rbpBankDetails.accountName },
                  { label: "Account Number", value: rbpBankDetails.accountNumber },
                  { label: "IFSC Code", value: rbpBankDetails.ifsc },
                  { label: "Branch", value: rbpBankDetails.branch },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">{item.value}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(item.value, item.label)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reference Code */}
              <div className="mt-4 p-3 bg-accent/10 rounded-lg border border-accent/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Payment Reference:</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-lg px-3 py-1 bg-white dark:bg-gray-900">
                      {referenceCode}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(referenceCode, "Reference")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  <strong>Important:</strong> Include this reference in your payment remarks for quick verification.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-700 dark:text-amber-400">
                  Payment Confirmation
                </p>
                <p className="text-amber-600 dark:text-amber-500 text-xs">
                  Bank transfers are typically verified within 2-4 hours during business hours. 
                  Your rate will be locked once payment is confirmed by our team.
                </p>
              </div>
            </div>

            {/* Confirm Payment Button */}
            <Button
              className="w-full h-12"
              onClick={handleConfirmPayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  I've Made the Payment
                </>
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowBankDetails(false)}
            >
              Back to Payment Options
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
