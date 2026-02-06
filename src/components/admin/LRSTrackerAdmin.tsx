import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Shield, 
  AlertTriangle, 
  TrendingUp,
  Download,
  Users,
  DollarSign,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface LRSUserData {
  userId: string;
  email: string;
  fullName: string;
  totalUsed: number;
  remainingLimit: number;
  usagePercentage: number;
  transactionCount: number;
  lastTransaction: string | null;
}

interface LRSTransaction {
  id: string;
  user_id: string;
  service_type: string;
  amount_usd: number;
  purpose: string;
  transaction_date: string;
  created_at: string;
}

export function LRSTrackerAdmin() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [financialYear, setFinancialYear] = useState<string>("");
  const [lrsData, setLrsData] = useState<LRSUserData[]>([]);
  const [transactions, setTransactions] = useState<LRSTransaction[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVolume: 0,
    avgUsage: 0,
    highRiskUsers: 0,
  });

  useEffect(() => {
    fetchCurrentFY();
  }, []);

  useEffect(() => {
    if (financialYear) {
      fetchLRSData();
    }
  }, [financialYear]);

  const fetchCurrentFY = async () => {
    const { data } = await supabase.rpc('get_current_financial_year');
    setFinancialYear(data || '2025-26');
  };

  const fetchLRSData = async () => {
    setLoading(true);
    try {
      // Fetch all LRS usage grouped by user
      const { data: usageData, error } = await supabase
        .from('lrs_usage')
        .select('*')
        .eq('financial_year', financialYear)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by user
      const userMap: Record<string, { total: number; count: number; last: string | null }> = {};
      (usageData || []).forEach((item) => {
        if (!userMap[item.user_id]) {
          userMap[item.user_id] = { total: 0, count: 0, last: null };
        }
        userMap[item.user_id].total += Number(item.amount_usd);
        userMap[item.user_id].count += 1;
        if (!userMap[item.user_id].last || item.transaction_date > userMap[item.user_id].last!) {
          userMap[item.user_id].last = item.transaction_date;
        }
      });

      // Fetch profiles for each user
      const userIds = Object.keys(userMap);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, email, full_name')
        .in('user_id', userIds);

      const profileMap: Record<string, { email: string; full_name: string }> = {};
      (profiles || []).forEach((p) => {
        profileMap[p.user_id] = { email: p.email || '', full_name: p.full_name || '' };
      });

      // Build LRS data
      const lrsLimit = 250000;
      const data: LRSUserData[] = userIds.map((userId) => {
        const usage = userMap[userId];
        const profile = profileMap[userId] || { email: 'Unknown', full_name: 'Unknown' };
        return {
          userId,
          email: profile.email,
          fullName: profile.full_name,
          totalUsed: usage.total,
          remainingLimit: Math.max(lrsLimit - usage.total, 0),
          usagePercentage: (usage.total / lrsLimit) * 100,
          transactionCount: usage.count,
          lastTransaction: usage.last,
        };
      });

      // Sort by usage percentage (highest first)
      data.sort((a, b) => b.usagePercentage - a.usagePercentage);

      setLrsData(data);

      // Calculate stats
      const totalVolume = data.reduce((sum, u) => sum + u.totalUsed, 0);
      const avgUsage = data.length > 0 ? totalVolume / data.length : 0;
      const highRisk = data.filter((u) => u.usagePercentage >= 80).length;

      setStats({
        totalUsers: data.length,
        totalVolume,
        avgUsage,
        highRiskUsers: highRisk,
      });

      setTransactions(usageData || []);
    } catch (error: any) {
      console.error('LRS fetch error:', error);
      toast.error('Failed to fetch LRS data');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const headers = ['User ID', 'Name', 'Email', 'Total Used (USD)', 'Remaining Limit', 'Usage %', 'Transactions'];
    const rows = lrsData.map((u) => [
      u.userId,
      u.fullName,
      u.email,
      u.totalUsed.toFixed(2),
      u.remainingLimit.toFixed(2),
      u.usagePercentage.toFixed(2) + '%',
      u.transactionCount.toString(),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LRS_Report_FY${financialYear}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  const filteredData = lrsData.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 90) {
      return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Critical</Badge>;
    }
    if (percentage >= 70) {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Warning</Badge>;
    }
    return <Badge variant="outline">Normal</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Active Users</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Volume</span>
            </div>
            <p className="text-2xl font-bold">${stats.totalVolume.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Avg. Usage</span>
            </div>
            <p className="text-2xl font-bold">${stats.avgUsage.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className={stats.highRiskUsers > 0 ? "border-destructive" : ""}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className={`h-4 w-4 ${stats.highRiskUsers > 0 ? "text-destructive" : "text-muted-foreground"}`} />
              <span className="text-sm text-muted-foreground">High Risk Users</span>
            </div>
            <p className={`text-2xl font-bold ${stats.highRiskUsers > 0 ? "text-destructive" : ""}`}>
              {stats.highRiskUsers}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                LRS Usage Tracker
              </CardTitle>
              <CardDescription>
                Track LRS limit usage per user for FY {financialYear}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={financialYear} onValueChange={setFinancialYear}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="FY" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-25">2024-25</SelectItem>
                  <SelectItem value="2025-26">2025-26</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={fetchLRSData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={exportReport}>
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
                placeholder="Search by name, email, or user ID..."
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
                    <TableHead>User</TableHead>
                    <TableHead>LRS Usage</TableHead>
                    <TableHead className="text-right">Used (USD)</TableHead>
                    <TableHead className="text-right">Remaining</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Transactions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No LRS usage data found for FY {financialYear}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((user) => (
                      <TableRow key={user.userId}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.fullName}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="w-[200px]">
                          <div className="space-y-1">
                            <Progress 
                              value={Math.min(user.usagePercentage, 100)} 
                              className={`h-2 ${user.usagePercentage >= 90 ? '[&>div]:bg-destructive' : user.usagePercentage >= 70 ? '[&>div]:bg-yellow-500' : ''}`}
                            />
                            <p className="text-xs text-muted-foreground">
                              {user.usagePercentage.toFixed(1)}% of $250,000
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ${user.totalUsed.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ${user.remainingLimit.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(user.usagePercentage)}
                        </TableCell>
                        <TableCell className="text-right">
                          {user.transactionCount}
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
    </div>
  );
}
