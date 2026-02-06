import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DocumentViewer } from "./DocumentViewer";
import {
  CreditCard,
  Search,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  FileText,
  AlertTriangle,
  DollarSign,
  Plus,
} from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  kyc_status: string | null;
}

interface ForexCardApplication {
  id: string;
  user_id: string;
  service_type: string;
  application_status: string;
  application_data: Record<string, unknown> | null;
  documents: unknown[] | null;
  load_amount: number | null;
  load_currency: string | null;
  usd_equivalent: number | null;
  admin_notes: string | null;
  action_required: string | null;
  rejection_reason: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  created_at: string;
  updated_at: string;
  profile?: Profile | null;
}

export const ForexCardAdmin = () => {
  const [applications, setApplications] = useState<ForexCardApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Dialog state
  const [selectedApp, setSelectedApp] = useState<ForexCardApplication | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionRequired, setActionRequired] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("service_applications")
        .select("*")
        .eq("service_type", "forex_card")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles
      const appsWithProfiles = await Promise.all(
        (data || []).map(async (app) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", app.user_id)
            .maybeSingle();
          return { ...app, profile: profileData } as ForexCardApplication;
        })
      );

      setApplications(appsWithProfiles);
    } catch (error) {
      console.error("Error fetching forex card applications:", error);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const openReview = (app: ForexCardApplication) => {
    setSelectedApp(app);
    setAdminNotes(app.admin_notes || "");
    setActionRequired(app.action_required || "");
    setRejectionReason(app.rejection_reason || "");
    setDialogOpen(true);
  };

  const updateStatus = async (status: string) => {
    if (!selectedApp) return;

    // KYC check for approval
    if (status === "approved" && selectedApp.profile?.kyc_status !== "verified") {
      toast.error("Cannot approve: User KYC is not verified. Please set status to 'Action Required' and ask user to complete KYC.");
      return;
    }

    setUpdating(true);
    try {
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

      if (error) throw error;

      toast.success(`Application ${status === "action_required" ? "updated" : status}`);
      setDialogOpen(false);
      fetchApplications();

      // Send notification email
      if (selectedApp.profile?.email) {
        supabase.functions.invoke("send-notification-email", {
          body: {
            type: `service_${status}`,
            email: selectedApp.profile.email,
            name: selectedApp.profile.full_name || "Customer",
            service_type: "forex_card",
            action_required: status === "action_required" ? actionRequired : undefined,
            rejection_reason: status === "rejected" ? rejectionReason : undefined,
          },
        }).catch(console.error);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const saveNotes = async () => {
    if (!selectedApp) return;
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("service_applications")
        .update({ admin_notes: adminNotes })
        .eq("id", selectedApp.id);

      if (error) throw error;
      toast.success("Notes saved");
      fetchApplications();
    } catch (error) {
      toast.error("Failed to save notes");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-success"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case "action_required":
        return <Badge className="bg-orange-500"><AlertTriangle className="h-3 w-3 mr-1" />Action Required</Badge>;
      case "under_review":
        return <Badge className="bg-blue-500"><Eye className="h-3 w-3 mr-1" />Under Review</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Applied</Badge>;
    }
  };

  const isTopup = (app: ForexCardApplication) => {
    return app.application_data?.is_topup === true || app.application_data?.application_type === "topup";
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      (app.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (app.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || app.application_status === statusFilter;
    const matchesType = typeFilter === "all" ||
      (typeFilter === "new" && !isTopup(app)) ||
      (typeFilter === "topup" && isTopup(app));

    return matchesSearch && matchesStatus && matchesType;
  });

  // Stats
  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.application_status === "applied" || a.application_status === "under_review").length,
    approved: applications.filter(a => a.application_status === "approved").length,
    rejected: applications.filter(a => a.application_status === "rejected").length,
    newCards: applications.filter(a => !isTopup(a)).length,
    topups: applications.filter(a => isTopup(a)).length,
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

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
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            <p className="text-xs text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.newCards}</p>
            <p className="text-xs text-muted-foreground">New Cards</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.topups}</p>
            <p className="text-xs text-muted-foreground">Top-Ups</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Forex Card Applications
          </CardTitle>
          <CardDescription>
            Manage all forex card applications and top-up requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="action_required">Action Required</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="new">New Card</SelectItem>
                <SelectItem value="topup">Top-Up</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchApplications}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>LRS (USD)</TableHead>
                  <TableHead>KYC</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No applications found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{app.profile?.full_name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{app.profile?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={isTopup(app) ? "border-blue-500 text-blue-500" : "border-purple-500 text-purple-500"}>
                          {isTopup(app) ? (
                            <><Plus className="h-3 w-3 mr-1" />Top-Up</>
                          ) : (
                            <><CreditCard className="h-3 w-3 mr-1" />New Card</>
                          )}
                        </Badge>
                        {isTopup(app) && app.application_data?.card_number_masked && (
                          <p className="text-xs text-muted-foreground mt-1 font-mono">
                            {String(app.application_data.card_number_masked)}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        {app.load_amount ? (
                          <span className="font-mono">
                            {app.load_currency} {app.load_amount?.toLocaleString()}
                          </span>
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          ${app.usd_equivalent?.toLocaleString() || "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {app.profile?.kyc_status === "verified" ? (
                          <Badge className="bg-success text-xs"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs"><Clock className="h-3 w-3 mr-1" />{app.profile?.kyc_status || "Pending"}</Badge>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(app.application_status)}</TableCell>
                      <TableCell className="text-sm">{formatDate(app.submitted_at || app.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => openReview(app)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {selectedApp && isTopup(selectedApp) ? "Forex Card Top-Up Review" : "Forex Card Application Review"}
            </DialogTitle>
            <DialogDescription>
              Application ID: #{selectedApp?.id.slice(0, 8).toUpperCase()}
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <Tabs defaultValue="details" className="mt-4">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="lrs">LRS Usage</TabsTrigger>
                <TabsTrigger value="actions">Admin Actions</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Applicant</p>
                    <p className="font-medium">{selectedApp.profile?.full_name || "Unknown"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm">{selectedApp.profile?.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm">{selectedApp.profile?.phone || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">KYC Status</p>
                    {selectedApp.profile?.kyc_status === "verified" ? (
                      <Badge className="bg-success"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>
                    ) : (
                      <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />{selectedApp.profile?.kyc_status || "Pending"}</Badge>
                    )}
                  </div>
                </div>

                <hr />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Application Type</p>
                    <Badge variant="outline">
                      {isTopup(selectedApp) ? "Top-Up Request" : "New Card Application"}
                    </Badge>
                  </div>
                  {isTopup(selectedApp) && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Card Number</p>
                      <p className="font-mono">{String(selectedApp.application_data?.card_number_masked || "-")}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Load Amount</p>
                    <p className="font-medium">
                      {selectedApp.load_currency} {selectedApp.load_amount?.toLocaleString() || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">USD Equivalent (LRS)</p>
                    <p className="font-medium">${selectedApp.usd_equivalent?.toLocaleString() || "-"}</p>
                  </div>
                </div>

                {!isTopup(selectedApp) && selectedApp.application_data && (
                  <>
                    <hr />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Travel Purpose</p>
                        <p>{String(selectedApp.application_data.travelPurpose || "-")}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Destination</p>
                        <p>{String(selectedApp.application_data.destinationCountry || "-")}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Card Type</p>
                        <p>{String(selectedApp.application_data.cardType || "-")}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Travel Date</p>
                        <p>{String(selectedApp.application_data.travelDate || "-")}</p>
                      </div>
                      <div className="col-span-2 space-y-1">
                        <p className="text-xs text-muted-foreground">Address</p>
                        <p className="text-sm">
                          {String(selectedApp.application_data.address || "")}, {String(selectedApp.application_data.city || "")}, {String(selectedApp.application_data.pincode || "")}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {selectedApp.application_data?.declaration_accepted && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      FEMA Declaration accepted on {new Date(String(selectedApp.application_data.declaration_timestamp)).toLocaleString()}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="documents">
                <DocumentViewer
                  userId={selectedApp.user_id}
                  serviceType="forex_card"
                  orderId={selectedApp.id}
                  orderDate={selectedApp.submitted_at || selectedApp.created_at}
                  compact
                />
              </TabsContent>

              <TabsContent value="lrs">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">LRS Tracking for this Application</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Amount (USD Equivalent)</p>
                      <p className="text-2xl font-bold">${selectedApp.usd_equivalent?.toLocaleString() || "0"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Counts Towards</p>
                      <p className="text-sm">$250,000 Annual LRS Limit</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Each forex card application or top-up is tracked separately against the user's annual LRS limit.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="actions" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Admin Notes</label>
                  <Textarea
                    placeholder="Internal notes (not visible to customer)"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                  />
                  <Button size="sm" variant="outline" onClick={saveNotes} disabled={updating}>
                    Save Notes
                  </Button>
                </div>

                {selectedApp.application_status !== "approved" && selectedApp.application_status !== "rejected" && (
                  <>
                    <hr />

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Action Required Message</label>
                      <Textarea
                        placeholder="Message to show customer (e.g., 'Please upload a clearer photo of your ID')"
                        value={actionRequired}
                        onChange={(e) => setActionRequired(e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Rejection Reason (if rejecting)</label>
                      <Textarea
                        placeholder="Reason for rejection"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        className="flex-1 bg-success hover:bg-success/90"
                        onClick={() => updateStatus("approved")}
                        disabled={updating || selectedApp.profile?.kyc_status !== "verified"}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        className="flex-1"
                        variant="outline"
                        onClick={() => updateStatus("action_required")}
                        disabled={updating || !actionRequired}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Request Action
                      </Button>
                      <Button
                        className="flex-1"
                        variant="destructive"
                        onClick={() => updateStatus("rejected")}
                        disabled={updating || !rejectionReason}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>

                    {selectedApp.profile?.kyc_status !== "verified" && (
                      <p className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Approval blocked: User KYC not verified
                      </p>
                    )}
                  </>
                )}

                {selectedApp.application_status === "approved" && (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      This application was approved on {formatDate(selectedApp.approved_at)}
                    </p>
                  </div>
                )}

                {selectedApp.application_status === "rejected" && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2 mb-2">
                      <XCircle className="h-4 w-4" />
                      This application was rejected on {formatDate(selectedApp.rejected_at)}
                    </p>
                    {selectedApp.rejection_reason && (
                      <p className="text-sm text-muted-foreground">Reason: {selectedApp.rejection_reason}</p>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
