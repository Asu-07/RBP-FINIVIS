import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Search, 
  RefreshCw, 
  History,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Shield,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AuditLog {
  id: string;
  admin_user_id: string;
  action_type: string;
  target_type: string;
  target_id: string;
  old_values: unknown;
  new_values: unknown;
  reason: string | null;
  ip_address: string | null;
  created_at: string;
  admin_profile?: {
    full_name: string | null;
    email: string | null;
  };
}

export function AdminAuditLogs() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateRange, setDateRange] = useState("7");

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, dateRange]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (actionFilter !== "all") {
        query = query.eq('action_type', actionFilter);
      }

      // Date filter
      if (dateRange !== "all") {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));
        query = query.gte('created_at', daysAgo.toISOString());
      }

      const { data, error } = await query.limit(200);

      if (error) throw error;

      // Fetch admin profiles
      const logsWithProfiles = await Promise.all(
        (data || []).map(async (log) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', log.admin_user_id)
            .maybeSingle();
          return { ...log, admin_profile: profile || undefined };
        })
      );

      setLogs(logsWithProfiles);
    } catch (error: any) {
      console.error('Audit logs fetch error:', error);
      toast.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = () => {
    const headers = ['Date', 'Admin', 'Action', 'Target Type', 'Target ID', 'Reason'];
    const rows = logs.map((log) => [
      new Date(log.created_at).toLocaleString(),
      log.admin_profile?.email || log.admin_user_id,
      log.action_type,
      log.target_type,
      log.target_id,
      log.reason || '',
    ]);

    const csvContent = [headers, ...rows].map((row) => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Audit logs exported');
  };

  const getActionBadge = (action: string) => {
    if (action.includes('approve') || action.includes('verified')) {
      return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />{action}</Badge>;
    }
    if (action.includes('reject') || action.includes('denied')) {
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />{action}</Badge>;
    }
    if (action.includes('view') || action.includes('read')) {
      return <Badge variant="outline"><Eye className="h-3 w-3 mr-1" />{action}</Badge>;
    }
    return <Badge variant="secondary">{action}</Badge>;
  };

  const filteredLogs = logs.filter(
    (log) =>
      log.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.admin_profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.admin_profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Admin Audit Logs
            </CardTitle>
            <CardDescription>
              Complete audit trail of all admin actions
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last 24 hours</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="kyc_approve">KYC Approve</SelectItem>
                <SelectItem value="kyc_reject">KYC Reject</SelectItem>
                <SelectItem value="transaction_approve">Tx Approve</SelectItem>
                <SelectItem value="transaction_reject">Tx Reject</SelectItem>
                <SelectItem value="service_approve">Service Approve</SelectItem>
                <SelectItem value="service_reject">Service Reject</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchLogs}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={exportLogs}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by action, target, admin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

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
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">
                            {log.admin_profile?.full_name || 'Admin'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {log.admin_profile?.email || log.admin_user_id.slice(0, 8)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getActionBadge(log.action_type)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm capitalize">{log.target_type}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {log.target_id.slice(0, 8)}...
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="text-sm truncate text-muted-foreground">
                          {log.reason || '—'}
                        </p>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Compliance Note */}
        <div className="mt-4 flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
          <Shield className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            All admin actions are logged for RBI compliance and audit purposes. Logs are retained for 7 years as per regulatory requirements.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
