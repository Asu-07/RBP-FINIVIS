import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  ArrowRight, 
  Building2, 
  Ticket, 
  Info,
  AlertCircle,
  History,
} from "lucide-react";
import { useRefundableBalance } from "@/hooks/useRefundableBalance";
import { BankRefundRequestForm } from "./BankRefundRequestForm";
import { RefundableBalanceHistory } from "./RefundableBalanceHistory";
import { UseBalanceModal } from "./UseBalanceModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const RefundableBalanceCard = () => {
  const { balanceAmount, entries, refundRequests, isLoading } = useRefundableBalance();
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showUseBalanceModal, setShowUseBalanceModal] = useState(false);

  // Get pending refund requests
  const pendingRefundAmount = refundRequests
    .filter(r => r.status === "pending" || r.status === "approved")
    .reduce((sum, r) => sum + r.requested_amount, 0);

  const availableBalance = balanceAmount - pendingRefundAmount;

  if (isLoading) {
    return (
      <Card className="border-2">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="h-10 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't show card if no balance
  if (balanceAmount === 0 && entries.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-background">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-accent" />
              </div>
              <div>
                <CardTitle className="text-lg">Refundable Balance</CardTitle>
                <CardDescription className="text-xs">
                  Available for services or bank refund
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(true)}
              className="text-muted-foreground"
            >
              <History className="h-4 w-4 mr-1" />
              History
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Balance Display */}
          <div className="bg-background rounded-xl p-4 border">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Available Balance</span>
              {pendingRefundAmount > 0 && (
                <Badge variant="outline" className="text-xs">
                  ₹{pendingRefundAmount.toLocaleString()} pending refund
                </Badge>
              )}
            </div>
            <p className="text-3xl font-bold text-accent mt-1">
              ₹{availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Refundable balance is not a wallet or payment instrument. It is a temporary credit for failed or cancelled transactions and is refundable on request.
            </p>
          </div>

          {/* Action Buttons */}
          {availableBalance > 0 && (
            <div className="grid gap-3">
              {/* Primary Option: Use for new transaction */}
              <Button 
                className="w-full h-12 justify-between"
                onClick={() => setShowUseBalanceModal(true)}
              >
                <span className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  Use balance for a new transaction
                </span>
                <Badge variant="secondary" className="bg-white/20">
                  Recommended
                </Badge>
              </Button>

              {/* Secondary Options */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-12"
                  onClick={() => setShowRefundForm(true)}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Request bank refund
                </Button>
                <Button
                  variant="outline"
                  className="h-12"
                  disabled
                >
                  <Ticket className="h-4 w-4 mr-2" />
                  Get service voucher
                </Button>
              </div>
            </div>
          )}

          {/* Show pending refund requests */}
          {refundRequests.filter(r => r.status !== "processed").length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Pending Refund Requests
              </p>
              {refundRequests
                .filter(r => r.status !== "processed")
                .slice(0, 2)
                .map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm"
                  >
                    <div>
                      <p className="font-medium">
                        ₹{request.requested_amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        To: {request.bank_name || "Bank Account"} ••••{request.bank_account_number.slice(-4)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        request.status === "rejected" ? "destructive" :
                        request.status === "approved" ? "default" : "secondary"
                      }
                    >
                      {request.status}
                    </Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bank Refund Form Dialog */}
      <Dialog open={showRefundForm} onOpenChange={setShowRefundForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Bank Refund</DialogTitle>
          </DialogHeader>
          <BankRefundRequestForm 
            availableBalance={availableBalance}
            onSuccess={() => setShowRefundForm(false)}
            onCancel={() => setShowRefundForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Balance History</DialogTitle>
          </DialogHeader>
          <RefundableBalanceHistory />
        </DialogContent>
      </Dialog>

      {/* Use Balance Modal */}
      <UseBalanceModal 
        open={showUseBalanceModal}
        onOpenChange={setShowUseBalanceModal}
        availableBalance={availableBalance}
      />
    </>
  );
};
