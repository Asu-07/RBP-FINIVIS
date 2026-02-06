import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Wallet, 
  Search, 
  Check, 
  X, 
  Clock,
  Loader2,
  Eye,
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface RefundRequest {
  id: string;
  user_id: string;
  requested_amount: number;
  bank_account_name: string;
  bank_account_number: string;
  bank_ifsc: string;
  bank_name: string | null;
  status: string;
  admin_notes: string | null;
  rejection_reason: string | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
}

interface BalanceEntry {
  id: string;
  user_id: string;
  entry_type: string;
  amount: number;
  reason: string;
  source_type: string | null;
  source_reference: string | null;
  description: string | null;
  created_at: string;
}

interface UserBalance {
  id: string;
  user_id: string;
  balance_amount: number;
  updated_at: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
}

const reasonLabels: Record<string, string> = {
  kyc_rejection: "KYC Rejection",
  compliance_rejection: "Compliance Rejection",
  transaction_cancellation: "Transaction Cancelled",
  partial_fulfillment: "Partial Fulfillment",
  failed_transaction: "Failed Transaction",
  used_for_service: "Used for Service",
  bank_refund: "Bank Refund",
};

export const RefundableBalanceAdmin = () => {
  const [activeTab, setActiveTab] = useState("requests");
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [userBalances, setUserBalances] = useState<UserBalance[]>([]);
  const [selectedUserEntries, setSelectedUserEntries] = useState<BalanceEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Dialog states
  const [showEntriesDialog, setShowEntriesDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch refund requests
      const { data: requests, error: requestsError } = await supabase
        .from("refund_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (requestsError) throw requestsError;

      // Fetch profiles for each request
      const requestsWithProfiles = await Promise.all(
        (requests || []).map(async (request) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("user_id", request.user_id)
            .maybeSingle();
          return { ...request, profiles: profileData } as RefundRequest;
        })
      );
      setRefundRequests(requestsWithProfiles);

      // Fetch user balances
      const { data: balances, error: balancesError } = await supabase
        .from("refundable_balances")
        .select("*")
        .gt("balance_amount", 0)
        .order("updated_at", { ascending: false });

      if (balancesError) throw balancesError;

      // Fetch profiles for each balance
      const balancesWithProfiles = await Promise.all(
        (balances || []).map(async (balance) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("user_id", balance.user_id)
            .maybeSingle();
          return { ...balance, profiles: profileData } as UserBalance;
        })
      );
      setUserBalances(balancesWithProfiles);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserEntries = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("refundable_balance_entries")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSelectedUserEntries(data || []);
      setShowEntriesDialog(true);
    } catch (error) {
      console.error("Error fetching entries:", error);
      toast.error("Failed to load balance history");
    }
  };

  const handleApproveRequest = async (request: RefundRequest) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("refund_requests")
        .update({ 
          status: "approved",
          updated_at: new Date().toISOString()
        })
        .eq("id", request.id);

      if (error) throw error;
      toast.success("Refund request approved");
      fetchData();
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error("Failed to approve request");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessRefund = async (request: RefundRequest) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase.rpc("process_bank_refund", {
        _refund_request_id: request.id,
      });

      if (error) throw error;
      toast.success("Refund processed successfully");
      fetchData();
    } catch (error: any) {
      console.error("Error processing refund:", error);
      toast.error(error.message || "Failed to process refund");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("refund_requests")
        .update({ 
          status: "rejected",
          rejection_reason: rejectionReason,
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedRequest.id);

      if (error) throw error;
      toast.success("Refund request rejected");
      setShowRejectDialog(false);
      setRejectionReason("");
      setSelectedRequest(null);
      fetchData();
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredRequests = refundRequests.filter((request) => {
    const matchesSearch =
      request.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.bank_account_number.includes(searchQuery);
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "approved":
        return <Badge variant="default"><Check className="h-3 w-3 mr-1" /> Approved</Badge>;
      case "processed":
        return <Badge className="bg-accent text-accent-foreground"><Check className="h-3 w-3 mr-1" /> Processed</Badge>;
      case "rejected":
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Wallet className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-xl font-semibold">Refundable Balance Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage user refundable balances and bank refund requests
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="requests">
            Refund Requests
            {refundRequests.filter(r => r.status === "pending").length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {refundRequests.filter(r => r.status === "pending").length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="balances">User Balances</TabsTrigger>
        </TabsList>

        {/* Refund Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or account..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {["all", "pending", "approved", "processed", "rejected"].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Requests Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Bank Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested On</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No refund requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{request.profiles?.full_name || "N/A"}</p>
                            <p className="text-sm text-muted-foreground">{request.profiles?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          ₹{request.requested_amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{request.bank_name || "Bank"}</p>
                            <p className="text-muted-foreground">
                              {request.bank_account_name}
                            </p>
                            <p className="font-mono text-xs">
                              ••••{request.bank_account_number.slice(-4)} | {request.bank_ifsc}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(request.created_at), "dd MMM yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {request.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleApproveRequest(request)}
                                  disabled={isProcessing}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setShowRejectDialog(true);
                                  }}
                                  disabled={isProcessing}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {request.status === "approved" && (
                              <Button
                                size="sm"
                                onClick={() => handleProcessRefund(request)}
                                disabled={isProcessing}
                              >
                                {isProcessing ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Process Refund"
                                )}
                              </Button>
                            )}
                            {request.status === "rejected" && request.rejection_reason && (
                              <span className="text-xs text-destructive">
                                {request.rejection_reason}
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Balances Tab */}
        <TabsContent value="balances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Users with Refundable Balance</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : userBalances.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No users with refundable balance
                      </TableCell>
                    </TableRow>
                  ) : (
                    userBalances.map((balance) => (
                      <TableRow key={balance.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{balance.profiles?.full_name || "N/A"}</p>
                            <p className="text-sm text-muted-foreground">{balance.profiles?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-accent">
                          ₹{balance.balance_amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(balance.updated_at), "dd MMM yyyy, hh:mm a")}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fetchUserEntries(balance.user_id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View History
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Refund Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm">
                Rejecting this request will notify the user. Their balance will remain available for use.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Rejection Reason *</Label>
              <Textarea
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectRequest}
              disabled={isProcessing || !rejectionReason.trim()}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Entries Dialog */}
      <Dialog open={showEntriesDialog} onOpenChange={setShowEntriesDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Balance History</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {selectedUserEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-4 p-4 border rounded-lg"
              >
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
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {entry.entry_type === "credit" ? "Credit" : "Debit"}
                    </span>
                    <Badge variant="outline">
                      {reasonLabels[entry.reason] || entry.reason}
                    </Badge>
                  </div>
                  {entry.description && (
                    <p className="text-sm text-muted-foreground">{entry.description}</p>
                  )}
                  {entry.source_reference && (
                    <p className="text-xs text-muted-foreground">Ref: {entry.source_reference}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(entry.created_at), "dd MMM yyyy, hh:mm a")}
                  </p>
                </div>
                <div className={`font-semibold ${
                  entry.entry_type === "credit" ? "text-accent" : "text-destructive"
                }`}>
                  {entry.entry_type === "credit" ? "+" : "-"}₹{entry.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
