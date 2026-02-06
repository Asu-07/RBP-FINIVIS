import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  CheckCircle,
  Clock,
  Eye,
  Loader2,
  MessageSquare,
  Mail,
  Phone,
  RefreshCw,
  User,
} from "lucide-react";
import { format } from "date-fns";

interface ContactSubmission {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  admin_notes: string | null;
  resolved_at: string | null;
  created_at: string;
}

export function ContactSubmissionsAdmin() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to fetch contact submissions");
    } else {
      setSubmissions((data as ContactSubmission[]) || []);
    }
    setLoading(false);
  };

  const openDetails = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setAdminNotes(submission.admin_notes || "");
    setDetailsDialogOpen(true);
  };

  const updateStatus = async (status: string) => {
    if (!selectedSubmission) return;
    setUpdating(true);

    const updateData: Record<string, unknown> = {
      status,
      admin_notes: adminNotes || null,
    };

    if (status === "resolved") {
      updateData.resolved_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("contact_submissions")
      .update(updateData)
      .eq("id", selectedSubmission.id);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Enquiry marked as ${status}`);
      setDetailsDialogOpen(false);
      fetchSubmissions();
    }
    setUpdating(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return <Badge className="bg-success"><CheckCircle className="h-3 w-3 mr-1" /> Resolved</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500"><Clock className="h-3 w-3 mr-1" /> In Progress</Badge>;
      default:
        return <Badge className="bg-yellow-500"><MessageSquare className="h-3 w-3 mr-1" /> New</Badge>;
    }
  };

  const filteredSubmissions = submissions.filter((s) => {
    return statusFilter === "all" || s.status === statusFilter;
  });

  const newCount = submissions.filter(s => s.status === "new").length;
  const inProgressCount = submissions.filter(s => s.status === "in_progress").length;

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
      <div className="grid grid-cols-3 gap-4">
        <Card className={newCount > 0 ? "border-yellow-500/50 bg-yellow-500/5" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">New Enquiries</p>
                <p className="text-xl font-bold">{newCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">In Progress</p>
                <p className="text-xl font-bold">{inProgressCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-bold">{submissions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchSubmissions}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Submissions</CardTitle>
          <CardDescription>Manage customer enquiries and support requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="text-xs">
                    {format(new Date(submission.created_at), "dd MMM yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{submission.full_name}</p>
                      <p className="text-xs text-muted-foreground">{submission.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-48 truncate">{submission.subject}</TableCell>
                  <TableCell>{getStatusBadge(submission.status)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => openDetails(submission)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredSubmissions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No enquiries found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Enquiry Details</DialogTitle>
            <DialogDescription>
              {selectedSubmission && format(new Date(selectedSubmission.created_at), "dd MMM yyyy HH:mm")}
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedSubmission.full_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedSubmission.email}</span>
                </div>
                {selectedSubmission.phone && (
                  <div className="flex items-center gap-2 col-span-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedSubmission.phone}</span>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Subject</p>
                <p className="text-sm text-muted-foreground">{selectedSubmission.subject}</p>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Message</p>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  {selectedSubmission.message}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Admin Notes</p>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            {selectedSubmission?.status !== "resolved" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => updateStatus("in_progress")}
                  disabled={updating}
                >
                  Mark In Progress
                </Button>
                <Button
                  onClick={() => updateStatus("resolved")}
                  disabled={updating}
                  className="bg-success hover:bg-success/90"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Resolved
                </Button>
              </>
            )}
            {selectedSubmission?.status === "resolved" && (
              <Badge className="bg-success">Resolved</Badge>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
