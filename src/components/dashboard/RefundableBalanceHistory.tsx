import { Badge } from "@/components/ui/badge";
import { 
  ArrowDownCircle, 
  ArrowUpCircle,
  Calendar,
  FileText,
} from "lucide-react";
import { useRefundableBalance } from "@/hooks/useRefundableBalance";
import { format } from "date-fns";

const reasonLabels: Record<string, string> = {
  kyc_rejection: "KYC Rejection",
  compliance_rejection: "Compliance Rejection",
  transaction_cancellation: "Transaction Cancelled",
  partial_fulfillment: "Partial Fulfillment",
  failed_transaction: "Failed Transaction",
  used_for_service: "Used for Service",
  bank_refund: "Bank Refund",
};

export const RefundableBalanceHistory = () => {
  const { entries, balanceAmount, isLoading } = useRefundableBalance();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex gap-4 p-4 border rounded-lg">
            <div className="h-10 w-10 bg-muted rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
            <div className="h-6 bg-muted rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No balance history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Balance Summary */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">Current Balance</p>
        <p className="text-2xl font-bold">
          ₹{balanceAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* Entry List */}
      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors"
          >
            {/* Icon */}
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
              entry.entry_type === "credit" 
                ? "bg-accent/10" 
                : "bg-destructive/10"
            }`}>
              {entry.entry_type === "credit" ? (
                <ArrowDownCircle className="h-5 w-5 text-accent" />
              ) : (
                <ArrowUpCircle className="h-5 w-5 text-destructive" />
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium">
                  {entry.entry_type === "credit" ? "Credit" : "Debit"}
                </p>
                <Badge variant="outline" className="text-xs">
                  {reasonLabels[entry.reason] || entry.reason}
                </Badge>
              </div>
              
              {entry.description && (
                <p className="text-sm text-muted-foreground truncate">
                  {entry.description}
                </p>
              )}
              
              {entry.source_reference && (
                <p className="text-xs text-muted-foreground mt-1">
                  Ref: {entry.source_reference}
                </p>
              )}
              
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                <Calendar className="h-3 w-3" />
                {format(new Date(entry.created_at), "dd MMM yyyy, hh:mm a")}
              </div>
            </div>

            {/* Amount */}
            <div className={`text-right font-semibold ${
              entry.entry_type === "credit" 
                ? "text-accent" 
                : "text-destructive"
            }`}>
              {entry.entry_type === "credit" ? "+" : "-"}
              ₹{entry.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
