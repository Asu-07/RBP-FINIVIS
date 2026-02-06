import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { currencySymbols } from "@/config/bankDetails";
import { format, parseISO } from "date-fns";
import { 
  CheckCircle,
  MapPin,
  Truck,
  Clock,
  FileText,
  Download,
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

const timeSlotLabels: Record<string, string> = {
  "09:00-12:00": "9:00 AM - 12:00 PM",
  "12:00-15:00": "12:00 PM - 3:00 PM",
  "15:00-18:00": "3:00 PM - 6:00 PM",
  "18:00-21:00": "6:00 PM - 9:00 PM",
};

interface OrderCompleteProps {
  orderData: ExchangeOrderData;
  onNewOrder: () => void;
}

export const OrderComplete = ({ orderData, onNewOrder }: OrderCompleteProps) => {
  const navigate = useNavigate();

  const formatDeliveryDate = () => {
    if (!orderData.deliveryDate) return "TBD";
    try {
      return format(parseISO(orderData.deliveryDate), "EEEE, MMMM d, yyyy");
    } catch {
      return orderData.deliveryDate;
    }
  };

  return (
    <Card className="shadow-card border-green-500/20 bg-green-500/5">
      <CardContent className="pt-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-heading font-bold mb-2">Order Confirmed!</h2>
          <p className="text-muted-foreground">
            Your currency exchange order has been successfully placed
          </p>
          <Badge variant="outline" className="mt-3 text-green-600 border-green-500">
            {orderData.orderNumber || "Order Placed"}
          </Badge>
        </div>

        {/* Order Timeline */}
        <div className="bg-card rounded-lg p-6 mb-6 space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Order Summary
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-mono font-medium">{orderData.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Exchange</span>
              <span>
                {currencySymbols[orderData.fromCurrency]}{orderData.amount.toFixed(2)} {orderData.fromCurrency} → {currencySymbols[orderData.toCurrency]}{orderData.convertedAmount.toFixed(2)} {orderData.toCurrency}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Locked Rate</span>
              <span className="font-mono text-sm">
                1 {orderData.fromCurrency} = {orderData.exchangeRate.toFixed(4)} {orderData.toCurrency}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Paid</span>
              <span className="font-medium text-green-600">
                {currencySymbols[orderData.fromCurrency]}{orderData.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-card rounded-lg p-6 mb-6 space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" />
            Delivery Details
          </h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{orderData.payeeName}</p>
                <p className="text-sm text-muted-foreground">{orderData.deliveryAddress}</p>
                <p className="text-sm text-muted-foreground">{cityNames[orderData.city] || orderData.city}</p>
                <p className="text-sm text-muted-foreground">{orderData.payeePhone}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{formatDeliveryDate()}</p>
                <p className="text-sm text-muted-foreground">
                  {timeSlotLabels[orderData.deliveryTimeSlot] || orderData.deliveryTimeSlot}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-card rounded-lg p-6 mb-6">
          <h3 className="font-medium mb-4">Order Status</h3>
          <div className="space-y-3">
            {[
              { label: "Order Placed", completed: true },
              { label: "Advance Payment (10%)", completed: true },
              { label: "Balance Payment (90%)", completed: true },
              { label: "Delivery Scheduled", completed: true },
              { label: "Out for Delivery", completed: false },
              { label: "Delivered", completed: false },
            ].map((step, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                  step.completed ? "bg-green-500" : "bg-muted"
                }`}>
                  {step.completed && <CheckCircle className="h-4 w-4 text-white" />}
                </div>
                <span className={step.completed ? "text-foreground" : "text-muted-foreground"}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onNewOrder} className="flex-1">
            New Exchange
          </Button>
          <Button onClick={() => navigate("/dashboard")} className="flex-1">
            Go to Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
