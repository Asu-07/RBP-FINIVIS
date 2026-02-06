import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { useServiceIntent, ServiceType } from "@/hooks/useServiceIntent";
import { useRefundableBalance } from "@/hooks/useRefundableBalance";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BeneficiaryManagement } from "@/components/dashboard/BeneficiaryManagement";
import { TransactionExport } from "@/components/dashboard/TransactionExport";
import { TransactionStatusCard } from "@/components/dashboard/TransactionStatusCard";
import { LiveOrderTracker } from "@/components/dashboard/LiveOrderTracker";
import { UnifiedServicesView } from "@/components/dashboard/UnifiedServicesView";

import { RefundableBalanceCard } from "@/components/dashboard/RefundableBalanceCard";
import { BankRefundRequestForm } from "@/components/dashboard/BankRefundRequestForm";
import { RefundableBalanceHistory } from "@/components/dashboard/RefundableBalanceHistory";
import { UseBalanceModal } from "@/components/dashboard/UseBalanceModal";
import {
  User,
  Send,
  RefreshCw,
  FileText,
  Upload,
  LogOut,
  History,
  Shield,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  CreditCard,
  GraduationCap,
  ArrowRightLeft,
  Globe,
  Wallet,
  Building2,
  Plane,
  IndianRupee,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  kyc_status: string;
  created_at: string;
}

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
  beneficiary_id: string | null;
}

const serviceConfig: { 
  key: ServiceType;
  label: string; 
  icon: typeof Send; 
  route: string;
  description: string;
  color: string;
}[] = [
  { 
    key: "currency_exchange",
    label: "Buy / Sell Forex", 
    icon: ArrowRightLeft, 
    route: "/currency-exchange",
    description: "Exchange foreign currency",
    color: "bg-blue-500",
  },
  { 
    key: "remittance",
    label: "International Remittance", 
    icon: Globe, 
    route: "/remittance",
    description: "Send money abroad",
    color: "bg-emerald-500",
  },
  { 
    key: "forex_card",
    label: "Forex Card", 
    icon: CreditCard, 
    route: "/forex-cards",
    description: "Multi-currency travel card",
    color: "bg-purple-500",
  },
  { 
    key: "education_loan",
    label: "Education Loan", 
    icon: GraduationCap, 
    route: "/education-loan",
    description: "Study abroad financing",
    color: "bg-indigo-500",
  },
];

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin } = useAdminAccess();
  const { captureIntent } = useServiceIntent();
  const { balanceAmount, refundRequests } = useRefundableBalance();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Balance modals
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showUseBalanceModal, setShowUseBalanceModal] = useState(false);

  // Form state for profile update
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  // Calculate available balance
  const pendingRefundAmount = refundRequests
    .filter(r => r.status === "pending" || r.status === "approved")
    .reduce((sum, r) => sum + r.requested_amount, 0);
  const availableBalance = balanceAmount - pendingRefundAmount;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    if (!user) return;
    setLoading(true);
    await Promise.all([fetchProfile(), fetchTransactions()]);
    setLoading(false);
  };

  const fetchProfile = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
    } else if (data) {
      setProfile(data as Profile);
      setFullName(data.full_name || "");
      setPhone(data.phone || "");
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error fetching transactions:", error);
    } else if (data) {
      setTransactions(data as Transaction[]);
    }
  };

  const updateProfile = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone: phone })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    } else {
      toast({ title: "Profile updated", description: "Your profile has been updated successfully." });
      fetchProfile();
    }
  };

  const uploadKYCDocument = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    if (!e.target.files || !e.target.files[0] || !user) return;

    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/${docType}-${Date.now()}.${fileExt}`;

    setUploading(true);
    const { error: uploadError } = await supabase.storage
      .from("kyc-documents")
      .upload(filePath, file);

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
    } else {
      await supabase
        .from("profiles")
        .update({ kyc_status: "submitted", kyc_submitted_at: new Date().toISOString() })
        .eq("user_id", user.id);
      toast({ title: "Document uploaded", description: "Your KYC document has been submitted for verification." });
      fetchProfile();
    }
    setUploading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getKYCStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Verified</Badge>;
      case "submitted":
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" /> Under Review</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    }
  };

  if (authLoading || loading) {
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
        <title>Dashboard - RBP FINIVIS</title>
        <meta name="description" content="Manage your RBP FINIVIS account, view transactions, and access all forex services." />
      </Helmet>
      <Layout>
        <section className="py-8">
          <div className="container-custom">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
                  Welcome back, {profile?.full_name?.split(" ")[0] || "User"}
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Manage your forex services and transactions
                </p>
              </div>
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="default" size="sm">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Panel
                    </Button>
                  </Link>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">KYC:</span>
                  {getKYCStatusBadge(profile?.kyc_status || "pending")}
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>

            {/* Top Section: Available Balance + Quick Services */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              {/* Available Balance Card - Prominent */}
              <Card className="lg:col-span-1 border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Available Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-1 mb-4">
                    <IndianRupee className="h-6 w-6 text-primary" />
                    <span className="text-4xl font-bold text-primary">
                      {availableBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  {pendingRefundAmount > 0 && (
                    <p className="text-xs text-muted-foreground mb-3">
                      ₹{pendingRefundAmount.toLocaleString()} pending refund
                    </p>
                  )}

                  {availableBalance > 0 && (
                    <div className="space-y-2">
                      <Button 
                        className="w-full justify-between" 
                        size="sm"
                        onClick={() => setShowUseBalanceModal(true)}
                      >
                        Use for new transaction
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowRefundForm(true)}
                        >
                          <Building2 className="h-3 w-3 mr-1" />
                          Bank Refund
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowHistory(true)}
                        >
                          <History className="h-3 w-3 mr-1" />
                          History
                        </Button>
                      </div>
                    </div>
                  )}

                  {availableBalance === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Credits from cancelled or failed transactions will appear here
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Services Grid */}
              <div className="lg:col-span-2">
                <h2 className="text-sm font-medium text-muted-foreground mb-3">Our Services</h2>
                <div className="grid grid-cols-2 gap-3">
                  {serviceConfig.map((service) => (
                    <Card 
                      key={service.key}
                      className="cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all group"
                      onClick={() => {
                        captureIntent(service.key);
                        navigate(service.route);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`h-10 w-10 rounded-xl ${service.color} flex items-center justify-center shrink-0`}>
                            <service.icon className="h-5 w-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm group-hover:text-primary transition-colors">
                              {service.label}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {service.description}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Travel Insurance */}
                  <Card 
                    className="cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all group col-span-2 sm:col-span-1"
                    onClick={() => navigate("/travel-insurance")}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
                          <Plane className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm group-hover:text-primary transition-colors">
                            Travel Insurance
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            Coverage for your trips
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Live Order Tracking */}
            <div className="mb-8">
              <LiveOrderTracker limit={5} />
            </div>

            {/* Refundable Balance Info Card - Show only if has balance */}
            {balanceAmount > 0 && (
              <div className="mb-8">
                <RefundableBalanceCard />
              </div>
            )}

            {/* Unified Services View - All services in one place */}
            <div className="mb-8">
              <UnifiedServicesView />
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="flex-wrap h-auto gap-1 p-1">
                <TabsTrigger value="profile" className="gap-2 text-xs sm:text-sm">
                  <User className="h-4 w-4" /> Profile
                </TabsTrigger>
                <TabsTrigger value="kyc" className="gap-2 text-xs sm:text-sm">
                  <Shield className="h-4 w-4" /> KYC
                </TabsTrigger>
                <TabsTrigger value="beneficiaries" className="gap-2 text-xs sm:text-sm">
                  <Users className="h-4 w-4" /> Recipients
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-2 text-xs sm:text-sm">
                  <History className="h-4 w-4" /> History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Full Name</Label>
                        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-2" />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input value={user?.email || ""} disabled className="mt-2 bg-muted" />
                      </div>
                      <div>
                        <Label>Phone Number</Label>
                        <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-2" placeholder="+91 XXXXX XXXXX" />
                      </div>
                      <div>
                        <Label>Member Since</Label>
                        <Input value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : ""} disabled className="mt-2 bg-muted" />
                      </div>
                    </div>
                    <Button onClick={updateProfile}>Save Changes</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="kyc">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      KYC Verification
                    </CardTitle>
                    <CardDescription>
                      Upload your identity documents for verification. This is required for transactions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                      <span className="text-sm">Current Status:</span>
                      {getKYCStatusBadge(profile?.kyc_status || "pending")}
                    </div>

                    {profile?.kyc_status === "pending" && (
                      <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                        <p className="text-sm font-medium text-orange-700 dark:text-orange-300 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Action Required: Upload your identity documents
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                        <p className="font-medium mb-1">PAN Card</p>
                        <p className="text-sm text-muted-foreground mb-4">Upload a clear photo of your PAN card</p>
                        <Label htmlFor="pan-upload" className="cursor-pointer">
                          <Button variant="outline" disabled={uploading} asChild>
                            <span>{uploading ? "Uploading..." : "Upload PAN"}</span>
                          </Button>
                        </Label>
                        <Input id="pan-upload" type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => uploadKYCDocument(e, "pan")} />
                      </div>

                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                        <p className="font-medium mb-1">Aadhaar Card</p>
                        <p className="text-sm text-muted-foreground mb-4">Upload front and back of your Aadhaar</p>
                        <Label htmlFor="aadhaar-upload" className="cursor-pointer">
                          <Button variant="outline" disabled={uploading} asChild>
                            <span>{uploading ? "Uploading..." : "Upload Aadhaar"}</span>
                          </Button>
                        </Label>
                        <Input id="aadhaar-upload" type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => uploadKYCDocument(e, "aadhaar")} />
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Your documents are encrypted and securely stored. We comply with all RBI & FEMA regulations.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="beneficiaries">
                <Card>
                  <CardHeader>
                    <CardTitle>Recipient Management</CardTitle>
                    <CardDescription>Add and manage recipients for your transfers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BeneficiaryManagement />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Transaction History</span>
                      <div className="flex gap-2">
                        <TransactionExport transactions={transactions} />
                        <Button variant="outline" size="sm" onClick={fetchTransactions}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>View all your past transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {transactions.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No transactions yet</p>
                        <p className="text-sm">Your transaction history will appear here</p>
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2">
                        {transactions.map((tx) => (
                          <TransactionStatusCard
                            key={tx.id}
                            referenceNumber={tx.reference_number || tx.id.slice(0, 8)}
                            type={tx.transaction_type as any}
                            status={tx.status as any}
                            sourceAmount={tx.source_amount}
                            sourceCurrency={tx.source_currency}
                            destinationAmount={tx.destination_amount}
                            destinationCurrency={tx.destination_currency}
                            exchangeRate={tx.exchange_rate || undefined}
                            feeAmount={tx.fee_amount || undefined}
                            timestamp={tx.created_at}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </Layout>

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

export default Dashboard;
