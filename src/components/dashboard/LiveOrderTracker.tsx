import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  ShoppingCart,
  CreditCard,
  Truck,
  Home,
  AlertCircle,
  ArrowRight,
  Bell,
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
  purpose: string | null;
  compliance_notes: string | null;
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

// Currency Exchange - Physical delivery tracking
const currencyExchangeSteps = [
  {
    key: "booked",
    label: "Order Booked",
    icon: ShoppingCart,
    description: "Your currency order has been placed"
  },
  {
    key: "payment",
    label: "Payment",
    icon: CreditCard,
    description: "Awaiting payment confirmation"
  },
  {
    key: "procurement",
    label: "Procurement",
    icon: Package,
    description: "Arranging your currency"
  },
  {
    key: "dispatch",
    label: "Dispatched",
    icon: Truck,
    description: "Currency is on the way"
  },
  {
    key: "delivered",
    label: "Delivered",
    icon: Home,
    description: "Currency delivered successfully"
  },
];

// Remittance / Send Money - Transfer tracking
const remittanceSteps = [
  {
    key: "booked",
    label: "Initiated",
    icon: ShoppingCart,
    description: "Transfer request submitted"
  },
  {
    key: "payment",
    label: "Payment Received",
    icon: CreditCard,
    description: "Payment confirmed"
  },
  {
    key: "processing",
    label: "Processing",
    icon: Package,
    description: "Transfer being processed"
  },
  {
    key: "completed",
    label: "Credited",
    icon: CheckCircle,
    description: "Funds credited to beneficiary"
  },
];

// Get steps based on transaction type
const getStepsForType = (type: string) => {
  switch (type) {
    case "exchange":
      return currencyExchangeSteps;
    case "send":
    case "remittance":
    default:
      return remittanceSteps;
  }
};

// Map transaction status to step index based on type
const getStepFromStatus = (status: string, type: string): number => {
  if (type === "exchange") {
    switch (status) {
      case "pending": return 1;
      case "processing": return 2;
      case "dispatched": return 3;
      case "completed": return 4;
      case "rejected":
      case "failed":
      case "cancelled": return -1;
      default: return 0;
    }
  } else {
    // Remittance
    switch (status) {
      case "pending": return 1;
      case "processing": return 2;
      case "completed": return 3;
      case "rejected":
      case "failed":
      case "cancelled": return -1;
      default: return 0;
    }
  }
};

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Awaiting Payment", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  processing: { label: "Processing", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  dispatched: { label: "Dispatched", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  completed: { label: "Delivered", color: "bg-green-500/10 text-green-600 border-green-500/20" },
  rejected: { label: "Rejected", color: "bg-red-500/10 text-red-600 border-red-500/20" },
  failed: { label: "Failed", color: "bg-red-500/10 text-red-600 border-red-500/20" },
  cancelled: { label: "Cancelled", color: "bg-muted text-muted-foreground" },
};

interface LiveOrderTrackerProps {
  limit?: number;
}

export const LiveOrderTracker = ({ limit = 5 }: LiveOrderTrackerProps) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedIds, setUpdatedIds] = useState<Set<string>>(new Set());

  const fetchTransactions = async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["pending", "processing", "dispatched"])
      .order("created_at", { ascending: false })
      .limit(limit);

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
      .channel("live-order-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (import.meta.env.DEV) console.log("Real-time transaction update:", payload);

          // Highlight the updated transaction
          if (payload.new && (payload.new as Transaction).id) {
            setUpdatedIds((prev) => new Set(prev).add((payload.new as Transaction).id));

            // Remove highlight after animation
            setTimeout(() => {
              setUpdatedIds((prev) => {
                const next = new Set(prev);
                next.delete((payload.new as Transaction).id);
                return next;
              });
            }, 3000);
          }

          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case "exchange": return "Currency Exchange";
      case "send": return "Money Transfer";
      case "remittance": return "International Remittance";
      default: return "Transaction";
    }
  };

  const getProgressPercentage = (status: string, type: string) => {
    const steps = getStepsForType(type);
    const step = getStepFromStatus(status, type);
    if (step === -1) return 0;
    return ((step + 1) / steps.length) * 100;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="font-semibold text-lg mb-1">All Orders Complete</h3>
          <p className="text-muted-foreground text-sm">
            You don't have any active orders at the moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Live Order Tracking</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchTransactions}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Real-time updates on your active orders
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <AnimatePresence mode="popLayout">
          {transactions.map((tx) => {
            const steps = getStepsForType(tx.transaction_type);
            const currentStep = getStepFromStatus(tx.status, tx.transaction_type);
            const isError = currentStep === -1;
            const isUpdated = updatedIds.has(tx.id);

            return (
              <motion.div
                key={tx.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: isUpdated ? [1, 1.02, 1] : 1,
                  boxShadow: isUpdated
                    ? ["0 0 0 0 hsl(var(--primary)/0)", "0 0 0 4px hsl(var(--primary)/0.3)", "0 0 0 0 hsl(var(--primary)/0)"]
                    : "none"
                }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`
                  p-4 rounded-xl border bg-card
                  ${isUpdated ? "ring-2 ring-primary ring-offset-2" : ""}
                  ${isError ? "border-destructive/30 bg-destructive/5" : ""}
                `}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{getTransactionTypeLabel(tx.transaction_type)}</span>
                      {isUpdated && (
                        <Badge variant="default" className="text-xs animate-pulse">
                          Updated
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      Ref: {tx.reference_number || tx.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <Badge variant="outline" className={statusConfig[tx.status]?.color || ""}>
                    {statusConfig[tx.status]?.label || tx.status}
                  </Badge>
                </div>

                {/* Amount Display */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">You Send</p>
                    <p className="font-semibold">
                      {currencySymbols[tx.source_currency] || tx.source_currency}
                      {tx.source_amount.toLocaleString()}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Recipient Gets</p>
                    <p className="font-semibold text-primary">
                      {currencySymbols[tx.destination_currency] || tx.destination_currency}
                      {tx.destination_amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                {!isError && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                      <span>Order Progress</span>
                      <span>{Math.round(getProgressPercentage(tx.status, tx.transaction_type))}%</span>
                    </div>
                    <Progress
                      value={getProgressPercentage(tx.status, tx.transaction_type)}
                      className="h-2"
                    />
                  </div>
                )}

                {/* Step Timeline */}
                <div className="relative">
                  <div className="flex justify-between">
                    {steps.map((step, index) => {
                      const isCompleted = !isError && index <= currentStep;
                      const isCurrent = !isError && index === currentStep;
                      const StepIcon = step.icon;

                      return (
                        <div
                          key={step.key}
                          className="flex flex-col items-center relative"
                          style={{ flex: 1 }}
                        >
                          {/* Connector Line */}
                          {index < steps.length - 1 && (
                            <div
                              className={`
                                absolute top-4 left-1/2 h-0.5 w-full
                                ${index < currentStep ? "bg-primary" : "bg-muted"}
                              `}
                            />
                          )}

                          {/* Step Icon */}
                          <motion.div
                            className={`
                              relative z-10 h-8 w-8 rounded-full flex items-center justify-center
                              ${isCompleted
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                              }
                              ${isCurrent ? "ring-4 ring-primary/20" : ""}
                            `}
                            animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 2 }}
                          >
                            {isCurrent && tx.status === "processing" ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isCompleted ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <StepIcon className="h-4 w-4" />
                            )}
                          </motion.div>

                          {/* Step Label */}
                          <span className={`
                            text-[10px] mt-1 text-center whitespace-nowrap
                            ${isCompleted ? "text-foreground font-medium" : "text-muted-foreground"}
                          `}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Error/Rejection Message */}
                {isError && tx.compliance_notes && (
                  <div className="mt-4 flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                    <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{tx.compliance_notes}</span>
                  </div>
                )}

                {/* Notes */}
                {tx.notes && !isError && (
                  <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                    <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>{tx.notes}</span>
                  </div>
                )}

                {/* Timestamp */}
                <p className="text-xs text-muted-foreground mt-3">
                  Started {new Date(tx.created_at).toLocaleDateString()} at{" "}
                  {new Date(tx.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
