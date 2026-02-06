import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { currencySymbols } from "@/config/bankDetails";
import { 
  ArrowLeft, 
  ArrowRight, 
  FileText,
  MapPin,
  User,
  Lock,
  CheckCircle,
} from "lucide-react";
import type { ExchangeOrderData } from "@/pages/CurrencyExchange";

const cityNames: Record<string, string> = {
  mumbai: "Mumbai",
  delhi: "Delhi NCR",
  bangalore: "Bangalore",
  hyderabad: "Hyderabad",
  chennai: "Chennai",
  kolkata: "Kolkata",
  pune: "Pune",
  ahmedabad: "Ahmedabad",
  jaipur: "Jaipur",
  cochin: "Kochi",
  lucknow: "Lucknow",
  chandigarh: "Chandigarh",
};

interface OrderConfirmationProps {
  orderData: ExchangeOrderData;
  onBack: () => void;
  onContinue: () => void;
}

export const OrderConfirmation = ({ 
  orderData, 
  onBack, 
  onContinue 
}: OrderConfirmationProps) => {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <CardTitle>Order Confirmation</CardTitle>
            <CardDescription>
              Review your order details before making the balance payment
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Order Status */}
        <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="font-medium">Rate Locked – Awaiting Balance Payment</span>
          </div>
          <Badge variant="outline" className="text-green-600 border-green-500">
            {orderData.orderNumber || "Processing"}
          </Badge>
        </div>

        {/* Order Details */}
        <div className="space-y-4">
          {/* Location */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-medium">Delivery Location</span>
            </div>
            <div className="text-sm space-y-1">
              <p><span className="text-muted-foreground">City:</span> {cityNames[orderData.city] || orderData.city}</p>
              <p><span className="text-muted-foreground">Address:</span> {orderData.deliveryAddress}</p>
            </div>
          </div>

          {/* Exchange Details */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="h-4 w-4 text-primary" />
              <span className="font-medium">Exchange Details</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Currency Exchange</span>
              <span>{orderData.fromCurrency} → {orderData.toCurrency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span>{currencySymbols[orderData.fromCurrency]}{orderData.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">You Get</span>
              <span className="text-green-600 font-medium">
                {currencySymbols[orderData.toCurrency]}{orderData.convertedAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Locked Rate</span>
              <span className="font-mono text-sm">
                1 {orderData.fromCurrency} = {orderData.exchangeRate.toFixed(4)} {orderData.toCurrency}
              </span>
            </div>
          </div>

          {/* Payee Details */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-primary" />
              <span className="font-medium">Payee Details</span>
            </div>
            <div className="text-sm space-y-1">
              <p><span className="text-muted-foreground">Name:</span> {orderData.payeeName}</p>
              <p><span className="text-muted-foreground">Phone:</span> {orderData.payeePhone}</p>
              <p><span className="text-muted-foreground">Address:</span> {orderData.payeeAddress}</p>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-primary/5 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Exchange Amount</span>
              <span>{currencySymbols[orderData.fromCurrency]}{orderData.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service Fee</span>
              <span>{currencySymbols[orderData.fromCurrency]}{orderData.serviceFee.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Total Amount</span>
              <span>{currencySymbols[orderData.fromCurrency]}{orderData.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Rate Lock Amount Paid (10%)</span>
              <span>- {currencySymbols[orderData.fromCurrency]}{orderData.rateLockAmount.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold text-primary">
              <span>Balance Payable on Delivery (90%)</span>
              <span>{currencySymbols[orderData.fromCurrency]}{orderData.balanceAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={onContinue} className="flex-1">
            Pay Balance
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
