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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  GraduationCap,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  FileText,
  RefreshCw,
  Building2,
} from "lucide-react";
import { DocumentViewer } from "./DocumentViewer";

interface EducationLoanApplication {
  id: string;
  user_id: string;
  service_type: string;
  application_status: string;
  application_data: any;
  documents: any;
  admin_notes: string | null;
  action_required: string | null;
  rejection_reason: string | null;
  created_at: string;
  submitted_at: string | null;
}

interface Profile {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  kyc_status: string | null;
}

export function EducationLoanAdmin() {
  const [applications, setApplications] = useState<(EducationLoanApplication & { profile?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApp, setSelectedApp] = useState<(EducationLoanApplication & { profile?: Profile }) | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionRequired, setActionRequired] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("service_applications")
      .select("*")
      .eq("service_type", "education_loan")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to fetch applications");
    } else {
      // Fetch profiles for each application
      const appsWithProfiles = await Promise.all(
        (data || []).map(async (app) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, email, phone, kyc_status")
            .eq("user_id", app.user_id)
            .maybeSingle();
          return { ...app, profile: profileData || undefined };
        })
      );
      setApplications(appsWithProfiles);
    }
    setLoading(false);
  };

  const openReview = (app: EducationLoanApplication & { profile?: Profile }) => {
    setSelectedApp(app);
    setAdminNotes(app.admin_notes || "");
    setActionRequired(app.action_required || "");
    setRejectionReason(app.rejection_reason || "");
    setDialogOpen(true);
  };

  const updateStatus = async (status: string) => {
    if (!selectedApp) return;

    setUpdating(true);

    const updateData: any = {
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
      toast.error("Failed to update application");
    } else {
      toast.success(`Application ${status}`);
      setDialogOpen(false);
      fetchApplications();
    }
    setUpdating(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-success"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case "under_review":
        return <Badge className="bg-blue-500"><Eye className="h-3 w-3 mr-1" />Under Review</Badge>;
      case "action_required":
        return <Badge className="bg-orange-500"><AlertTriangle className="h-3 w-3 mr-1" />Action Required</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Applied</Badge>;
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      !searchTerm ||
      app.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.application_data?.universityName || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.application_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.application_status === "applied").length,
    approved: applications.filter(a => a.application_status === "approved").length,
    rejected: applications.filter(a => a.application_status === "rejected").length,
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disclaimer Card */}
      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
            <div>
              <p className="font-semibold text-sm">Loan Facilitation Disclaimer</p>
              <p className="text-xs text-muted-foreground">
                RBP FINIVIS does not sanction or disburse loans. Approval is solely at lender discretion.
                All applications are forwarded to partner lending institutions for processing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Education Loan Applications
              </CardTitle>
              <CardDescription>Manage and track loan facilitation requests</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchApplications}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or university..."
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
                <SelectItem value="action_required">Action Required</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>University</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Loan Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No education loan applications found
                  </TableCell>
                </TableRow>
              ) : (
                filteredApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{app.profile?.full_name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{app.profile?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{app.application_data?.universityName || "—"}</p>
                        <p className="text-xs text-muted-foreground">{app.application_data?.universityCountry}</p>
                      </div>
                    </TableCell>
                    <TableCell>{app.application_data?.courseName || "—"}</TableCell>
                    <TableCell>
                      {app.application_data?.loanCurrency || "USD"} {" "}
                      {Number(app.application_data?.loanAmount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(app.application_status)}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(app.submitted_at || app.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
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
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Education Loan Application Review
            </DialogTitle>
            <DialogDescription>
              Review application details and update status
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-6">
              {/* Disclaimer */}
              <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                <div className="flex gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    <strong>Important:</strong> RBP FINIVIS does not sanction or disburse loans.
                    Approval is solely at lender discretion.
                  </p>
                </div>
              </div>

              {/* Applicant Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Applicant</p>
                  <p className="font-medium">{selectedApp.profile?.full_name || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedApp.profile?.email || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedApp.profile?.phone || selectedApp.application_data?.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">KYC Status</p>
                  <Badge variant={selectedApp.profile?.kyc_status === "verified" ? "default" : "secondary"}>
                    {selectedApp.profile?.kyc_status || "Pending"}
                  </Badge>
                </div>
              </div>

              {/* University & Course */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  University & Course Details
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">University:</span>
                    <span className="ml-2 font-medium">{selectedApp.application_data?.universityName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Country:</span>
                    <span className="ml-2 font-medium">{selectedApp.application_data?.universityCountry}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Course:</span>
                    <span className="ml-2 font-medium">{selectedApp.application_data?.courseName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="ml-2 font-medium">{selectedApp.application_data?.courseDuration}</span>
                  </div>
                </div>
              </div>

              {/* Loan Details */}
              <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                <h4 className="font-semibold mb-3">Loan Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Requested Amount:</span>
                    <span className="ml-2 font-bold text-accent">
                      {selectedApp.application_data?.loanCurrency || "USD"} {" "}
                      {Number(selectedApp.application_data?.loanAmount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Intake Date:</span>
                    <span className="ml-2 font-medium">{selectedApp.application_data?.intakeDate}</span>
                  </div>
                  {selectedApp.application_data?.coApplicantName && (
                    <>
                      <div>
                        <span className="text-muted-foreground">Co-Applicant:</span>
                        <span className="ml-2 font-medium">{selectedApp.application_data?.coApplicantName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Relation:</span>
                        <span className="ml-2 font-medium">{selectedApp.application_data?.coApplicantRelation}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Documents */}
              {selectedApp && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Uploaded Documents
                  </h4>
                  <DocumentViewer
                    userId={selectedApp.user_id}
                    serviceType="education_loan"
                    orderId={selectedApp.id}
                    orderDate={selectedApp.submitted_at || selectedApp.created_at}
                    compact
                  />
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <label className="text-sm font-medium">Internal Admin Notes</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes..."
                  className="mt-2"
                />
              </div>

              {/* Action Required */}
              {selectedApp.application_status !== "approved" && selectedApp.application_status !== "rejected" && (
                <div>
                  <label className="text-sm font-medium">Request Action from Applicant</label>
                  <Textarea
                    value={actionRequired}
                    onChange={(e) => setActionRequired(e.target.value)}
                    placeholder="Describe what action is required..."
                    className="mt-2"
                  />
                </div>
              )}

              {/* Rejection Reason */}
              {selectedApp.application_status !== "approved" && (
                <div>
                  <label className="text-sm font-medium">Rejection Reason (if rejecting)</label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide reason for rejection..."
                    className="mt-2"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex-wrap gap-2">
            {selectedApp?.application_status !== "approved" && selectedApp?.application_status !== "rejected" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => updateStatus("under_review")}
                  disabled={updating}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Mark Under Review
                </Button>
                <Button
                  variant="outline"
                  className="border-orange-500 text-orange-500"
                  onClick={() => updateStatus("action_required")}
                  disabled={updating || !actionRequired}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Request Action
                </Button>
              </>
            )}
            <Button
              variant="destructive"
              onClick={() => updateStatus("rejected")}
              disabled={updating}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              className="bg-success hover:bg-success/90"
              onClick={() => updateStatus("approved")}
              disabled={updating}
            >
              {updating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Approve for Processing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
