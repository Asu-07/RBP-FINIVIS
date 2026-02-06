import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Clock, 
  XCircle,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Download,
  Copy,
  Truck,
  Home
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { generateReceipt } from "@/utils/generateReceipt";

interface TransactionStatusCardProps {
  referenceNumber: string;
  type: "send" | "exchange" | "remittance";
  status: "pending" | "processing" | "dispatched" | "completed" | "rejected" | "cancelled";
  sourceAmount: number;
  sourceCurrency: string;
  destinationAmount: number;
  destinationCurrency: string;
  exchangeRate?: number;
  feeAmount?: number;
  timestamp: string;
  beneficiaryName?: string;
  rejectionReason?: string;
}

const currencySymbols: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "د.إ",
  SGD: "S$",
  AUD: "A$",
  CAD: "C$",
  CHF: "CHF",
  JPY: "¥",
};

const statusConfig: Record<string, { color: string; icon: typeof Clock; label: string }> = {
  pending: {
    color: "bg-yellow-500",
    icon: Clock,
    label: "Awaiting Payment",
  },
  processing: {
    color: "bg-blue-500",
    icon: RefreshCw,
    label: "Processing",
  },
  dispatched: {
    color: "bg-purple-500",
    icon: Truck,
    label: "Dispatched",
  },
  completed: {
    color: "bg-green-500",
    icon: Home,
    label: "Delivered",
  },
  rejected: {
    color: "bg-red-500",
    icon: XCircle,
    label: "Rejected",
  },
  cancelled: {
    color: "bg-gray-500",
    icon: XCircle,
    label: "Cancelled",
  },
};

const typeLabels: Record<string, { label: string; icon: typeof ArrowUpRight }> = {
  send: { label: "Sent", icon: ArrowUpRight },
  exchange: { label: "Exchanged", icon: RefreshCw },
  remittance: { label: "Remittance", icon: ArrowUpRight },
};

export const TransactionStatusCard = ({
  referenceNumber,
  type,
  status,
  sourceAmount,
  sourceCurrency,
  destinationAmount,
  destinationCurrency,
  exchangeRate,
  feeAmount,
  timestamp,
  beneficiaryName,
  rejectionReason,
}: TransactionStatusCardProps) => {
  const config = statusConfig[status];
  const typeConfig = typeLabels[type] || typeLabels.send;
  const StatusIcon = config.icon;
  const TypeIcon = typeConfig.icon;

  const handleCopyRef = () => {
    navigator.clipboard.writeText(referenceNumber);
    toast.success("Reference copied to clipboard");
  };

  const getSymbol = (currency: string) => currencySymbols[currency] || currency;

  return (
    <div className="p-4 bg-card rounded-lg border hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
            type === "send" || type === "remittance"
              ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30" 
              : "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
          }`}>
            <TypeIcon className="h-4 w-4" />
          </div>
          <div>
            <span className="font-medium text-sm">{typeConfig.label}</span>
            {beneficiaryName && (
              <p className="text-xs text-muted-foreground">to {beneficiaryName}</p>
            )}
          </div>
        </div>
        <Badge className={`${config.color} gap-1`}>
          <StatusIcon className="h-3 w-3" />
          {config.label}
        </Badge>
      </div>

      {/* Amount Display */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-xs text-muted-foreground">Sent</span>
          <p className="font-semibold">
            {getSymbol(sourceCurrency)}{sourceAmount.toLocaleString()}
          </p>
        </div>
        {sourceCurrency !== destinationCurrency && (
          <>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
            <div className="text-right">
              <span className="text-xs text-muted-foreground">Received</span>
              <p className="font-semibold text-green-600 dark:text-green-400">
                {getSymbol(destinationCurrency)}{destinationAmount.toLocaleString()}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Details */}
      <div className="space-y-1 text-xs text-muted-foreground border-t pt-3">
        <div className="flex justify-between">
          <span>Reference</span>
          <button 
            onClick={handleCopyRef}
            className="flex items-center gap-1 font-mono hover:text-foreground transition-colors"
          >
            {referenceNumber}
            <Copy className="h-3 w-3" />
          </button>
        </div>
        {exchangeRate && (
          <div className="flex justify-between">
            <span>Rate</span>
            <span>1 {sourceCurrency} = {exchangeRate.toFixed(4)} {destinationCurrency}</span>
          </div>
        )}
        {feeAmount !== undefined && feeAmount > 0 && (
          <div className="flex justify-between">
            <span>Fee</span>
            <span>{getSymbol(sourceCurrency)}{feeAmount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Date</span>
          <span>{format(new Date(timestamp), "MMM d, yyyy 'at' h:mm a")}</span>
        </div>
      </div>

      {/* Rejection Reason */}
      {status === "rejected" && rejectionReason && (
        <div className="mt-3 p-2 bg-destructive/10 rounded text-xs text-destructive">
          <strong>Reason:</strong> {rejectionReason}
        </div>
      )}

      {/* Actions */}
      {status === "completed" && (
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-3 gap-2"
          onClick={() => {
            generateReceipt({
              referenceNumber,
              type,
              status,
              sourceAmount,
              sourceCurrency,
              destinationAmount,
              destinationCurrency,
              exchangeRate,
              feeAmount,
              timestamp,
              beneficiaryName,
            });
            toast.success("Receipt downloaded successfully");
          }}
        >
          <Download className="h-4 w-4" />
          Download Receipt
        </Button>
      )}
    </div>
  );
};
