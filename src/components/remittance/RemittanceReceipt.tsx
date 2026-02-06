import { forwardRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Download, 
  Printer, 
  Shield, 
  Globe, 
  Calendar,
  User,
  FileText,
  Building2,
} from "lucide-react";

interface RemittanceReceiptProps {
  transactionId: string;
  referenceNumber: string;
  senderName: string;
  recipientName: string;
  recipientCountry: string;
  sourceAmount: number;
  sourceCurrency: string;
  destinationAmount: number;
  destinationCurrency: string;
  exchangeRate: number;
  fee: number;
  totalPaid: number;
  purpose: string;
  purposeCode: string;
  status: string;
  createdAt: string;
  estimatedDelivery: string;
  kycReference?: string;
  onDownload?: () => void;
  onPrint?: () => void;
}

export const RemittanceReceipt = forwardRef<HTMLDivElement, RemittanceReceiptProps>(
  (props, ref) => {
    const {
      transactionId,
      referenceNumber,
      senderName,
      recipientName,
      recipientCountry,
      sourceAmount,
      sourceCurrency,
      destinationAmount,
      destinationCurrency,
      exchangeRate,
      fee,
      totalPaid,
      purpose,
      purposeCode,
      status,
      createdAt,
      estimatedDelivery,
      kycReference,
      onDownload,
      onPrint,
    } = props;

    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    return (
      <div ref={ref}>
        <Card className="border-2 border-primary/20 overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-6 w-6" />
                  <span className="text-xl font-bold">RBP FINIVIS</span>
                </div>
                <p className="text-sm text-primary-foreground/80">
                  RBI Licensed Full-Fledged Money Changer
                </p>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="text-primary bg-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {status === 'completed' ? 'Completed' : 'Processing'}
                </Badge>
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Transaction Reference */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Transaction Reference</p>
                <p className="font-mono font-bold text-lg">{referenceNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Date & Time</p>
                <p className="font-medium">{formatDate(createdAt)}</p>
              </div>
            </div>

            {/* Transfer Details */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Transfer Details
              </h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">You Sent</p>
                  <p className="text-xl font-bold">{sourceCurrency} {sourceAmount.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <p className="text-xs text-muted-foreground">Recipient Gets</p>
                  <p className="text-xl font-bold text-green-600">
                    {destinationCurrency} {destinationAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Sender & Recipient */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Sender
                </h4>
                <p className="font-medium">{senderName}</p>
                {kycReference && (
                  <p className="text-xs text-muted-foreground mt-1">KYC Ref: {kycReference}</p>
                )}
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Recipient
                </h4>
                <p className="font-medium">{recipientName}</p>
                <p className="text-sm text-muted-foreground">{recipientCountry}</p>
              </div>
            </div>

            <Separator />

            {/* Breakdown */}
            <div>
              <h4 className="font-semibold mb-3">Transaction Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Exchange Rate</span>
                  <span className="font-mono">1 {sourceCurrency} = {exchangeRate.toFixed(6)} {destinationCurrency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transfer Amount</span>
                  <span>{sourceCurrency} {sourceAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Fee</span>
                  <span>{sourceCurrency} {fee.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total Paid</span>
                  <span className="text-primary">{sourceCurrency} {totalPaid.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Purpose & Compliance */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Purpose & Compliance
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Purpose</span>
                  <span className="capitalize">{purpose.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Purpose Code</span>
                  <span className="font-mono">{purposeCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono text-xs">{transactionId}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Estimated Delivery */}
            <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">Estimated Delivery</span>
              </div>
              <span className="font-semibold">{estimatedDelivery}</span>
            </div>

            {/* Compliance Note */}
            <div className="p-4 bg-muted/50 rounded-lg border border-primary/10">
              <div className="flex items-start gap-2">
                <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">RBI Compliance Note</p>
                  <p>
                    This transaction is processed under the Liberalised Remittance Scheme (LRS) 
                    as per RBI Master Direction on Remittance of Assets. Form A2 has been 
                    submitted to the Authorized Dealer on your behalf. This receipt serves 
                    as proof of transaction for tax and compliance purposes.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground pt-4 border-t">
              <p className="font-medium mb-1">RBP FINIVIS Private Limited</p>
              <p>CIN: U66000TG2024PTC000000 | FFMC License No: FL-XXX</p>
              <p>Registered Office: Hyderabad, Telangana</p>
            </div>

            {/* Action Buttons */}
            {(onDownload || onPrint) && (
              <div className="flex gap-3 pt-4">
                {onDownload && (
                  <Button variant="outline" className="flex-1" onClick={onDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                )}
                {onPrint && (
                  <Button variant="outline" className="flex-1" onClick={onPrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
);

RemittanceReceipt.displayName = "RemittanceReceipt";
