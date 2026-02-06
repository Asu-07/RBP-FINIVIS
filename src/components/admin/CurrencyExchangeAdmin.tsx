import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DocumentViewer } from "./DocumentViewer";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Loader2,
  Truck,
  Package,
  Phone,
  User,
  Calendar,
  Banknote,
  RefreshCw,
  FileText,
  AlertTriangle,
  Shield,
  Download,
  ExternalLink,
  FileCheck,
  FileX,
  Globe,
  Plane,
  CreditCard,
} from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

interface UploadedDocument {
  type: string;
  path: string;
  uploadedAt: string;
}

interface CurrencyExchangeOrder {
  id: string;
  user_id: string;
  order_number: string | null;
  city: string;
  from_currency: string;
  to_currency: string;
  amount: number;
  converted_amount: number;
  exchange_rate: number;
  service_fee: number;
  total_amount: number;
  advance_amount: number;
  advance_paid: boolean | null;
  advance_paid_at: string | null;
  advance_payment_method: string | null;
  advance_reference: string | null;
  balance_amount: number;
  balance_paid: boolean | null;
  balance_paid_at: string | null;
  balance_payment_method: string | null;
  balance_reference: string | null;
  payee_name: string | null;
  payee_address: string | null;
  payee_phone: string | null;
  delivery_address: string | null;
  delivery_date: string | null;
  delivery_time_slot: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  delivered_at: string | null;
  profile?: Profile | null;
  // New compliance fields
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  pan_number: string | null;
  destination_country: string | null;
  travel_start_date: string | null;
  travel_end_date: string | null;
  return_date_not_finalized: boolean | null;
  purpose: string | null;
  nationality: string | null;
  documents: unknown;
  lrs_declaration_accepted: boolean | null;
  lrs_declaration_timestamp: string | null;
  usd_equivalent: number | null;
  document_verification_status: string | null;
  document_verification_notes: string | null;
  document_verified_at: string | null;
  document_verified_by: string | null;
}

export function CurrencyExchangeAdmin() {
  const [orders, setOrders] = useState<CurrencyExchangeOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<CurrencyExchangeOrder | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("currency_exchange_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } else {
      // Fetch profiles for each order
      const ordersWithProfiles = await Promise.all(
        (data || []).map(async (order) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", order.user_id)
            .maybeSingle();
          return { ...order, profile: profileData };
        })
      );
      setOrders(ordersWithProfiles);
    }
    setLoading(false);
  };

  const openOrderDetails = (order: CurrencyExchangeOrder) => {
    setSelectedOrder(order);
    setAdminNotes(order.notes || "");
    setDetailsDialogOpen(true);
  };

  const confirmAdvancePayment = async (orderId: string) => {
    setUpdating(true);
    const { error } = await supabase
      .from("currency_exchange_orders")
      .update({
        advance_paid: true,
        advance_paid_at: new Date().toISOString(),
        status: "advance_paid",
      })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to confirm advance payment");
    } else {
      toast.success("Advance payment confirmed");
      fetchOrders();

      // Send notification
      const order = orders.find(o => o.id === orderId);
      if (order?.profile?.email) {
        supabase.functions.invoke("send-notification-email", {
          body: {
            type: "exchange_advance_confirmed",
            email: order.profile.email,
            name: order.profile.full_name || "Customer",
            orderNumber: order.order_number,
          },
        }).catch(console.error);
      }
    }
    setUpdating(false);
  };

  const confirmBalancePayment = async (orderId: string) => {
    setUpdating(true);
    const { error } = await supabase
      .from("currency_exchange_orders")
      .update({
        balance_paid: true,
        balance_paid_at: new Date().toISOString(),
        status: "balance_paid",
      })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to confirm balance payment");
    } else {
      toast.success("Balance payment confirmed");
      fetchOrders();

      const order = orders.find(o => o.id === orderId);
      if (order?.profile?.email) {
        supabase.functions.invoke("send-notification-email", {
          body: {
            type: "exchange_balance_confirmed",
            email: order.profile.email,
            name: order.profile.full_name || "Customer",
            orderNumber: order.order_number,
          },
        }).catch(console.error);
      }
    }
    setUpdating(false);
  };

  const markAsScheduled = async (orderId: string) => {
    setUpdating(true);
    const { error } = await supabase
      .from("currency_exchange_orders")
      .update({ status: "scheduled" })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Order marked as scheduled for delivery");
      fetchOrders();
    }
    setUpdating(false);
  };

  const markAsOutForDelivery = async (orderId: string) => {
    setUpdating(true);
    const { error } = await supabase
      .from("currency_exchange_orders")
      .update({ status: "out_for_delivery" })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Order marked as out for delivery");
      fetchOrders();

      const order = orders.find(o => o.id === orderId);
      if (order?.profile?.email) {
        supabase.functions.invoke("send-notification-email", {
          body: {
            type: "exchange_out_for_delivery",
            email: order.profile.email,
            name: order.profile.full_name || "Customer",
            orderNumber: order.order_number,
          },
        }).catch(console.error);
      }
    }
    setUpdating(false);
  };

  const markAsDelivered = async (orderId: string) => {
    setUpdating(true);
    const { error } = await supabase
      .from("currency_exchange_orders")
      .update({
        status: "delivered",
        delivered_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to mark as delivered");
    } else {
      toast.success("Order marked as delivered");
      fetchOrders();
      setDetailsDialogOpen(false);

      const order = orders.find(o => o.id === orderId);
      if (order?.profile?.email) {
        supabase.functions.invoke("send-notification-email", {
          body: {
            type: "exchange_delivered",
            email: order.profile.email,
            name: order.profile.full_name || "Customer",
            orderNumber: order.order_number,
            amount: order.converted_amount,
            currency: order.to_currency,
          },
        }).catch(console.error);
      }
    }
    setUpdating(false);
  };

  const cancelOrder = async (orderId: string) => {
    setUpdating(true);
    const { error } = await supabase
      .from("currency_exchange_orders")
      .update({ status: "cancelled" })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to cancel order");
    } else {
      toast.success("Order cancelled");
      fetchOrders();
      setDetailsDialogOpen(false);
    }
    setUpdating(false);
  };

  const saveNotes = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    const { error } = await supabase
      .from("currency_exchange_orders")
      .update({ notes: adminNotes })
      .eq("id", selectedOrder.id);

    if (error) {
      toast.error("Failed to save notes");
    } else {
      toast.success("Notes saved");
      fetchOrders();
    }
    setUpdating(false);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { className: string; label: string; icon: React.ReactNode }> = {
      draft: { className: "bg-muted", label: "Draft", icon: <Clock className="h-3 w-3" /> },
      pending_documents: { className: "bg-amber-500", label: "Pending Docs", icon: <FileText className="h-3 w-3" /> },
      documents_submitted: { className: "bg-blue-400", label: "Docs Submitted", icon: <FileCheck className="h-3 w-3" /> },
      documents_verified: { className: "bg-emerald-500", label: "Docs Verified", icon: <Shield className="h-3 w-3" /> },
      documents_rejected: { className: "bg-red-500", label: "Docs Rejected", icon: <FileX className="h-3 w-3" /> },
      advance_paid: { className: "bg-yellow-500", label: "Advance Paid", icon: <Banknote className="h-3 w-3" /> },
      balance_paid: { className: "bg-blue-500", label: "Fully Paid", icon: <CheckCircle className="h-3 w-3" /> },
      scheduled: { className: "bg-purple-500", label: "Scheduled", icon: <Calendar className="h-3 w-3" /> },
      out_for_delivery: { className: "bg-orange-500", label: "Out for Delivery", icon: <Truck className="h-3 w-3" /> },
      delivered: { className: "bg-success", label: "Delivered", icon: <Package className="h-3 w-3" /> },
      cancelled: { className: "bg-destructive", label: "Cancelled", icon: <XCircle className="h-3 w-3" /> },
    };
    const config = statusConfig[status] || { className: "bg-muted", label: status, icon: null };
    return (
      <Badge className={config.className}>
        {config.icon}
        <span className="ml-1">{config.label}</span>
      </Badge>
    );
  };

  const getDocVerificationBadge = (status: string | null) => {
    const statusConfig: Record<string, { className: string; label: string; icon: React.ReactNode }> = {
      pending: { className: "bg-amber-500", label: "Pending", icon: <Clock className="h-3 w-3" /> },
      verified: { className: "bg-success", label: "Verified", icon: <CheckCircle className="h-3 w-3" /> },
      rejected: { className: "bg-destructive", label: "Rejected", icon: <XCircle className="h-3 w-3" /> },
      incomplete: { className: "bg-orange-500", label: "Incomplete", icon: <AlertTriangle className="h-3 w-3" /> },
    };
    const config = statusConfig[status || "pending"] || statusConfig.pending;
    return (
      <Badge className={config.className}>
        {config.icon}
        <span className="ml-1">{config.label}</span>
      </Badge>
    );
  };

  const verifyDocuments = async (orderId: string, status: "verified" | "rejected" | "incomplete", notes?: string) => {
    setUpdating(true);
    const { error } = await supabase
      .from("currency_exchange_orders")
      .update({
        document_verification_status: status,
        document_verification_notes: notes || null,
        document_verified_at: new Date().toISOString(),
        status: status === "verified" ? "documents_verified" : status === "rejected" ? "documents_rejected" : selectedOrder?.status,
      })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to update document verification");
    } else {
      toast.success(`Documents marked as ${status}`);
      fetchOrders();

      const order = orders.find(o => o.id === orderId);
      if (order?.profile?.email) {
        supabase.functions.invoke("send-notification-email", {
          body: {
            type: `documents_${status}`,
            email: order.profile.email,
            name: order.profile.full_name || "Customer",
            orderNumber: order.order_number,
            notes: notes,
          },
        }).catch(console.error);
      }
    }
    setUpdating(false);
  };

  const [docVerificationNotes, setDocVerificationNotes] = useState("");

  const filteredOrders = orders.filter((order) => {
    return statusFilter === "all" || order.status === statusFilter;
  });

  // Stats
  const pendingAdvance = orders.filter(o => o.status === "draft" && o.advance_paid !== true).length;
  const pendingDocVerification = orders.filter(o => o.document_verification_status === "pending" && o.documents && (o.documents as UploadedDocument[]).length > 0).length;
  const awaitingBalance = orders.filter(o => o.status === "advance_paid" && o.balance_paid !== true).length;
  const readyForDelivery = orders.filter(o => o.status === "balance_paid" || o.status === "scheduled").length;
  const outForDelivery = orders.filter(o => o.status === "out_for_delivery").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className={pendingDocVerification > 0 ? "border-amber-500/50 bg-amber-500/5" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending Docs</p>
                <p className="text-xl font-bold">{pendingDocVerification}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={pendingAdvance > 0 ? "border-yellow-500/50 bg-yellow-500/5" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending Advance</p>
                <p className="text-xl font-bold">{pendingAdvance}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={awaitingBalance > 0 ? "border-blue-500/50 bg-blue-500/5" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Banknote className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Awaiting Balance</p>
                <p className="text-xl font-bold">{awaitingBalance}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={readyForDelivery > 0 ? "border-purple-500/50 bg-purple-500/5" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ready for Delivery</p>
                <p className="text-xl font-bold">{readyForDelivery}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={outForDelivery > 0 ? "border-orange-500/50 bg-orange-500/5" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Truck className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Out for Delivery</p>
                <p className="text-xl font-bold">{outForDelivery}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Currency Exchange Orders
              </CardTitle>
              <CardDescription>
                Manage advance payments, balance payments, and delivery status
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="advance_paid">Advance Paid</SelectItem>
                  <SelectItem value="balance_paid">Fully Paid</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={fetchOrders}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Docs</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} className={order.document_verification_status === "pending" && order.documents && (order.documents as UploadedDocument[]).length > 0 ? "bg-amber-50/50 dark:bg-amber-900/10" : ""}>
                  <TableCell className="font-mono text-xs">
                    {order.order_number || order.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.customer_name || order.profile?.full_name || order.payee_name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{order.customer_email || order.profile?.email}</p>
                      {order.pan_number && (
                        <p className="text-xs text-muted-foreground">PAN: {order.pan_number}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {order.purpose ? (
                        <Badge variant="outline" className="capitalize">{order.purpose}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                      {order.destination_country && (
                        <p className="text-xs text-muted-foreground mt-1">{order.destination_country}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="font-medium">{order.from_currency}</span>
                      <span className="text-muted-foreground"> → </span>
                      <span className="font-medium">{order.to_currency}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {order.to_currency} {order.converted_amount.toLocaleString()}
                      </p>
                      {order.usd_equivalent && order.usd_equivalent > 0 && (
                        <p className="text-xs text-muted-foreground">
                          ~USD {order.usd_equivalent.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {getDocVerificationBadge(order.document_verification_status)}
                      {order.documents && (order.documents as UploadedDocument[]).length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {(order.documents as UploadedDocument[]).length} files
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-sm">
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openOrderDetails(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {order.status === "advance_paid" && !order.balance_paid && (
                        <Button
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600"
                          onClick={() => confirmBalancePayment(order.id)}
                          disabled={updating}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Confirm Balance
                        </Button>
                      )}
                      {(order.status === "balance_paid" || order.status === "scheduled") && (
                        <Button
                          size="sm"
                          className="bg-orange-500 hover:bg-orange-600"
                          onClick={() => markAsOutForDelivery(order.id)}
                          disabled={updating}
                        >
                          <Truck className="h-4 w-4 mr-1" />
                          Out for Delivery
                        </Button>
                      )}
                      {order.status === "out_for_delivery" && (
                        <Button
                          size="sm"
                          className="bg-success hover:bg-success/90"
                          onClick={() => markAsDelivered(order.id)}
                          disabled={updating}
                        >
                          <Package className="h-4 w-4 mr-1" />
                          Delivered
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No currency exchange orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Details - {selectedOrder?.order_number}
            </DialogTitle>
            <DialogDescription>
              Review order details and manage delivery
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Order Details</TabsTrigger>
                <TabsTrigger value="customer">Customer & Travel</TabsTrigger>
                <TabsTrigger value="documents" className="relative">
                  Documents
                  {selectedOrder.document_verification_status === "pending" && selectedOrder.documents && (selectedOrder.documents as UploadedDocument[]).length > 0 && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-amber-500 rounded-full animate-pulse" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="payments">Payments & Delivery</TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4 mt-4">
                {/* Order Status */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Status</p>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Order Date</p>
                    <p className="font-medium">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                  </div>
                </div>

                {/* Exchange Details */}
                <div className="p-4 border rounded-lg">
                  <p className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Banknote className="h-4 w-4" /> Exchange Details
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Currency</p>
                      <p className="font-medium">{selectedOrder.from_currency} → {selectedOrder.to_currency}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Exchange Rate</p>
                      <p className="font-medium">₹{selectedOrder.exchange_rate.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">City</p>
                      <p className="font-medium">{selectedOrder.city}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Foreign Amount</p>
                      <p className="font-medium">{selectedOrder.to_currency} {selectedOrder.converted_amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">USD Equivalent</p>
                      <p className="font-medium">~USD {(selectedOrder.usd_equivalent || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total INR</p>
                      <p className="font-bold text-lg">₹{selectedOrder.total_amount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* LRS Compliance */}
                <div className="p-4 border rounded-lg bg-blue-50/50 dark:bg-blue-900/10">
                  <p className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4" /> LRS Compliance
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">LRS Declaration</p>
                      {selectedOrder.lrs_declaration_accepted ? (
                        <Badge className="bg-success"><CheckCircle className="h-3 w-3 mr-1" /> Accepted</Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground"><Clock className="h-3 w-3 mr-1" /> Not Accepted</Badge>
                      )}
                    </div>
                    {selectedOrder.lrs_declaration_timestamp && (
                      <div>
                        <p className="text-muted-foreground">Declaration Time</p>
                        <p className="font-medium">{new Date(selectedOrder.lrs_declaration_timestamp).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                  {(selectedOrder.usd_equivalent || 0) > 3000 && (
                    <div className="mt-3 p-2 bg-amber-100 dark:bg-amber-900/20 rounded text-sm flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span>Cash limit exceeded (USD 3,000). Bank transfer required per RBI guidelines.</span>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Customer & Travel Tab */}
              <TabsContent value="customer" className="space-y-4 mt-4">
                {/* Customer Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" /> Customer Details
                    </p>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-muted-foreground">Name:</span> {selectedOrder.customer_name || selectedOrder.profile?.full_name || "—"}</p>
                      <p><span className="text-muted-foreground">Email:</span> {selectedOrder.customer_email || selectedOrder.profile?.email || "—"}</p>
                      <p><span className="text-muted-foreground">Phone:</span> {selectedOrder.customer_phone || selectedOrder.profile?.phone || "—"}</p>
                      <p><span className="text-muted-foreground">PAN:</span> <span className="font-mono">{selectedOrder.pan_number || "—"}</span></p>
                      <p><span className="text-muted-foreground">Nationality:</span> {selectedOrder.nationality || "—"}</p>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Plane className="h-4 w-4" /> Travel Details
                    </p>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-muted-foreground">Purpose:</span> <span className="capitalize font-medium">{selectedOrder.purpose || "—"}</span></p>
                      <p><span className="text-muted-foreground">Destination:</span> {selectedOrder.destination_country || "—"}</p>
                      <p><span className="text-muted-foreground">Travel Start:</span> {selectedOrder.travel_start_date ? new Date(selectedOrder.travel_start_date).toLocaleDateString() : "—"}</p>
                      <p><span className="text-muted-foreground">Travel End:</span> {selectedOrder.return_date_not_finalized ? "Not Finalized" : selectedOrder.travel_end_date ? new Date(selectedOrder.travel_end_date).toLocaleDateString() : "—"}</p>
                    </div>
                  </div>
                </div>

                {/* Payee/Recipient */}
                <div className="p-4 border rounded-lg">
                  <p className="text-sm font-medium mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" /> Payee (Recipient)
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Name</p>
                      <p className="font-medium">{selectedOrder.payee_name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedOrder.payee_phone || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Address</p>
                      <p className="font-medium">{selectedOrder.payee_address || "—"}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="space-y-4 mt-4">
                {/* Document Verification Status */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Document Verification
                    </p>
                    {getDocVerificationBadge(selectedOrder.document_verification_status)}
                  </div>

                  {selectedOrder.document_verified_at && (
                    <p className="text-xs text-muted-foreground mb-4">
                      Verified on {new Date(selectedOrder.document_verified_at).toLocaleString()}
                    </p>
                  )}

                  {selectedOrder.document_verification_notes && (
                    <div className="p-3 bg-muted rounded mb-4">
                      <p className="text-sm"><span className="font-medium">Notes:</span> {selectedOrder.document_verification_notes}</p>
                    </div>
                  )}

                  {/* Document Viewer (Source of Truth) */}
                  <div className="mt-4">
                    <DocumentViewer
                      userId={selectedOrder.user_id}
                      serviceType="currency_exchange"
                      orderId={selectedOrder.id}
                      orderDate={selectedOrder.created_at}
                      compact
                    />
                  </div>

                  {/* Verification Actions */}
                  {selectedOrder.document_verification_status !== "verified" && selectedOrder.documents && (selectedOrder.documents as UploadedDocument[]).length > 0 && (
                    <div className="p-4 border rounded-lg bg-amber-50/50 dark:bg-amber-900/10">
                      <p className="text-sm font-medium mb-3">Verification Actions</p>
                      <Textarea
                        value={docVerificationNotes}
                        onChange={(e) => setDocVerificationNotes(e.target.value)}
                        placeholder="Add verification notes (required for rejection)..."
                        className="mb-3"
                      />
                      <div className="flex gap-2">
                        <Button
                          className="bg-success hover:bg-success/90"
                          onClick={() => verifyDocuments(selectedOrder.id, "verified", docVerificationNotes)}
                          disabled={updating}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve Documents
                        </Button>
                        <Button
                          variant="outline"
                          className="border-orange-500 text-orange-600 hover:bg-orange-50"
                          onClick={() => verifyDocuments(selectedOrder.id, "incomplete", docVerificationNotes)}
                          disabled={updating}
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Mark Incomplete
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => verifyDocuments(selectedOrder.id, "rejected", docVerificationNotes)}
                          disabled={updating || !docVerificationNotes}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject Documents
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Payments & Delivery Tab */}
              <TabsContent value="payments" className="space-y-4 mt-4">
                {/* Payment Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 border rounded-lg ${selectedOrder.advance_paid ? 'bg-success/5 border-success/30' : 'bg-yellow-500/5 border-yellow-500/30'}`}>
                    <p className="text-sm font-medium mb-2">Advance Payment (10%)</p>
                    <p className="text-xl font-bold">₹{selectedOrder.advance_amount.toLocaleString()}</p>
                    <div className="mt-2 flex items-center gap-2">
                      {selectedOrder.advance_paid ? (
                        <Badge className="bg-success"><CheckCircle className="h-3 w-3 mr-1" /> Paid</Badge>
                      ) : (
                        <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>
                      )}
                      {selectedOrder.advance_reference && (
                        <code className="text-xs bg-muted px-2 py-1 rounded">{selectedOrder.advance_reference}</code>
                      )}
                    </div>
                    {selectedOrder.advance_paid_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Paid on {new Date(selectedOrder.advance_paid_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className={`p-4 border rounded-lg ${selectedOrder.balance_paid ? 'bg-success/5 border-success/30' : 'bg-blue-500/5 border-blue-500/30'}`}>
                    <p className="text-sm font-medium mb-2">Balance Payment (90%)</p>
                    <p className="text-xl font-bold">₹{selectedOrder.balance_amount.toLocaleString()}</p>
                    <div className="mt-2 flex items-center gap-2">
                      {selectedOrder.balance_paid ? (
                        <Badge className="bg-success"><CheckCircle className="h-3 w-3 mr-1" /> Paid</Badge>
                      ) : (
                        <Badge className="bg-blue-500"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>
                      )}
                      {selectedOrder.balance_reference && (
                        <code className="text-xs bg-muted px-2 py-1 rounded">{selectedOrder.balance_reference}</code>
                      )}
                    </div>
                    {selectedOrder.balance_paid_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Paid on {new Date(selectedOrder.balance_paid_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="p-4 border rounded-lg">
                  <p className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Truck className="h-4 w-4" /> Delivery Information
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Delivery Date</p>
                      <p className="font-medium">{selectedOrder.delivery_date || "Not scheduled"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Time Slot</p>
                      <p className="font-medium">{selectedOrder.delivery_time_slot || "Not selected"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Delivery Address</p>
                      <p className="font-medium">{selectedOrder.delivery_address || "Not provided"}</p>
                    </div>
                    {selectedOrder.delivered_at && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Delivered At</p>
                        <p className="font-medium text-success">{new Date(selectedOrder.delivered_at).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Admin Notes */}
                <div>
                  <p className="text-sm font-medium mb-2">Admin Notes</p>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes about this order..."
                    className="min-h-20"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={saveNotes}
                    disabled={updating}
                    className="mt-2"
                  >
                    Save Notes
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter className="flex-wrap gap-2">
            {selectedOrder && selectedOrder.status !== "delivered" && selectedOrder.status !== "cancelled" && (
              <>
                {!selectedOrder.advance_paid && (
                  <Button
                    className="bg-yellow-500 hover:bg-yellow-600"
                    onClick={() => confirmAdvancePayment(selectedOrder.id)}
                    disabled={updating}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Advance
                  </Button>
                )}
                {selectedOrder.advance_paid && !selectedOrder.balance_paid && (
                  <Button
                    className="bg-blue-500 hover:bg-blue-600"
                    onClick={() => confirmBalancePayment(selectedOrder.id)}
                    disabled={updating}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Balance
                  </Button>
                )}
                {(selectedOrder.status === "balance_paid" || selectedOrder.status === "scheduled") && (
                  <Button
                    className="bg-orange-500 hover:bg-orange-600"
                    onClick={() => markAsOutForDelivery(selectedOrder.id)}
                    disabled={updating}
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Out for Delivery
                  </Button>
                )}
                {selectedOrder.status === "out_for_delivery" && (
                  <Button
                    className="bg-success hover:bg-success/90"
                    onClick={() => markAsDelivered(selectedOrder.id)}
                    disabled={updating}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Mark Delivered
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => cancelOrder(selectedOrder.id)}
                  disabled={updating}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Order
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
