import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import {
  ClipboardList,
  CreditCard,
  GraduationCap,
  Send,
  ArrowRightLeft,
  Plane,
  AlertTriangle,
  Eye,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Upload,
  RefreshCw,
  Loader2,
  Package,
  DollarSign,
  Plus,
} from "lucide-react";

interface UnifiedServiceRecord {
  id: string;
  type: "currency_exchange" | "remittance" | "forex_card" | "forex_card_topup" | "travel_insurance" | "education_loan";
  typeLabel: string;
  referenceId: string;
  status: string;
  statusLabel: string;
  lastUpdated: string;
  details: Record<string, unknown>;
  actionType: "payment" | "track" | "view" | "reapply" | "upload" | "topup" | null;
  actionLabel: string;
  route: string;
}

const typeIcons: Record<string, typeof CreditCard> = {
  currency_exchange: ArrowRightLeft,
  remittance: Send,
  forex_card: CreditCard,
  forex_card_topup: CreditCard,
  travel_insurance: Plane,
  education_loan: GraduationCap,
};

const typeLabels: Record<string, string> = {
  currency_exchange: "Currency Exchange",
  remittance: "International Remittance",
  forex_card: "Forex Card",
  forex_card_topup: "Forex Card Top-Up",
  travel_insurance: "Travel Insurance",
  education_loan: "Education Loan",
};

const typeColors: Record<string, string> = {
  currency_exchange: "bg-blue-500",
  remittance: "bg-emerald-500",
  forex_card: "bg-purple-500",
  forex_card_topup: "bg-purple-400",
  travel_insurance: "bg-orange-500",
  education_loan: "bg-indigo-500",
};

export const UnifiedServicesView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<UnifiedServiceRecord[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (user) {
      fetchAllServices();
    }
  }, [user]);

  const fetchAllServices = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch all service data in parallel
      const [
        exchangeOrders,
        remittances,
        forexCardApps,
        travelPolicies,
      ] = await Promise.all([
        supabase
          .from("currency_exchange_orders")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false }),
        supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .eq("transaction_type", "remittance")
          .order("updated_at", { ascending: false }),
        supabase
          .from("service_applications")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false }),
        supabase
          .from("travel_insurance_policies")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false }),
      ]);

      const allServices: UnifiedServiceRecord[] = [];

      // Process Currency Exchange Orders
      if (exchangeOrders.data) {
        exchangeOrders.data.forEach((order) => {
          const statusInfo = getCurrencyExchangeStatus(order.status);
          allServices.push({
            id: order.id,
            type: "currency_exchange",
            typeLabel: `${order.exchange_type === "sell" ? "Sell" : "Buy"} Forex`,
            referenceId: order.order_number || order.id.slice(0, 8).toUpperCase(),
            status: order.status,
            statusLabel: statusInfo.label,
            lastUpdated: order.updated_at,
            details: {
              amount: order.amount,
              currency: order.to_currency,
              total: order.total_amount,
            },
            actionType: statusInfo.actionType,
            actionLabel: statusInfo.actionLabel,
            route: "/currency-exchange",
          });
        });
      }

      // Process Remittances
      if (remittances.data) {
        remittances.data.forEach((tx) => {
          const statusInfo = getRemittanceStatus(tx.status);
          allServices.push({
            id: tx.id,
            type: "remittance",
            typeLabel: "International Remittance",
            referenceId: tx.reference_number || tx.id.slice(0, 8).toUpperCase(),
            status: tx.status,
            statusLabel: statusInfo.label,
            lastUpdated: tx.updated_at,
            details: {
              amount: tx.source_amount,
              currency: tx.destination_currency,
            },
            actionType: statusInfo.actionType,
            actionLabel: statusInfo.actionLabel,
            route: "/remittance",
          });
        });
      }

      // Process Forex Card Applications (including top-ups)
      if (forexCardApps.data) {
        forexCardApps.data.forEach((app) => {
          const appData = app.application_data as Record<string, unknown> | null;
          const isTopup = appData?.is_topup === true || appData?.application_type === "topup";
          const statusInfo = getForexCardStatus(app.application_status, isTopup);
          
          allServices.push({
            id: app.id,
            type: isTopup ? "forex_card_topup" : app.service_type as "forex_card" | "education_loan",
            typeLabel: isTopup 
              ? "Forex Card Top-Up" 
              : app.service_type === "education_loan" 
                ? "Education Loan" 
                : "Forex Card",
            referenceId: app.id.slice(0, 8).toUpperCase(),
            status: app.application_status,
            statusLabel: statusInfo.label,
            lastUpdated: app.updated_at,
            details: {
              loadAmount: app.load_amount,
              currency: app.load_currency,
              cardNumber: appData?.card_number_masked,
            },
            actionType: statusInfo.actionType,
            actionLabel: statusInfo.actionLabel,
            route: app.service_type === "education_loan" ? "/education-loan-apply" : "/forex-card-apply",
          });
        });
      }

      // Process Travel Insurance
      if (travelPolicies.data) {
        travelPolicies.data.forEach((policy) => {
          const statusInfo = getTravelInsuranceStatus(policy.policy_status, policy.payment_status);
          allServices.push({
            id: policy.id,
            type: "travel_insurance",
            typeLabel: "Travel Insurance",
            referenceId: policy.policy_number,
            status: policy.policy_status,
            statusLabel: statusInfo.label,
            lastUpdated: policy.updated_at,
            details: {
              destination: policy.destination_country,
              premium: policy.premium_amount,
              plan: policy.selected_plan,
            },
            actionType: statusInfo.actionType,
            actionLabel: statusInfo.actionLabel,
            route: "/travel-insurance-apply",
          });
        });
      }

      // Sort by last updated
      allServices.sort((a, b) => 
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      );

      setServices(allServices);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrencyExchangeStatus = (status: string): { label: string; actionType: UnifiedServiceRecord["actionType"]; actionLabel: string } => {
    const statusMap: Record<string, { label: string; actionType: UnifiedServiceRecord["actionType"]; actionLabel: string }> = {
      draft: { label: "Created", actionType: "payment", actionLabel: "Continue" },
      pending: { label: "Pending Compliance Review", actionType: "track", actionLabel: "Track Status" },
      rate_locked: { label: "Rate Locked", actionType: "payment", actionLabel: "Complete Payment" },
      advance_paid: { label: "Advance Received", actionType: "track", actionLabel: "Track Status" },
      approved: { label: "Approved", actionType: "payment", actionLabel: "Pay Balance" },
      balance_paid: { label: "Payment Complete", actionType: "track", actionLabel: "Track Status" },
      processing: { label: "Processing", actionType: "track", actionLabel: "Track Status" },
      scheduled: { label: "Scheduled", actionType: "track", actionLabel: "Track Delivery" },
      dispatched: { label: "Dispatched", actionType: "track", actionLabel: "Track Delivery" },
      delivered: { label: "Completed", actionType: "view", actionLabel: "View Details" },
      completed: { label: "Completed", actionType: "view", actionLabel: "View Details" },
      cancelled: { label: "Cancelled", actionType: "view", actionLabel: "View Reason" },
      rejected: { label: "Rejected", actionType: "reapply", actionLabel: "View Reason / Re-Apply" },
    };
    return statusMap[status] || { label: status, actionType: "track", actionLabel: "Track Status" };
  };

  const getRemittanceStatus = (status: string): { label: string; actionType: UnifiedServiceRecord["actionType"]; actionLabel: string } => {
    const statusMap: Record<string, { label: string; actionType: UnifiedServiceRecord["actionType"]; actionLabel: string }> = {
      pending: { label: "Created", actionType: "payment", actionLabel: "Complete Payment" },
      payment_pending: { label: "Payment Pending", actionType: "payment", actionLabel: "Complete Payment" },
      compliance_pending: { label: "Pending Compliance Review", actionType: "track", actionLabel: "Track Status" },
      processing: { label: "Processing", actionType: "track", actionLabel: "Track Status" },
      dispatched: { label: "Sent", actionType: "track", actionLabel: "Track Status" },
      completed: { label: "Completed", actionType: "view", actionLabel: "View Details" },
      rejected: { label: "Rejected", actionType: "reapply", actionLabel: "View Reason" },
      cancelled: { label: "Cancelled", actionType: "view", actionLabel: "View Details" },
    };
    return statusMap[status] || { label: status, actionType: "track", actionLabel: "Track Status" };
  };

  const getForexCardStatus = (status: string, isTopup: boolean): { label: string; actionType: UnifiedServiceRecord["actionType"]; actionLabel: string } => {
    if (isTopup) {
      const statusMap: Record<string, { label: string; actionType: UnifiedServiceRecord["actionType"]; actionLabel: string }> = {
        applied: { label: "Top-Up Requested", actionType: "track", actionLabel: "Track Status" },
        under_review: { label: "Pending Approval", actionType: "track", actionLabel: "Track Status" },
        documents_submitted: { label: "Under Review", actionType: "track", actionLabel: "Track Status" },
        approved: { label: "Approved - Payment Pending", actionType: "payment", actionLabel: "Complete Payment" },
        payment_pending: { label: "Payment Pending", actionType: "payment", actionLabel: "Complete Payment" },
        completed: { label: "Completed", actionType: "view", actionLabel: "View Details" },
        rejected: { label: "Rejected", actionType: "reapply", actionLabel: "View Reason" },
        action_required: { label: "Action Required", actionType: "upload", actionLabel: "Upload Documents" },
      };
      return statusMap[status] || { label: status, actionType: "track", actionLabel: "Track Status" };
    }

    const statusMap: Record<string, { label: string; actionType: UnifiedServiceRecord["actionType"]; actionLabel: string }> = {
      applied: { label: "Applied", actionType: "track", actionLabel: "Track Status" },
      awaiting_payment: { label: "Awaiting Payment", actionType: "payment", actionLabel: "Complete Payment" },
      under_review: { label: "Under Review", actionType: "track", actionLabel: "Track Status" },
      documents_submitted: { label: "Documents Submitted", actionType: "track", actionLabel: "Track Status" },
      approved: { label: "Approved", actionType: "topup", actionLabel: "Top Up Card" },
      card_active: { label: "Card Active", actionType: "topup", actionLabel: "Top Up" },
      rejected: { label: "Rejected", actionType: "reapply", actionLabel: "View Reason / Re-Apply" },
      closed: { label: "Closed", actionType: "view", actionLabel: "View Details" },
      action_required: { label: "Action Required", actionType: "upload", actionLabel: "Upload Documents" },
    };
    return statusMap[status] || { label: status, actionType: "track", actionLabel: "Track Status" };
  };

  const getTravelInsuranceStatus = (policyStatus: string, paymentStatus: string): { label: string; actionType: UnifiedServiceRecord["actionType"]; actionLabel: string } => {
    if (paymentStatus === "pending") {
      return { label: "Payment Pending", actionType: "payment", actionLabel: "Complete Payment" };
    }
    
    const statusMap: Record<string, { label: string; actionType: UnifiedServiceRecord["actionType"]; actionLabel: string }> = {
      draft: { label: "Quote Generated", actionType: "payment", actionLabel: "Complete Payment" },
      pending_payment: { label: "Payment Pending", actionType: "payment", actionLabel: "Complete Payment" },
      issued: { label: "Policy Issued", actionType: "view", actionLabel: "View Policy" },
      active: { label: "Active", actionType: "view", actionLabel: "View Policy" },
      expired: { label: "Expired", actionType: "view", actionLabel: "View Details" },
    };
    return statusMap[policyStatus] || { label: policyStatus, actionType: "view", actionLabel: "View Details" };
  };

  const getStatusBadge = (status: string, statusLabel: string) => {
    const isSuccess = ["completed", "delivered", "approved", "card_active", "active", "issued"].includes(status);
    const isWarning = ["pending", "under_review", "processing", "awaiting_payment", "applied", "documents_submitted", "advance_paid", "scheduled", "dispatched"].includes(status);
    const isDanger = ["rejected", "cancelled", "expired", "closed"].includes(status);
    const isAction = ["action_required", "payment_pending"].includes(status);

    if (isSuccess) return <Badge className="bg-success"><CheckCircle className="h-3 w-3 mr-1" />{statusLabel}</Badge>;
    if (isDanger) return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />{statusLabel}</Badge>;
    if (isAction) return <Badge className="bg-orange-500"><AlertTriangle className="h-3 w-3 mr-1" />{statusLabel}</Badge>;
    return <Badge className="bg-blue-500"><Clock className="h-3 w-3 mr-1" />{statusLabel}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAction = (service: UnifiedServiceRecord) => {
    navigate(service.route);
  };

  const filteredServices = filter === "all" 
    ? services 
    : services.filter(s => s.type === filter || (filter === "forex_card" && s.type === "forex_card_topup"));

  // Count by status for filtering
  const actionRequiredCount = services.filter(s => 
    s.status === "action_required" || s.actionType === "payment" || s.actionType === "upload"
  ).length;

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground mt-2">Loading services...</p>
        </CardContent>
      </Card>
    );
  }

  if (services.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            My Services & Applications
          </CardTitle>
          <CardDescription>
            Your service history will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-4">You haven't used any services yet</p>
            <Button onClick={() => navigate("/")}>
              <Plus className="h-4 w-4 mr-2" />
              Explore Services
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              My Services & Applications
            </CardTitle>
            <CardDescription>
              All your service records in one place • {services.length} total
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchAllServices}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Action Required Alert */}
        {actionRequiredCount > 0 && (
          <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-orange-700 dark:text-orange-300">
              {actionRequiredCount} item(s) need your attention
            </span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="all" className="text-xs">All ({services.length})</TabsTrigger>
            <TabsTrigger value="currency_exchange" className="text-xs">Forex ({services.filter(s => s.type === "currency_exchange").length})</TabsTrigger>
            <TabsTrigger value="remittance" className="text-xs">Remittance ({services.filter(s => s.type === "remittance").length})</TabsTrigger>
            <TabsTrigger value="forex_card" className="text-xs">Cards ({services.filter(s => s.type === "forex_card" || s.type === "forex_card_topup").length})</TabsTrigger>
            <TabsTrigger value="travel_insurance" className="text-xs">Insurance ({services.filter(s => s.type === "travel_insurance").length})</TabsTrigger>
            <TabsTrigger value="education_loan" className="text-xs">Loans ({services.filter(s => s.type === "education_loan").length})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Services List */}
        <div className="space-y-3">
          {filteredServices.map((service, index) => {
            const Icon = typeIcons[service.type] || ClipboardList;
            const colorClass = typeColors[service.type] || "bg-gray-500";
            const isActionRequired = service.status === "action_required" || service.actionType === "payment" || service.actionType === "upload";

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-colors cursor-pointer
                    ${isActionRequired 
                      ? "bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/20" 
                      : "bg-muted/30 hover:bg-muted/50"
                    }`}
                  onClick={() => handleAction(service)}
                >
                  <div className={`h-10 w-10 rounded-full ${colorClass} flex items-center justify-center shrink-0`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-medium truncate">{service.typeLabel}</h4>
                      {getStatusBadge(service.status, service.statusLabel)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      <span className="font-mono">#{service.referenceId}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline">{formatDate(service.lastUpdated)}</span>
                      {service.details.amount && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span className="hidden sm:inline">
                            {service.type === "currency_exchange" || service.type === "remittance" 
                              ? `${Number(service.details.amount).toLocaleString()} ${service.details.currency || ""}`
                              : service.details.loadAmount 
                                ? `${Number(service.details.loadAmount).toLocaleString()} ${service.details.currency || ""}`
                                : ""
                            }
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant={isActionRequired ? "default" : "outline"}>
                      {service.actionLabel}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
