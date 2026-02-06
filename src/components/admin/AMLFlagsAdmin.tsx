import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  AlertTriangle, 
  RefreshCw, 
  Eye,
  CheckCircle,
  Clock,
  Shield,
  TrendingUp,
  Repeat,
  Globe,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AMLFlag {
  id: string;
  user_id: string;
  transaction_id: string | null;
  currency_exchange_order_id: string | null;
  flag_type: string;
  flag_reason: string;
  severity: string;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  profile?: {
    full_name: string | null;
    email: string | null;
  };
}

export function AMLFlagsAdmin() {
  const [loading, setLoading] = useState(true);
  const [flags, setFlags] = useState<AMLFlag[]>([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [selectedFlag, setSelectedFlag] = useState<AMLFlag | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchFlags();
  }, [statusFilter, severityFilter]);

  const fetchFlags = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('aml_flags')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter);
      }
      if (severityFilter !== "all") {
        query = query.eq('severity', severityFilter);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;

      // Fetch profiles for each flag
      const flagsWithProfiles = await Promise.all(
        (data || []).map(async (flag) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', flag.user_id)
            .maybeSingle();
          return { ...flag, profile: profile || undefined };
        })
      );

      setFlags(flagsWithProfiles);
    } catch (error: any) {
      console.error('AML flags fetch error:', error);
      toast.error('Failed to fetch AML flags');
    } finally {
      setLoading(false);
    }
  };

  const openReviewDialog = (flag: AMLFlag) => {
    setSelectedFlag(flag);
    setReviewNotes(flag.review_notes || "");
    setReviewDialogOpen(true);
  };

  const updateFlagStatus = async (status: string) => {
    if (!selectedFlag) return;
    setUpdating(true);

    try {
      const { error } = await supabase
        .from('aml_flags')
        .update({
          status,
          review_notes: reviewNotes,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', selectedFlag.id);

      if (error) throw error;

      toast.success(`Flag marked as ${status}`);
      setReviewDialogOpen(false);
      fetchFlags();
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error('Failed to update flag');
    } finally {
      setUpdating(false);
    }
  };

  const getFlagTypeIcon = (type: string) => {
    switch (type) {
      case 'high_value':
        return <TrendingUp className="h-4 w-4" />;
      case 'repeated':
        return <Repeat className="h-4 w-4" />;
      case 'unusual_country':
        return <Globe className="h-4 w-4" />;
      case 'limit_near':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Medium</Badge>;
      default:
        return <Badge variant="outline">Low</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'reviewed':
        return <Badge variant="outline"><CheckCircle className="h-3 w-3 mr-1" />Reviewed</Badge>;
      case 'cleared':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Cleared</Badge>;
      case 'escalated':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Escalated</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const pendingCount = flags.filter(f => f.status === 'pending').length;
  const highSeverityCount = flags.filter(f => f.severity === 'high' && f.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {highSeverityCount > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">
                  {highSeverityCount} High Severity Alert{highSeverityCount > 1 ? 's' : ''} Pending Review
                </p>
                <p className="text-sm text-muted-foreground">
                  Immediate review recommended for compliance
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                AML Risk Flags
              </CardTitle>
              <CardDescription>
                {pendingCount} pending review{pendingCount !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="cleared">Cleared</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={fetchFlags}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Flag Type</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flags.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No AML flags found
                      </TableCell>
                    </TableRow>
                  ) : (
                    flags.map((flag) => (
                      <TableRow key={flag.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getFlagTypeIcon(flag.flag_type)}
                            <span className="capitalize">{flag.flag_type.replace(/_/g, ' ')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">
                              {flag.profile?.full_name || 'Unknown'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {flag.profile?.email || flag.user_id.slice(0, 8)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <p className="text-sm truncate">{flag.flag_reason}</p>
                        </TableCell>
                        <TableCell>{getSeverityBadge(flag.severity)}</TableCell>
                        <TableCell>{getStatusBadge(flag.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(flag.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openReviewDialog(flag)}
                          >
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
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review AML Flag</DialogTitle>
            <DialogDescription>
              Review and update the status of this AML flag
            </DialogDescription>
          </DialogHeader>
          {selectedFlag && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Flag Type</p>
                  <div className="flex items-center gap-2 font-medium capitalize">
                    {getFlagTypeIcon(selectedFlag.flag_type)}
                    {selectedFlag.flag_type.replace(/_/g, ' ')}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Severity</p>
                  {getSeverityBadge(selectedFlag.severity)}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">User</p>
                <p className="font-medium">{selectedFlag.profile?.full_name || 'Unknown'}</p>
                <p className="text-sm text-muted-foreground">{selectedFlag.profile?.email}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Flag Reason</p>
                <p className="text-sm">{selectedFlag.flag_reason}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Review Notes</p>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add review notes..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => updateFlagStatus('reviewed')}
              disabled={updating}
            >
              Mark Reviewed
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => updateFlagStatus('cleared')}
              disabled={updating}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Clear Flag
            </Button>
            <Button
              variant="destructive"
              onClick={() => updateFlagStatus('escalated')}
              disabled={updating}
            >
              <AlertTriangle className="h-4 w-4 mr-1" />
              Escalate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
