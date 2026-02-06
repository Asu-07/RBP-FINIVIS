import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  CheckCircle,
  Download,
  Printer,
  Share2,
  Clock,
  MapPin,
  User,
  FileText,
  Shield,
  CreditCard,
  RefreshCw,
  Phone,
  Mail,
} from "lucide-react";
import type { ExchangeOrderData } from "@/pages/CurrencyExchange";
import { format } from "date-fns";
import { RegulatoryDisclaimer } from "@/components/RegulatoryDisclaimer";

interface Step5ReviewConfirmationProps {
  orderData: ExchangeOrderData;
  onBack: () => void;
  onNewOrder: () => void;
}

export const Step5ReviewConfirmation = ({
  orderData,
  onBack,
  onNewOrder,
}: Step5ReviewConfirmationProps) => {
  const [showFullReceipt, setShowFullReceipt] = useState(true);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In production, this would generate a PDF
    alert("PDF download feature coming soon!");
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
        <CardContent className="pt-8 text-center">
          <div className="h-20 w-20 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-green-700 dark:text-green-400 mb-2">
            Order Confirmed!
          </h2>
          <p className="text-muted-foreground mb-4">
            Your forex order has been successfully placed
          </p>
          <Badge variant="outline" className="text-lg px-4 py-1 font-mono">
            Order #{orderData.orderNumber || orderData.orderId?.slice(0, 8).toUpperCase()}
          </Badge>
        </CardContent>
      </Card>

      {/* Receipt Card */}
      <Card className="shadow-card print:shadow-none">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Transaction Receipt</CardTitle>
                <CardDescription>
                  RBI-Compliant Forex Transaction Record
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2 print:hidden">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-1" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Transaction Details */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Transaction Details
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium capitalize">{orderData.exchangeType} Forex</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Currency:</span>
                  <span className="font-medium">{orderData.exchangeType === "buy" ? orderData.toCurrency : orderData.fromCurrency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">
                    {orderData.exchangeType === "buy" ? orderData.toCurrency : "INR"} {orderData.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Exchange Rate:</span>
                  <span className="font-mono font-medium">₹{orderData.exchangeRate.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate Locked At:</span>
                  <span className="font-medium">
                    {orderData.rateLockedAt ? format(new Date(orderData.rateLockedAt), "dd MMM yyyy, HH:mm") : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Compliance Info
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Purpose:</span>
                  <span className="font-medium capitalize">{orderData.purpose}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">USD Equivalent:</span>
                  <span className="font-mono font-medium">USD {orderData.usdEquivalent.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">LRS Declaration:</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Accepted
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">KYC Status:</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Summary */}
          <div className="space-y-4">
            <h4 className="font-semibold">Payment Summary</h4>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base Amount:</span>
                <span className="font-medium">₹{orderData.convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service Fee:</span>
                <span className="font-medium">₹{orderData.serviceFee.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Total Amount:</span>
                <span className="text-primary">₹{orderData.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              {orderData.exchangeType === "buy" && (
                <>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rate Lock Amount Paid (10%):</span>
                    <span className="font-medium text-green-600">
                      ₹{orderData.rateLockAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      <CheckCircle className="h-3 w-3 inline ml-1" />
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Balance Payable on Delivery:</span>
                    <span className="font-medium">₹{orderData.balanceAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* Customer & Delivery Details */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Details
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{orderData.payeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{orderData.payeePhone}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Delivery Details
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">City:</span>
                  <span className="font-medium">{orderData.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">
                    {orderData.deliveryDate ? format(new Date(orderData.deliveryDate), "dd MMM yyyy") : "TBD"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time Slot:</span>
                  <span className="font-medium">{orderData.deliveryTimeSlot || "TBD"}</span>
                </div>
              </div>
            </div>
          </div>

          {orderData.deliveryAddress && (
            <div className="bg-muted/50 rounded-lg p-3">
              <span className="text-sm text-muted-foreground">Delivery Address:</span>
              <p className="text-sm font-medium mt-1">{orderData.deliveryAddress}</p>
            </div>
          )}

          <Separator />

          {/* What's Next */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              What's Next?
            </h4>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <span className="font-bold text-primary">1</span>
                </div>
                <p className="text-sm font-medium">Document Verification</p>
                <p className="text-xs text-muted-foreground">1-2 hours</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <span className="font-bold text-primary">2</span>
                </div>
                <p className="text-sm font-medium">Balance Payment</p>
                <p className="text-xs text-muted-foreground">Before delivery</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <span className="font-bold text-primary">3</span>
                </div>
                <p className="text-sm font-medium">Home Delivery</p>
                <p className="text-xs text-muted-foreground">{orderData.deliveryDate ? format(new Date(orderData.deliveryDate), "dd MMM") : "As scheduled"}</p>
              </div>
            </div>
          </div>

          {/* Support Contact */}
          <div className="bg-primary/5 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">Need Help?</p>
              <p className="text-sm text-muted-foreground">Our support team is available 24/7</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-1" />
                Call
              </Button>
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-1" />
                Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RBI Disclaimer */}
      <RegulatoryDisclaimer serviceType="currency_exchange" variant="compact" />

      {/* Actions */}
      <div className="flex gap-4 print:hidden">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <Button onClick={onNewOrder} className="flex-1">
          <RefreshCw className="h-4 w-4 mr-2" />
          New Order
        </Button>
      </div>
    </div>
  );
};
