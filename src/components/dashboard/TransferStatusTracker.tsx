import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
} from "lucide-react";

interface Transaction {
  id: string;
  reference_number: string | null;
  transaction_type: string;
  source_currency: string;
  source_amount: number;
  destination_currency: string;
  destination_amount: number;
  exchange_rate: number | null;
  fee_amount: number | null;
  status: string;
  created_at: string;
  completed_at: string | null;
  notes: string | null;
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

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: {
    label: "Pending",
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    icon: Clock,
  },
  processing: {
    label: "Processing",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    icon: Loader2,
  },
  completed: {
    label: "Completed",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    icon: CheckCircle,
  },
  failed: {
    label: "Failed",
    color: "bg-red-500/10 text-red-600 border-red-500/20",
    icon: XCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-muted text-muted-foreground",
    icon: XCircle,
  },
};

interface TransferStatusTrackerProps {
  limit?: number;
  showOnlyActive?: boolean;
}

export const TransferStatusTracker = ({ limit = 5, showOnlyActive = true }: TransferStatusTrackerProps) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    if (!user) return;
    setLoading(true);

    let query = supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (showOnlyActive) {
      query = query.in("status", ["pending", "processing"]);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching transactions:", error);
    } else {
      setTransactions(data as Transaction[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  // Real-time subscription for transaction status updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("transaction-status-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (import.meta.env.DEV) console.log("Transaction update:", payload);
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    const isProcessing = status === "processing";

    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1.5`}>
        <Icon className={`h-3.5 w-3.5 ${isProcessing ? "animate-spin" : ""}`} />
        {config.label}
      </Badge>
    );
  };

  const getTransactionIcon = (type: string) => {
    if (type === "send") {
      return <ArrowUpRight className="h-4 w-4 text-destructive" />;
    }
    return <ArrowDownLeft className="h-4 w-4 text-success" />;
  };

  const getTimelineSteps = (status: string) => {
    const steps = [
      { key: "initiated", label: "Initiated", completed: true },
      { key: "pending", label: "Pending Review", completed: ["pending", "processing", "completed"].includes(status) },
      { key: "processing", label: "Processing", completed: ["processing", "completed"].includes(status) },
      { key: "completed", label: "Completed", completed: status === "completed" },
    ];

    if (status === "failed" || status === "cancelled") {
      steps.push({ key: status, label: status === "failed" ? "Failed" : "Cancelled", completed: true });
    }

    return steps;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Active Transfers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50 text-success" />
            <p className="font-medium">No pending transfers</p>
            <p className="text-sm">All your transfers have been completed</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Active Transfers
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={fetchTransactions}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  {getTransactionIcon(tx.transaction_type)}
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {tx.transaction_type === "send" ? "Send Money" : "Deposit"}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {tx.reference_number || tx.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>
              {getStatusBadge(tx.status)}
            </div>

            {/* Amount */}
            <div className="flex items-center justify-between mb-4 px-2">
              <div>
                <p className="text-xs text-muted-foreground">Sent</p>
                <p className="font-semibold">
                  {currencySymbols[tx.source_currency] || ""}
                  {tx.source_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Recipient Gets</p>
                <p className="font-semibold text-accent">
                  {currencySymbols[tx.destination_currency] || ""}
                  {tx.destination_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-4 pt-3 border-t">
              <div className="flex items-center justify-between">
                {getTimelineSteps(tx.status).slice(0, 4).map((step, index) => (
                  <div key={step.key} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-3 w-3 rounded-full ${step.completed
                            ? tx.status === "failed" && index === 3
                              ? "bg-destructive"
                              : "bg-accent"
                            : "bg-muted"
                          }`}
                      />
                      <span className={`text-[10px] mt-1 ${step.completed ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </span>
                    </div>
                    {index < 3 && (
                      <div
                        className={`h-0.5 w-8 sm:w-12 mx-1 ${step.completed && getTimelineSteps(tx.status)[index + 1]?.completed
                            ? "bg-accent"
                            : "bg-muted"
                          }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {tx.notes && (
              <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{tx.notes}</span>
              </div>
            )}

            {/* Time */}
            <p className="text-xs text-muted-foreground mt-3">
              Started {new Date(tx.created_at).toLocaleDateString()} at{" "}
              {new Date(tx.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
