import { useLRSUsage } from "@/hooks/useLRSUsage";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Shield, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface LRSLimitTrackerProps {
  compact?: boolean;
  showDetails?: boolean;
}

export function LRSLimitTracker({ compact = false, showDetails = true }: LRSLimitTrackerProps) {
  const { lrsData, loading, error } = useLRSUsage();

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-2 w-full" />
      </div>
    );
  }

  if (error || !lrsData) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <AlertTriangle className="h-4 w-4" />
        <span>Unable to fetch LRS limit</span>
      </div>
    );
  }

  const { totalUsed, remainingLimit, usagePercentage, financialYear, transactionCount } = lrsData;
  
  const getStatusColor = () => {
    if (usagePercentage >= 90) return "destructive";
    if (usagePercentage >= 70) return "warning";
    return "success";
  };

  const getStatusIcon = () => {
    if (usagePercentage >= 90) return <AlertTriangle className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
        <Shield className="h-5 w-5 text-primary" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">LRS Limit (FY {financialYear})</span>
            <span className="font-medium">{usagePercentage.toFixed(1)}% used</span>
          </div>
          <Progress value={usagePercentage} className="h-1.5" />
        </div>
        <Badge variant={getStatusColor() === "success" ? "outline" : "destructive"} className="shrink-0">
          ${remainingLimit.toLocaleString()} left
        </Badge>
      </div>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <h4 className="font-medium text-sm">LRS Limit Tracker</h4>
              <p className="text-xs text-muted-foreground">FY {financialYear}</p>
            </div>
          </div>
          <Badge variant={getStatusColor() === "success" ? "outline" : (getStatusColor() === "warning" ? "secondary" : "destructive")}>
            {getStatusIcon()}
            <span className="ml-1">{usagePercentage.toFixed(1)}%</span>
          </Badge>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Used</span>
              <span className="font-medium">${totalUsed.toLocaleString()}</span>
            </div>
            <Progress 
              value={usagePercentage} 
              className={`h-2 ${usagePercentage >= 90 ? '[&>div]:bg-destructive' : usagePercentage >= 70 ? '[&>div]:bg-yellow-500' : ''}`} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Remaining</span>
              <p className="font-semibold text-lg text-primary">${remainingLimit.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Annual Limit</span>
              <p className="font-semibold text-lg">$250,000</p>
            </div>
          </div>

          {showDetails && (
            <>
              <div className="pt-3 border-t text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transactions this FY</span>
                  <span>{transactionCount}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <p>
                  As per RBI's Liberalised Remittance Scheme (LRS), resident individuals can remit up to USD 2,50,000 per financial year for permitted purposes.
                </p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
