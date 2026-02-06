import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  Clock,
  CreditCard,
  Building2,
  CheckCircle,
  MapPin,
  Calendar,
  Loader2,
  IndianRupee,
  Percent,
  Star,
} from "lucide-react";
import type { ExchangeOrderData } from "@/pages/CurrencyExchange";
import { PaymentOptionSelector, type PaymentOption } from "./PaymentOptionSelector";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { rbpBankDetails, generateReferenceCode } from "@/config/bankDetails";

const timeSlots = [
  "10:00 AM - 12:00 PM",
  "12:00 PM - 2:00 PM",
  "2:00 PM - 4:00 PM",
  "4:00 PM - 6:00 PM",
];

interface Step4OrderProcessingProps {
  orderData: ExchangeOrderData;
  onUpdateData: (data: Partial<ExchangeOrderData>) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const Step4OrderProcessing = ({
  orderData,
  onUpdateData,
  onBack,
  onContinue,
}: Step4OrderProcessingProps) => {
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "gateway">("bank_transfer");
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [paymentOption, setPaymentOption] = useState<PaymentOption | null>(orderData.paymentOption);

  // Delivery details
  const [deliveryAddress, setDeliveryAddress] = useState(orderData.deliveryAddress || "");
  const [deliveryDate, setDeliveryDate] = useState(orderData.deliveryDate || "");
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState(orderData.deliveryTimeSlot || "");

  const referenceCode = generateReferenceCode("RBPFX");

  const minDeliveryDate = new Date();
  minDeliveryDate.setDate(minDeliveryDate.getDate() + 2);

  // Total payable based on payment option
  const totalPayable = orderData.totalAmount;
  const advanceAmount = Math.round(totalPayable * 0.1 * 100) / 100;
  const balanceAmount = totalPayable - advanceAmount;

  // Current payment amount based on selected option
  const currentPaymentAmount = paymentOption === "advance_10" ? advanceAmount : totalPayable;

  // Delivery mode from order data
  const isDelivery = orderData.deliveryPreference === "home_delivery";

  const handlePaymentOptionSelect = (option: PaymentOption) => {
    setPaymentOption(option);
    onUpdateData({ paymentOption: option });
  };

  const handlePayment = async () => {
    if (!user || !paymentOption) return;

    // Validate delivery details
    if (isDelivery && (!deliveryAddress || !deliveryDate || !deliveryTimeSlot)) {
      toast.error("Please fill in all delivery details.");
      return;
    }

    if (!isDelivery && (!deliveryDate || !deliveryTimeSlot)) {
      toast.error("Please select pickup date and time.");
      return;
    }

    setProcessing(true);
    try {
      const isFullPayment = paymentOption === "full_100";

      // Create the order
      const { data: orderRecord, error } = await supabase
        .from("currency_exchange_orders")
        .insert({
          user_id: user.id,
          from_currency: orderData.fromCurrency,
          to_currency: orderData.toCurrency,
          amount: orderData.amount,
          converted_amount: orderData.convertedAmount,
          exchange_rate: orderData.exchangeRate,
          service_fee: orderData.serviceFee,
          total_amount: totalPayable,
          advance_amount: isFullPayment ? totalPayable : advanceAmount,
          balance_amount: isFullPayment ? 0 : balanceAmount,
          city: orderData.city,
          exchange_type: orderData.exchangeType,
          payee_name: orderData.payeeName,
          payee_phone: orderData.payeePhone,
          payee_address: orderData.payeeAddress,
          delivery_address: isDelivery ? deliveryAddress : "Branch Pickup - Panchkula",
          delivery_date: deliveryDate,
          delivery_time_slot: deliveryTimeSlot,
          delivery_preference: orderData.deliveryPreference,
          purpose: orderData.purpose,
          documents: orderData.uploadedDocuments || [],
          lrs_declaration_accepted: orderData.declarationAccepted,
          lrs_declaration_timestamp: new Date().toISOString(),
          usd_equivalent: orderData.usdEquivalent,
          status: isFullPayment ? "payment_received" : "advance_paid",
          // compliance_status omitted to use database default
          document_verification_status: "verified",
          advance_paid: true,
          advance_paid_at: new Date().toISOString(),
          advance_payment_method: paymentMethod,
          advance_reference: referenceCode,
          rate_locked_at: new Date().toISOString(),
          notes: `Payment via ${paymentMethod}${paymentMethod === 'gateway' && upiId ? ` (UPI: ${upiId})` : ''}`,
          rate_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          balance_paid: isFullPayment,
          balance_paid_at: isFullPayment ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;

      // Link uploaded documents to the order
      if (orderData.uploadedDocuments && orderData.uploadedDocuments.length > 0) {
        const { error: linkError } = await supabase
          .from("kyc_documents")
          .update({ order_id: orderRecord.id })
          .in("storage_path", orderData.uploadedDocuments);

        if (linkError) {
          console.error("Failed to link documents to currency exchange order:", linkError);
        }
      }

      onUpdateData({
        orderId: orderRecord.id,
        orderNumber: orderRecord.order_number,
        deliveryAddress: isDelivery ? deliveryAddress : "Branch Pickup - Panchkula",
        deliveryDate,
        deliveryTimeSlot,
        paymentOption,
        rateLockAmount: isFullPayment ? totalPayable : advanceAmount,
        balanceAmount: isFullPayment ? 0 : balanceAmount,
        rateLockPaymentStatus: "paid",
        rateLockPaymentMethod: paymentMethod,
        rateLockReference: referenceCode,
        rateLockedAt: new Date().toISOString(),
      });

      setPaymentConfirmed(true);

      const successMessage = isFullPayment
        ? "Full payment confirmed! Your order is being processed."
        : "Advance payment confirmed! Rate locked for 24 hours.";
      toast.success(successMessage);

      setTimeout(() => {
        onContinue();
      }, 1500);
    } catch (error: unknown) {
      console.error("Error processing payment:", error);
      const errorMessage = error instanceof Error ? error.message : "Payment failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  // For branch pickup, delivery address is optional
  const canProceedToPayment = paymentOption && (isDelivery
    ? (deliveryAddress && deliveryDate && deliveryTimeSlot)
    : (deliveryDate && deliveryTimeSlot));

  const canConfirmPayment = paymentMethod && canProceedToPayment;

  // If gateway selected, require a UPI VPA (basic validation)
  const isUpiValid = upiId.trim() === "" ? false : upiId.includes("@");
  const canConfirmWithGateway = paymentMethod === "gateway" ? isUpiValid && canConfirmPayment : canConfirmPayment;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Step 4: Select Payment Option & Complete</CardTitle>
            <CardDescription>
              Choose your preferred payment method and complete your order
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Order Summary */}
        <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-4 border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Order Summary</h4>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400">
              KYC Verified
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Type:</span>
              <span className="ml-2 font-medium capitalize">{orderData.exchangeType} Forex</span>
            </div>
            <div>
              <span className="text-muted-foreground">Currency:</span>
              <span className="ml-2 font-medium">{orderData.exchangeType === "buy" ? orderData.toCurrency : orderData.fromCurrency}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Amount:</span>
              <span className="ml-2 font-medium">
                {orderData.exchangeType === "buy" ? orderData.toCurrency : "INR"} {orderData.amount.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Rate:</span>
              <span className="ml-2 font-mono font-medium">₹{orderData.exchangeRate.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Purpose:</span>
              <span className="ml-2 font-medium capitalize">{orderData.purpose}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Delivery:</span>
              <span className="ml-2 font-medium">{isDelivery ? "Home Delivery" : "Branch Pickup"}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t flex justify-between items-center">
            <span className="font-semibold">Total Order Value:</span>
            <span className="text-xl font-bold text-primary flex items-center">
              <IndianRupee className="h-5 w-5" />
              {totalPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Payment Option Selection */}
        {!paymentConfirmed && (
          <PaymentOptionSelector
            totalAmount={totalPayable}
            exchangeRate={orderData.exchangeRate}
            currency={orderData.exchangeType === "buy" ? orderData.toCurrency : orderData.fromCurrency}
            selectedOption={paymentOption}
            onOptionSelect={handlePaymentOptionSelect}
          />
        )}

        {/* Delivery/Pickup Details - Show after payment option selected */}
        {!paymentConfirmed && paymentOption && (
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {isDelivery ? "Delivery Details" : "Pickup Details"}
            </h4>

            {isDelivery ? (
              <div className="space-y-2">
                <Label>Delivery Address <span className="text-destructive">*</span></Label>
                <Textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter complete delivery address including landmark"
                  rows={3}
                />
              </div>
            ) : (
              <div className="p-4 bg-muted/50 rounded-lg border">
                <p className="font-medium text-sm">Branch Collection Address:</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Office No. 1, Haryana Agro Mall<br />
                  Sector 20, Panchkula, Haryana
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Branch collection is subject to availability and RBI guidelines.
                </p>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {isDelivery ? "Preferred Delivery Date" : "Pickup Date"} <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  min={minDeliveryDate.toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Time Slot <span className="text-destructive">*</span>
                </Label>
                <Select value={deliveryTimeSlot} onValueChange={setDeliveryTimeSlot}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Payment Section - Show after delivery details */}
        {!paymentConfirmed && paymentOption && canProceedToPayment && (
          <div className="space-y-4">
            <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold flex items-center gap-2">
                  {paymentOption === "advance_10" ? (
                    <>
                      <Percent className="h-4 w-4" />
                      10% Advance Payment
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Full Payment
                    </>
                  )}
                </h4>
                {paymentOption === "advance_10" && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
                    <Star className="h-3 w-3 mr-1" />
                    Rate Locked 24h
                  </Badge>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Amount Payable Now:</span>
                <span className="text-2xl font-bold text-primary flex items-center">
                  <IndianRupee className="h-5 w-5" />
                  {currentPaymentAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              {paymentOption === "advance_10" && (
                <p className="text-xs text-muted-foreground mt-2">
                  Balance of ₹{balanceAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} payable on delivery/pickup
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label>Select Payment Method</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod("bank_transfer")}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${paymentMethod === "bank_transfer"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                    }`}
                >
                  <Building2 className="h-6 w-6 mb-2" />
                  <p className="font-medium">Bank Transfer</p>
                  <p className="text-xs text-muted-foreground">NEFT/RTGS/IMPS</p>
                </button>

                <button
                  onClick={() => setPaymentMethod("gateway")}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${paymentMethod === "gateway"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                    }`}
                >
                  <CreditCard className="h-6 w-6 mb-2" />
                  <p className="font-medium">Online Payment</p>
                  <p className="text-xs text-muted-foreground">Card/UPI/Netbanking</p>
                </button>
              </div>
            </div>

            {paymentMethod === "bank_transfer" && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <h5 className="font-semibold">Bank Transfer Details</h5>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Bank:</span>
                  <span className="font-medium">{rbpBankDetails.bankName}</span>
                  <span className="text-muted-foreground">Account:</span>
                  <span className="font-mono font-medium">{rbpBankDetails.accountNumber}</span>
                  <span className="text-muted-foreground">IFSC:</span>
                  <span className="font-mono font-medium">{rbpBankDetails.ifsc}</span>
                  <span className="text-muted-foreground">Reference:</span>
                  <span className="font-mono font-medium text-primary">{referenceCode}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  * Please use the reference code in payment remarks for quick verification
                </p>
              </div>
            )}

            <Button
              className="w-full h-12"
              disabled={!canConfirmWithGateway || processing}
              onClick={handlePayment}
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  Confirm Payment of ₹{currentPaymentAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* UPI ID input for gateway payments (basic VPA capture) */}
        {paymentMethod === "gateway" && !paymentConfirmed && (
          <div className="mt-4">
            <Label className="text-sm">UPI ID (optional for card/netbanking; required for UPI)</Label>
            <Input
              placeholder="e.g. yourname@oksbi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="mt-2"
            />
            {!isUpiValid && upiId.trim() !== "" && (
              <p className="text-xs text-red-600 mt-2">Please enter a valid UPI ID (contains '@')</p>
            )}
          </div>
        )}

        {/* Payment Confirmed */}
        {paymentConfirmed && (
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-600">Payment Confirmed!</h3>
            <p className="text-muted-foreground mt-2">
              {paymentOption === "advance_10"
                ? "Your rate has been locked for 24 hours. Balance payable on delivery."
                : "Your order is being processed."}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Redirecting to review...</p>
          </div>
        )}

        {/* Back Button - Only show if payment not confirmed */}
        {!paymentConfirmed && (
          <Button variant="outline" onClick={onBack} className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
