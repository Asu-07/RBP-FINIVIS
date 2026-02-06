import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { useAuth } from "@/hooks/useAuth";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { sanitizeError, logError } from "@/lib/errorHandler";
import {
  Users,
  FileText,
  CreditCard,
  RefreshCw,
  Search,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Loader2,
  TrendingUp,
  Wallet,
  AlertTriangle,
  ClipboardList,
  Banknote,
  Truck,
  Package,
  ArrowLeftRight,
  Scale,
  Flag,
  History,
  IndianRupee,
  Plane,
  FolderOpen,
  GraduationCap
} from "lucide-react";
import { CurrencyExchangeAdmin } from "@/components/admin/CurrencyExchangeAdmin";
import { LRSTrackerAdmin } from "@/components/admin/LRSTrackerAdmin";
import { AMLFlagsAdmin } from "@/components/admin/AMLFlagsAdmin";
import { AdminAuditLogs } from "@/components/admin/AdminAuditLogs";
import { TravelInsuranceAdmin } from "@/components/admin/TravelInsuranceAdmin";
import { RefundableBalanceAdmin } from "@/components/admin/RefundableBalanceAdmin";
import { ForexCardAdmin } from "@/components/admin/ForexCardAdmin";
import { EducationLoanAdmin } from "@/components/admin/EducationLoanAdmin";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DocumentViewer } from "@/components/admin/DocumentViewer";
import { CurrencyRatesAdmin } from "@/components/admin/CurrencyRatesAdmin";
import { Globe, Coins } from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  kyc_status: string | null;
  kyc_submitted_at: string | null;
  created_at: string;
}

interface Transaction {
  id: string;
  user_id: string;
  reference_number: string | null;
  transaction_type: string;
  source_currency: string;
  source_amount: number;
  destination_currency: string;
  destination_amount: number;
  status: string;
  created_at: string;
  notes: string | null;
  purpose: string | null;
  lrs_purpose?: string | null;
  profile?: Profile | null;
}

interface RefundableBalanceSummary {
  total_balance: number;
  total_users: number;
}

interface ServiceApplication {
  id: string;
  user_id: string;
  service_type: string;
  application_status: string;
  application_data: unknown;
  admin_notes: string | null;
  action_required: string | null;
  rejection_reason: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  created_at: string;
  profile?: Profile | null;
}

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isForexAdmin, loading: adminLoading } = useAdminAccess();
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pendingPaymentOrders, setPendingPaymentOrders] = useState<Transaction[]>([]);
  const [remittanceOrders, setRemittanceOrders] = useState<Transaction[]>([]);
  const [refundableBalanceSummary, setRefundableBalanceSummary] = useState<RefundableBalanceSummary>({ total_balance: 0, total_users: 0 });
  const [serviceApplications, setServiceApplications] = useState<ServiceApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [kycFilter, setKycFilter] = useState("all");
  const [txStatusFilter, setTxStatusFilter] = useState("all");
  const [appStatusFilter, setAppStatusFilter] = useState("all");
  const [appTypeFilter, setAppTypeFilter] = useState("all");

  // KYC Review Dialog
  const [kycDialogOpen, setKycDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [kycDocuments, setKycDocuments] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);

  // Service Application Dialog
  const [appDialogOpen, setAppDialogOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<ServiceApplication | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionRequired, setActionRequired] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // Rejection Dialog
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedTxForReject, setSelectedTxForReject] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Document Viewer Dialog
  const [docViewerOpen, setDocViewerOpen] = useState(false);
  const [docViewerUserId, setDocViewerUserId] = useState<string | null>(null);
  const [docViewerServiceType, setDocViewerServiceType] = useState<"kyc" | "currency_exchange" | "remittance" | "forex_card" | "education_loan" | "all">("all");
  const [docViewerOrderId, setDocViewerOrderId] = useState<string | null>(null);
  const [docViewerOrderDate, setDocViewerOrderDate] = useState<string | undefined>(undefined);

  // Active tab state for controlled Tabs component
  const [activeTab, setActiveTab] = useState("payments");

  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user) {
        navigate("/auth");
      } else if (!isAdmin) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/dashboard");
      } else {
        fetchAllData();
      }
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchProfiles(),
      fetchTransactions(),
      fetchPendingPayments(),
      fetchRemittanceOrders(),
      fetchRefundableBalanceSummary(),
      fetchServiceApplications()
    ]);
    setLoading(false);
  };

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      logError("Admin.fetchProfiles", error);
    } else {
      setProfiles(data || []);
    }
  };

  const fetchTransactions = async () => {
    // Fetches recent transactions for the "All Transactions" tab
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      logError("Admin.fetchTransactions", error);
    } else {
      // Fetch profiles for each transaction
      const txsWithProfiles: Transaction[] = await Promise.all(
        (data || []).map(async (tx) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", tx.user_id)
            .maybeSingle();
          return { ...tx, profile: profileData };
        })
      );
      // Debug log only in dev
      if (import.meta.env.DEV) {
        console.log("[Admin] Fetched transactions:", txsWithProfiles.length, txsWithProfiles);
      }
      setTransactions(txsWithProfiles);
    }
  };

  const fetchPendingPayments = async () => {
    // Specifically fetches all pending payments, bypassing the 100 limit of fetchTransactions
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .in("status", ["pending", "payment_received"])
      .order("created_at", { ascending: false });

    if (error) {
      logError("Admin.fetchPendingPayments", error);
    } else {
      const txsWithProfiles: Transaction[] = await Promise.all(
        (data || []).map(async (tx) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", tx.user_id)
            .maybeSingle();
          return { ...tx, profile: profileData };
        })
      );
      setPendingPaymentOrders(txsWithProfiles);
    }
  };

  const fetchRemittanceOrders = async () => {
    // Specifically fetches all remittance orders
    if (import.meta.env.DEV) console.log("[Admin] Fetching remittance orders...");
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("transaction_type", "send")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Admin] fetchRemittanceOrders ERROR:", error);
      logError("Admin.fetchRemittanceOrders", error);
    } else {
      if (import.meta.env.DEV) console.log("[Admin] fetchRemittanceOrders RAW DATA:", data?.length, data);
      const txsWithProfiles: Transaction[] = await Promise.all(
        (data || []).map(async (tx) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", tx.user_id)
            .maybeSingle();
          return { ...tx, profile: profileData };
        })
      );
      if (import.meta.env.DEV) console.log("[Admin] fetchRemittanceOrders FINAL:", txsWithProfiles.length);
      setRemittanceOrders(txsWithProfiles);
    }
  };

  const fetchRefundableBalanceSummary = async () => {
    const { data, error } = await supabase
      .from("refundable_balances")
      .select("balance_amount");

    if (error) {
      logError("Admin.fetchRefundableBalances", error);
      return;
    }

    // Aggregate INR balances only
    const totalBalance = data?.reduce((sum, b) => sum + Number(b.balance_amount), 0) || 0;
    const totalUsers = data?.filter(b => Number(b.balance_amount) > 0).length || 0;

    setRefundableBalanceSummary({
      total_balance: totalBalance,
      total_users: totalUsers,
    });
  };

  const fetchServiceApplications = async () => {
    const { data, error } = await supabase
      .from("service_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      logError("Admin.fetchServiceApplications", error);
      return;
    }

    // Fetch profiles for each application
    const appsWithProfiles: ServiceApplication[] = await Promise.all(
      (data || []).map(async (app) => {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", app.user_id)
          .maybeSingle();
        return { ...app, profile: profileData };
      })
    );
    // Debug log to verify applications are being fetched
    if (import.meta.env.DEV) {
      console.log("[Admin] Fetched service applications:", appsWithProfiles.length, appsWithProfiles);
      console.log("[Admin] Service types in applications:", appsWithProfiles.map(app => app.service_type));
    }

    setServiceApplications(appsWithProfiles);
  };

  const openApplicationReview = (app: ServiceApplication) => {
    setSelectedApp(app);
    setAdminNotes(app.admin_notes || "");
    setActionRequired(app.action_required || "");
    setRejectionReason(app.rejection_reason || "");
    setAppDialogOpen(true);
  };

  // Helper to open document viewer for any order or application
  const openDocViewer = (userId: string, serviceType: "kyc" | "currency_exchange" | "remittance" | "forex_card" | "education_loan" | "all", orderId?: string, orderDate?: string) => {
    setDocViewerUserId(userId);
    setDocViewerServiceType(serviceType);
    setDocViewerOrderId(orderId || null);
    setDocViewerOrderDate(orderDate);
    setDocViewerOpen(true);
  };

  const updateApplicationStatus = async (status: string) => {
    if (!selectedApp) return;

    // KYC Gate: Check if approval requires KYC verification
    if (status === "approved" && (selectedApp.service_type === "forex_card" || selectedApp.service_type === "education_loan")) {
      const profile = selectedApp.profile;
      if (profile?.kyc_status !== "verified") {
        toast.error("Cannot approve: User KYC is not verified. Please set status to 'Action Required' and ask user to complete KYC.");
        return;
      }
    }

    setUpdating(true);

    const updateData: Record<string, unknown> = {
      application_status: status,
      admin_notes: adminNotes || null,
      reviewed_at: new Date().toISOString(),
    };

    if (status === "approved") {
      updateData.approved_at = new Date().toISOString();
      updateData.action_required = null;
      updateData.rejection_reason = null;
    } else if (status === "rejected") {
      updateData.rejected_at = new Date().toISOString();
      updateData.rejection_reason = rejectionReason || null;
      updateData.action_required = null;
    } else if (status === "action_required") {
      updateData.action_required = actionRequired || null;
      updateData.rejection_reason = null;
    }

    const { error } = await supabase
      .from("service_applications")
      .update(updateData)
      .eq("id", selectedApp.id);

    if (error) {
      toast.error(sanitizeError(error));
    } else {
      toast.success(`Application ${status === "action_required" ? "updated" : status}`);
      setAppDialogOpen(false);
      fetchServiceApplications();

      // Send email notification
      const profile = selectedApp.profile;
      if (profile?.email) {
        supabase.functions.invoke("send-notification-email", {
          body: {
            type: `service_${status}`,
            email: profile.email,
            name: profile.full_name || "Customer",
            service_type: selectedApp.service_type,
            action_required: status === "action_required" ? actionRequired : undefined,
            rejection_reason: status === "rejected" ? rejectionReason : undefined,
          },
        }).catch((err) => logError("Admin.serviceApplicationEmail", err));
      }
    }
    setUpdating(false);
  };

  const saveAdminNotes = async () => {
    if (!selectedApp) return;
    setUpdating(true);

    const { error } = await supabase
      .from("service_applications")
      .update({ admin_notes: adminNotes })
      .eq("id", selectedApp.id);

    if (error) {
      toast.error(sanitizeError(error));
    } else {
      toast.success("Notes saved");
      fetchServiceApplications();
    }
    setUpdating(false);
  };

  const openKycReview = async (profile: Profile) => {
    setSelectedProfile(profile);
    setKycDialogOpen(true);

    // Fetch KYC documents
    const { data, error } = await supabase.storage
      .from("kyc-documents")
      .list(profile.user_id);

    if (error) {
      logError("Admin.fetchKycDocuments", error);
    } else {
      const urls = await Promise.all(
        (data || []).map(async (file) => {
          // Use signed URLs for private bucket
          const { data: urlData } = await supabase.storage
            .from("kyc-documents")
            .createSignedUrl(`${profile.user_id}/${file.name}`, 3600);
          return urlData?.signedUrl || "";
        })
      );
      setKycDocuments(urls.filter(url => url !== ""));
    }
  };

  const updateKycStatus = async (status: string) => {
    if (!selectedProfile) return;
    setUpdating(true);

    const updateData: { kyc_status: string; kyc_verified_at?: string } = {
      kyc_status: status,
    };

    if (status === "verified") {
      updateData.kyc_verified_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", selectedProfile.id);

    if (error) {
      toast.error(sanitizeError(error));
    } else {
      toast.success(`KYC status updated to ${status}`);
      setKycDialogOpen(false);
      fetchProfiles();

      // Send email notification
      if (selectedProfile.email && (status === "verified" || status === "rejected")) {
        supabase.functions.invoke("send-notification-email", {
          body: {
            type: status === "verified" ? "kyc_approved" : "kyc_rejected",
            email: selectedProfile.email,
            name: selectedProfile.full_name || "Customer",
          },
        }).catch((err) => logError("Admin.kycEmail", err));
      }
    }
    setUpdating(false);
  };

  // Payment confirmation using secure RPC functions
  const confirmPayment = async (txId: string) => {
    setUpdating(true);
    try {
      // First update payment_received to pending if needed (for backward compatibility)
      const tx = pendingPaymentOrders.find(t => t.id === txId) || remittanceOrders.find(t => t.id === txId) || transactions.find(t => t.id === txId);
      if (tx?.status === "payment_received") {
        await supabase
          .from("transactions")
          .update({ status: "pending" })
          .eq("id", txId);
      }

      const { data, error } = await supabase.rpc('admin_confirm_payment', {
        _transaction_id: txId
      });

      if (error) {
        throw error;
      }

      toast.success("Payment confirmed! Transaction is now processing.");
      fetchTransactions();

      // Send email notification to user
      const txForEmail = pendingPaymentOrders.find(t => t.id === txId) || remittanceOrders.find(t => t.id === txId) || transactions.find(t => t.id === txId);
      if (txForEmail?.profile?.email) {
        supabase.functions.invoke("send-notification-email", {
          body: {
            type: "payment_confirmed",
            email: txForEmail.profile.email,
            name: txForEmail.profile.full_name || "Customer",
            referenceNumber: txForEmail.reference_number || txForEmail.id.slice(0, 8),
            amount: txForEmail.source_amount,
            currency: txForEmail.source_currency,
          },
        }).catch((err) => logError("Admin.paymentConfirmEmail", err));
      }
    } catch (error) {
      logError("Admin.confirmPayment", error);
      toast.error(sanitizeError(error));
    }
    setUpdating(false);
  };

  const openRejectDialog = (txId: string) => {
    setSelectedTxForReject(txId);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const handleRejectPayment = async () => {
    if (!selectedTxForReject) return;
    const reason = rejectReason || "Payment not received or invalid";
    setUpdating(true);
    try {
      const { data, error } = await supabase.rpc('admin_reject_payment', {
        _transaction_id: selectedTxForReject,
        _reason: reason
      });

      if (error) {
        throw error;
      }

      toast.success("Payment rejected.");
      setRejectDialogOpen(false);
      fetchTransactions();

      // Send email notification to user
      const tx = pendingPaymentOrders.find(t => t.id === selectedTxForReject) || remittanceOrders.find(t => t.id === selectedTxForReject) || transactions.find(t => t.id === selectedTxForReject);
      if (tx?.profile?.email) {
        supabase.functions.invoke("send-notification-email", {
          body: {
            type: "payment_rejected",
            email: tx.profile.email,
            name: tx.profile.full_name || "Customer",
            referenceNumber: tx.reference_number || tx.id.slice(0, 8),
            reason: reason,
          },
        }).catch((err) => logError("Admin.paymentRejectionEmail", err));
      }
    } catch (error) {
      logError("Admin.rejectPayment", error);
      toast.error(sanitizeError(error));
    }
    setUpdating(false);
  };

  const dispatchTransaction = async (txId: string) => {
    setUpdating(true);
    try {
      const { data, error } = await supabase.rpc('admin_dispatch_transaction', {
        _transaction_id: txId
      });

      if (error) {
        throw error;
      }

      toast.success("Transaction dispatched!");
      fetchTransactions();
      fetchRemittanceOrders();

      // Send email notification to user
      const tx = remittanceOrders.find(t => t.id === txId) || transactions.find(t => t.id === txId);
      if (tx?.profile?.email) {
        supabase.functions.invoke("send-notification-email", {
          body: {
            type: "order_dispatched",
            email: tx.profile.email,
            name: tx.profile.full_name || "Customer",
            referenceNumber: tx.reference_number || tx.id.slice(0, 8),
          },
        }).catch((err) => logError("Admin.dispatchEmail", err));
      }
    } catch (error) {
      logError("Admin.dispatchTransaction", error);
      toast.error(sanitizeError(error));
    }
    setUpdating(false);
  };

  const completeTransaction = async (txId: string) => {
    setUpdating(true);
    try {
      const { data, error } = await supabase.rpc('admin_complete_transaction', {
        _transaction_id: txId
      });

      if (error) {
        throw error;
      }

      toast.success("Transaction marked as completed!");
      fetchTransactions();
      fetchRemittanceOrders();

      // Send email notification to user
      const tx = remittanceOrders.find(t => t.id === txId) || transactions.find(t => t.id === txId);
      if (tx?.profile?.email) {
        supabase.functions.invoke("send-notification-email", {
          body: {
            type: "transaction_completed",
            email: tx.profile.email,
            name: tx.profile.full_name || "Customer",
            referenceNumber: tx.reference_number || tx.id.slice(0, 8),
            amount: tx.destination_amount,
            currency: tx.destination_currency,
          },
        }).catch((err) => logError("Admin.completionEmail", err));
      }
    } catch (error) {
      logError("Admin.completeTransaction", error);
      toast.error(sanitizeError(error));
    }
    setUpdating(false);
  };

  const getKycBadge = (status: string | null) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Verified</Badge>;
      case "submitted":
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Not Started</Badge>;
    }
  };

  const getTxBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Delivered</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Awaiting Payment</Badge>;
      case "processing":
        return <Badge className="bg-blue-500">Processing</Badge>;
      case "dispatched":
        return <Badge className="bg-purple-500">Dispatched</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "cancelled":
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredProfiles = profiles.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKyc = kycFilter === "all" || p.kyc_status === kycFilter;
    return matchesSearch && matchesKyc;
  });

  const filteredTransactions = transactions.filter((tx) => {
    return txStatusFilter === "all" || tx.status === txStatusFilter;
  });

  const filteredApplications = serviceApplications.filter((app) => {
    const matchesStatus = appStatusFilter === "all" || app.application_status === appStatusFilter;
    const matchesType = appTypeFilter === "all" || app.service_type === appTypeFilter;
    return matchesStatus && matchesType;
  });

  const getAppStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      case "under_review":
        return <Badge className="bg-blue-500"><Eye className="h-3 w-3 mr-1" /> Under Review</Badge>;
      case "action_required":
        return <Badge className="bg-orange-500"><AlertTriangle className="h-3 w-3 mr-1" /> Action Required</Badge>;
      case "documents_submitted":
        return <Badge className="bg-yellow-500"><FileText className="h-3 w-3 mr-1" /> Documents Submitted</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Applied</Badge>;
    }
  };

  const getServiceTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      forex_card: "bg-purple-500",
      education_loan: "bg-indigo-500",
      remittance: "bg-emerald-500",
      currency_exchange: "bg-cyan-500",
    };
    return (
      <Badge className={colors[type] || "bg-muted"}>
        {type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
      </Badge>
    );
  };

  // Stats
  const totalUsers = profiles.length;
  const verifiedUsers = profiles.filter((p) => p.kyc_status === "verified").length;
  const pendingKyc = profiles.filter((p) => p.kyc_status === "submitted").length;
  const totalTransactions = transactions.length;
  const pendingPayments = pendingPaymentOrders.length;
  const processingTransactionsStats = transactions.filter((tx) => tx.status === "processing").length;
  const pendingApplications = serviceApplications.filter(
    (app) => app.application_status === "applied" || app.application_status === "documents_submitted"
  ).length;

  if (authLoading || adminLoading || loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - RBP FINIVIS</title>
        <meta name="description" content="Admin dashboard for managing users, KYC verification, and transactions." />
      </Helmet>
      <Layout>
        <section className="py-6">
          <div className="container-custom">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground flex items-center gap-3">
                  <Shield className="h-7 w-7 text-primary" />
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Manage users, verify KYC, and monitor transactions
                </p>
              </div>
              <div className="flex gap-2">
                {isForexAdmin && (
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('currency-rates')}>
                    <Coins className="h-4 w-4 mr-2" />
                    Set Rates
                  </Button>
                )}
                <Button onClick={fetchAllData} size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Stats Cards - Compact Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              <Card className={pendingPayments > 0 ? "border-yellow-500/50 bg-yellow-500/5" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                      <Banknote className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pending Payments</p>
                      <p className="text-xl font-bold">{pendingPayments}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Users</p>
                      <p className="text-xl font-bold">{totalUsers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Verified KYC</p>
                      <p className="text-xl font-bold">{verifiedUsers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pending KYC</p>
                      <p className="text-xl font-bold">{pendingKyc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Transactions</p>
                      <p className="text-xl font-bold">{totalTransactions}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <IndianRupee className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Refundable Bal.</p>
                      <p className="text-xl font-bold">₹{refundableBalanceSummary.total_balance.toLocaleString("en-IN")}</p>
                      <p className="text-xs text-muted-foreground">{refundableBalanceSummary.total_users} users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <ScrollArea className="w-full">
                <TabsList className="inline-flex h-auto gap-1 p-1 min-w-max">
                  <TabsTrigger value="payments" className="gap-1.5 text-xs">
                    <Banknote className="h-3.5 w-3.5" /> Payments
                    {pendingPayments > 0 && (
                      <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                        {pendingPayments}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="users" className="gap-1.5 text-xs">
                    <Users className="h-3.5 w-3.5" /> Users
                  </TabsTrigger>
                  <TabsTrigger value="kyc" className="gap-1.5 text-xs">
                    <FileText className="h-3.5 w-3.5" /> KYC
                  </TabsTrigger>
                  <TabsTrigger value="applications" className="gap-1.5 text-xs">
                    <ClipboardList className="h-3.5 w-3.5" /> Applications
                    {pendingApplications > 0 && (
                      <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                        {pendingApplications}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="remittance-orders" className="gap-1.5 text-xs">
                    <Globe className="h-3.5 w-3.5" /> Remittances
                  </TabsTrigger>
                  <TabsTrigger value="currency-exchange" className="gap-1.5 text-xs">
                    <ArrowLeftRight className="h-3.5 w-3.5" /> Forex Orders
                  </TabsTrigger>
                  <TabsTrigger value="lrs-tracker" className="gap-1.5 text-xs">
                    <Scale className="h-3.5 w-3.5" /> LRS
                  </TabsTrigger>
                  <TabsTrigger value="aml-flags" className="gap-1.5 text-xs">
                    <Flag className="h-3.5 w-3.5" /> AML
                  </TabsTrigger>
                  <TabsTrigger value="transactions" className="gap-1.5 text-xs">
                    <CreditCard className="h-3.5 w-3.5" /> Transactions
                  </TabsTrigger>
                  <TabsTrigger value="forex-cards" className="gap-1.5 text-xs">
                    <CreditCard className="h-3.5 w-3.5" /> Forex Cards
                  </TabsTrigger>
                  <TabsTrigger value="travel-insurance" className="gap-1.5 text-xs">
                    <Plane className="h-3.5 w-3.5" /> Insurance
                  </TabsTrigger>
                  <TabsTrigger value="education-loan" className="gap-1.5 text-xs">
                    <GraduationCap className="h-3.5 w-3.5" /> Education Loans
                  </TabsTrigger>
                  <TabsTrigger value="refundable-balance" className="gap-1.5 text-xs">
                    <Wallet className="h-3.5 w-3.5" /> Balance
                  </TabsTrigger>
                  <TabsTrigger value="audit-logs" className="gap-1.5 text-xs">
                    <History className="h-3.5 w-3.5" /> Audit
                  </TabsTrigger>
                  {isForexAdmin && (
                    <TabsTrigger value="currency-rates" id="currency-rates-tab" className="gap-1.5 text-xs">
                      <Coins className="h-3.5 w-3.5" /> Rates
                    </TabsTrigger>
                  )}
                </TabsList>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>

              {/* Payments Tab - Priority tab for payment confirmations */}
              <TabsContent value="payments">
                <div className="space-y-6">
                  {/* Pending Payments */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Clock className="h-5 w-5 text-yellow-500" />
                        Awaiting Payment Confirmation ({pendingPayments})
                      </CardTitle>
                      <CardDescription>
                        Verify bank transfers and confirm payments to start processing
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Reference</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingPaymentOrders.map((tx) => (
                            <TableRow key={tx.id}>
                              <TableCell className="font-mono text-xs">
                                {tx.reference_number || tx.id.slice(0, 8)}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium text-sm">{tx.profile?.full_name || "—"}</p>
                                  <p className="text-xs text-muted-foreground">{tx.profile?.email}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="capitalize text-xs">
                                  {tx.transaction_type.replace(/_/g, " ")}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <p className="font-medium text-sm">₹{tx.source_amount.toLocaleString("en-IN")}</p>
                              </TableCell>
                              <TableCell className="text-xs">
                                {new Date(tx.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    className="bg-green-500 hover:bg-green-600 h-7 text-xs"
                                    onClick={() => confirmPayment(tx.id)}
                                    disabled={updating}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Confirm
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="h-7"
                                    onClick={() => openRejectDialog(tx.id)}
                                    disabled={updating}
                                  >
                                    <XCircle className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {pendingPayments === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                No pending payments awaiting confirmation
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Processing Transactions */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Package className="h-5 w-5 text-blue-500" />
                        Processing ({processingTransactionsStats})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Reference</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactions
                            .filter((tx) => tx.status === "processing")
                            .map((tx) => (
                              <TableRow key={tx.id}>
                                <TableCell className="font-mono text-xs">
                                  {tx.reference_number || tx.id.slice(0, 8)}
                                </TableCell>
                                <TableCell>
                                  <p className="font-medium text-sm">{tx.profile?.full_name || "—"}</p>
                                </TableCell>
                                <TableCell>
                                  <p className="font-medium text-sm">₹{tx.source_amount.toLocaleString("en-IN")}</p>
                                </TableCell>
                                <TableCell className="text-xs">
                                  {new Date(tx.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="sm"
                                    className="bg-purple-500 hover:bg-purple-600 h-7 text-xs"
                                    onClick={() => dispatchTransaction(tx.id)}
                                    disabled={updating}
                                  >
                                    <Truck className="h-3 w-3 mr-1" />
                                    Dispatch
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          {processingTransactionsStats === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                No orders being processed
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Dispatched Transactions */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Truck className="h-5 w-5 text-purple-500" />
                        Dispatched ({transactions.filter(tx => tx.status === "dispatched").length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Reference</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactions
                            .filter((tx) => tx.status === "dispatched")
                            .map((tx) => (
                              <TableRow key={tx.id}>
                                <TableCell className="font-mono text-xs">
                                  {tx.reference_number || tx.id.slice(0, 8)}
                                </TableCell>
                                <TableCell>
                                  <p className="font-medium text-sm">{tx.profile?.full_name || "—"}</p>
                                </TableCell>
                                <TableCell>
                                  <p className="font-medium text-sm">₹{tx.source_amount.toLocaleString("en-IN")}</p>
                                </TableCell>
                                <TableCell className="text-xs">
                                  {new Date(tx.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="sm"
                                    className="bg-green-500 hover:bg-green-600 h-7 text-xs"
                                    onClick={() => completeTransaction(tx.id)}
                                    disabled={updating}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Delivered
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          {transactions.filter(tx => tx.status === "dispatched").length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                No dispatched orders
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>User Management</CardTitle>
                    <div className="flex gap-4 mt-4">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Select value={kycFilter} onValueChange={setKycFilter}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="KYC Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="verified">Verified</SelectItem>
                          <SelectItem value="submitted">Pending</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="pending">Not Started</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>KYC Status</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProfiles.map((profile) => (
                          <TableRow key={profile.id}>
                            <TableCell className="font-medium">{profile.full_name || "—"}</TableCell>
                            <TableCell className="text-sm">{profile.email || "—"}</TableCell>
                            <TableCell className="text-sm">{profile.phone || "—"}</TableCell>
                            <TableCell>{getKycBadge(profile.kyc_status)}</TableCell>
                            <TableCell className="text-sm">
                              {new Date(profile.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openKycReview(profile)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* KYC Tab */}
              <TabsContent value="kyc">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>KYC Verification Queue</CardTitle>
                    <CardDescription>Review and verify user KYC documents</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {profiles
                          .filter((p) => p.kyc_status === "submitted")
                          .map((profile) => (
                            <TableRow key={profile.id}>
                              <TableCell className="font-medium">{profile.full_name || "—"}</TableCell>
                              <TableCell>{profile.email || "—"}</TableCell>
                              <TableCell>{getKycBadge(profile.kyc_status)}</TableCell>
                              <TableCell>
                                {profile.kyc_submitted_at
                                  ? new Date(profile.kyc_submitted_at).toLocaleDateString()
                                  : "—"}
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  onClick={() => openKycReview(profile)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Review KYC
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        {profiles.filter((p) => p.kyc_status === "submitted").length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              No KYC documents pending review
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Applications Tab */}
              <TabsContent value="applications">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Service Applications</CardTitle>
                    <div className="flex gap-4 mt-4">
                      <Select value={appStatusFilter} onValueChange={setAppStatusFilter}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="applied">Applied</SelectItem>
                          <SelectItem value="documents_submitted">Documents</SelectItem>
                          <SelectItem value="under_review">Under Review</SelectItem>
                          <SelectItem value="action_required">Action Required</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={appTypeFilter} onValueChange={setAppTypeFilter}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Services</SelectItem>
                          <SelectItem value="forex_card">Forex Card</SelectItem>
                          <SelectItem value="education_loan">Education Loan</SelectItem>
                          <SelectItem value="remittance">Remittance</SelectItem>
                          <SelectItem value="currency_exchange">Currency Exchange</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredApplications.map((app) => (
                          <TableRow key={app.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{app.profile?.full_name || "—"}</p>
                                <p className="text-xs text-muted-foreground">{app.profile?.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>{getServiceTypeBadge(app.service_type)}</TableCell>
                            <TableCell>{getAppStatusBadge(app.application_status)}</TableCell>
                            <TableCell className="text-sm">
                              {app.submitted_at
                                ? new Date(app.submitted_at).toLocaleDateString()
                                : "—"}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openDocViewer(app.user_id, app.service_type as "forex_card" | "education_loan" | "remittance" | "currency_exchange", app.id, app.submitted_at || app.created_at)}
                                  title="View Documents"
                                >
                                  <FolderOpen className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openApplicationReview(app)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Review
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredApplications.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              No applications found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Remittance Orders Tab - Send Money Abroad */}
              {/* Remittance Orders Tab - Send Money Abroad */}
              <TabsContent value="remittance-orders">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Globe className="h-5 w-5 text-blue-500" />
                      Send Money Abroad Orders
                    </CardTitle>
                    <CardDescription>
                      Manage international remittance transactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Reference</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Destination</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Purpose</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {remittanceOrders.map((tx) => (
                          <TableRow key={tx.id}>
                            <TableCell className="font-mono text-xs">
                              {tx.reference_number || tx.id.slice(0, 8)}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{tx.profile?.full_name || "—"}</p>
                                <p className="text-xs text-muted-foreground">{tx.profile?.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">₹{tx.source_amount.toLocaleString("en-IN")}</p>
                                <p className="text-xs text-muted-foreground">→ {tx.destination_currency} {tx.destination_amount.toLocaleString()}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{tx.destination_currency}</Badge>
                            </TableCell>
                            <TableCell>{getTxBadge(tx.status)}</TableCell>
                            <TableCell className="text-xs max-w-32 truncate">
                              {tx.purpose || tx.lrs_purpose || "—"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {new Date(tx.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openDocViewer(tx.user_id, "remittance", tx.id, tx.created_at)}
                                  title="View Documents"
                                >
                                  <FolderOpen className="h-4 w-4" />
                                </Button>
                                {tx.status === "pending" || tx.status === "payment_received" ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => confirmPayment(tx.id)}
                                    disabled={updating}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Confirm
                                  </Button>
                                ) : null}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {remittanceOrders.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                              No remittance orders found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Currency Exchange Tab */}
              <TabsContent value="currency-exchange">
                <CurrencyExchangeAdmin />
              </TabsContent>

              {/* LRS Tracker Tab */}
              <TabsContent value="lrs-tracker">
                <LRSTrackerAdmin />
              </TabsContent>

              {/* AML Flags Tab */}
              <TabsContent value="aml-flags">
                <AMLFlagsAdmin />
              </TabsContent>

              {/* Transactions Tab */}
              <TabsContent value="transactions">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>All Transactions</CardTitle>
                    <div className="flex gap-4 mt-4">
                      <Select value={txStatusFilter} onValueChange={setTxStatusFilter}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="dispatched">Dispatched</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Reference</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount (INR)</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransactions.map((tx) => (
                          <TableRow key={tx.id}>
                            <TableCell className="font-mono text-xs">
                              {tx.reference_number || tx.id.slice(0, 8)}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{tx.profile?.full_name || "—"}</p>
                                <p className="text-xs text-muted-foreground">{tx.profile?.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="capitalize text-xs">
                                {tx.transaction_type.replace(/_/g, " ")}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <p className="font-medium">₹{tx.source_amount.toLocaleString("en-IN")}</p>
                            </TableCell>
                            <TableCell>{getTxBadge(tx.status)}</TableCell>
                            <TableCell className="text-sm">
                              {new Date(tx.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Forex Cards Tab */}
              <TabsContent value="forex-cards">
                <ForexCardAdmin />
              </TabsContent>

              {/* Travel Insurance Tab */}
              <TabsContent value="travel-insurance">
                <TravelInsuranceAdmin />
              </TabsContent>

              {/* Education Loan Tab */}
              <TabsContent value="education-loan">
                <EducationLoanAdmin />
              </TabsContent>

              {/* Refundable Balance Tab */}
              <TabsContent value="refundable-balance">
                <RefundableBalanceAdmin />
              </TabsContent>

              {/* Audit Logs Tab */}
              <TabsContent value="audit-logs">
                <AdminAuditLogs />
              </TabsContent>

              {/* Currency Rates Tab - Only visible to Forex Admins */}
              {isForexAdmin && (
                <TabsContent value="currency-rates">
                  <CurrencyRatesAdmin />
                </TabsContent>
              )}
            </Tabs>
          </div>
        </section>
      </Layout>

      {/* KYC Review Dialog */}
      <Dialog open={kycDialogOpen} onOpenChange={setKycDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>KYC Review - {selectedProfile?.full_name}</DialogTitle>
            <DialogDescription>
              Review uploaded documents and update KYC status
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Email:</span>
                <p className="font-medium">{selectedProfile?.email}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span>
                <p className="font-medium">{selectedProfile?.phone || "—"}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Uploaded Documents:</p>
              {kycDocuments.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {kycDocuments.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border rounded-lg p-4 hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="text-sm">Document {index + 1}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No documents uploaded</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => updateKycStatus("rejected")}
              disabled={updating}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => updateKycStatus("verified")}
              disabled={updating}
              className="bg-green-500 hover:bg-green-600"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Application Review Dialog */}
      <Dialog open={appDialogOpen} onOpenChange={setAppDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Review</DialogTitle>
            <DialogDescription>
              {selectedApp?.profile?.full_name} - {selectedApp?.service_type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Email:</span>
                <p className="font-medium">{selectedApp?.profile?.email}</p>
              </div>
              <div>
                <span className="text-muted-foreground">KYC Status:</span>
                <p>{selectedApp?.profile?.kyc_status ? getKycBadge(selectedApp.profile.kyc_status) : "—"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Current Status:</span>
                <p>{selectedApp ? getAppStatusBadge(selectedApp.application_status) : "—"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Submitted:</span>
                <p className="font-medium">
                  {selectedApp?.submitted_at ? new Date(selectedApp.submitted_at).toLocaleString() : "—"}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Admin Notes</label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal notes (not visible to user)"
                className="mt-1"
              />
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={saveAdminNotes}
                disabled={updating}
              >
                Save Notes
              </Button>
            </div>

            {selectedApp?.application_status !== "approved" && selectedApp?.application_status !== "rejected" && (
              <>
                <div>
                  <label className="text-sm font-medium">Action Required (visible to user)</label>
                  <Textarea
                    value={actionRequired}
                    onChange={(e) => setActionRequired(e.target.value)}
                    placeholder="What the user needs to do..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Rejection Reason (if rejecting)</label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason for rejection..."
                    className="mt-1"
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter className="gap-2">
            {selectedApp?.application_status !== "approved" && selectedApp?.application_status !== "rejected" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => updateApplicationStatus("action_required")}
                  disabled={updating || !actionRequired}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Request Action
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => updateApplicationStatus("rejected")}
                  disabled={updating}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => updateApplicationStatus("approved")}
                  disabled={updating}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this payment
            </DialogDescription>
          </DialogHeader>
          <div>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (e.g., Payment not received, Invalid reference)"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectPayment}
              disabled={updating}
            >
              Reject Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Viewer Dialog */}
      <Dialog open={docViewerOpen} onOpenChange={setDocViewerOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Documents
            </DialogTitle>
            <DialogDescription>
              View uploaded documents for this {docViewerServiceType.replace(/_/g, " ")}
            </DialogDescription>
          </DialogHeader>
          {docViewerUserId && (
            <DocumentViewer
              userId={docViewerUserId}
              serviceType={docViewerServiceType}
              orderId={docViewerOrderId || undefined}
              orderDate={docViewerOrderDate}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Admin;
