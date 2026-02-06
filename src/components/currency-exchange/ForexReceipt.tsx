import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Download, 
  Share2, 
  Home,
  Shield,
  FileText,
  Printer,
  Copy,
} from "lucide-react";
import { companyInfo } from "@/data/mockData";
import { currencySymbols } from "@/config/bankDetails";
import { useToast } from "@/hooks/use-toast";
import type { ExchangeOrderData } from "@/pages/CurrencyExchange";

const purposeLabels: Record<string, string> = {
  travel: "Overseas Travel",
  education: "Education Abroad",
  medical: "Medical Treatment",
  employment: "Employment Abroad",
  business: "Business Travel",
};

interface ForexReceiptProps {
  orderData: ExchangeOrderData;
  onNewOrder: () => void;
}

export const ForexReceipt = ({ orderData, onNewOrder }: ForexReceiptProps) => {
  const { toast } = useToast();
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const isBuy = orderData.exchangeType === "buy";
  const orderDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-green-500/10">
        <CardContent className="pt-8 text-center">
          <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-heading font-bold mb-2">
            {isBuy ? "Forex Purchase" : "Forex Sale"} Submitted!
          </h2>
          <p className="text-muted-foreground">
            Your order has been placed successfully. Processing will begin after payment confirmation.
          </p>
        </CardContent>
      </Card>

      {/* Receipt */}
      <Card className="shadow-lg" ref={receiptRef}>
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-accent" />
              <div>
                <CardTitle className="text-lg">{companyInfo.name}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  FFMC Licence: {companyInfo.regulatory.rbiLicence}
                </p>
              </div>
            </div>
            <Badge variant={isBuy ? "default" : "secondary"}>
              {isBuy ? "BUY FOREX" : "SELL FOREX"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Order Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground block">Order Number</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-lg">{orderData.orderNumber}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(orderData.orderNumber || "")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground block">Order Date</span>
              <span className="font-medium">{orderDate}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">KYC Reference</span>
              <span className="font-mono">{orderData.kycReference || "KYC-VERIFIED"}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Status</span>
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700">
                Awaiting Payment
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Transaction Details */}
          <div>
            <h4 className="font-heading font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Transaction Details
            </h4>
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction Type</span>
                <span className="font-medium">{isBuy ? "Purchase (INR → FX)" : "Sale (FX → INR)"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Foreign Currency</span>
                <span className="font-medium">{orderData.toCurrency || orderData.fromCurrency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {isBuy ? "Foreign Currency Amount" : "Amount Sold"}
                </span>
                <span className="font-mono font-medium">
                  {currencySymbols[isBuy ? orderData.toCurrency : orderData.fromCurrency] || ""}
                  {orderData.convertedAmount?.toFixed(2) || orderData.amount?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Exchange Rate</span>
                <span className="font-mono">₹{orderData.exchangeRate?.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">INR Amount</span>
                <span className="font-mono">₹{(isBuy ? orderData.amount : orderData.convertedAmount)?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service Fee</span>
                <span className="font-mono">₹{orderData.serviceFee?.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium text-lg">
                <span>{isBuy ? "Total Amount Payable" : "Total Amount Receivable"}</span>
                <span className={isBuy ? "text-destructive" : "text-green-600"}>
                  ₹{orderData.totalAmount?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Purpose & Compliance */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-heading font-semibold mb-3">Purpose of Exchange</h4>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="font-medium">{purposeLabels[orderData.purpose || ""] || orderData.purpose}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Travel Date: {orderData.travelDate}
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-heading font-semibold mb-3">Delivery Details</h4>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-sm">{orderData.deliveryAddress || orderData.city}</p>
                {orderData.deliveryDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Delivery: {orderData.deliveryDate} {orderData.deliveryTimeSlot && `(${orderData.deliveryTimeSlot})`}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Regulatory Compliance */}
          <div className="bg-accent/5 rounded-lg p-4 border border-accent/10">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-accent" />
              <span className="font-heading font-semibold text-sm">RBI Compliance Certificate</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This transaction is processed as per RBI Master Direction on Money Changing Activities 
              and FEMA (Foreign Exchange Management Act), 1999. Form A2 will be generated for this transaction. 
              Transaction ID: {orderData.orderId}. This receipt is computer-generated and does not require signature.
            </p>
          </div>

          {/* Company Footer */}
          <div className="text-center text-xs text-muted-foreground pt-4 border-t">
            <p className="font-medium">{companyInfo.legalName}</p>
            <p>{companyInfo.address.line1}, {companyInfo.address.city}, {companyInfo.address.state} - {companyInfo.address.pincode}</p>
            <p>CIN: {companyInfo.regulatory.cin} | GST: {companyInfo.regulatory.gst}</p>
            <p className="mt-2">For support: {companyInfo.contact.email} | {companyInfo.contact.phone}</p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print Receipt
        </Button>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
        <Button variant="outline">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
        <Button onClick={onNewOrder}>
          <Home className="h-4 w-4 mr-2" />
          New Order
        </Button>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-center text-muted-foreground max-w-2xl mx-auto">
        This is an electronic receipt generated by {companyInfo.name}. 
        Exchange rates are locked for 24 hours from the time of order. 
        In case of non-payment within 24 hours, the order will be cancelled and rates will be recalculated.
        For any queries, please contact our customer support.
      </p>
    </div>
  );
};
