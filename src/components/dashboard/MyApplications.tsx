import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ServiceStatusTracker } from "./ServiceStatusTracker";
import { ServiceApplication } from "@/hooks/useServiceIntent";
import {
  ClipboardList,
  CreditCard,
  GraduationCap,
  Send,
  ArrowRightLeft,
  AlertTriangle,
  Eye,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
} from "lucide-react";

interface MyApplicationsProps {
  applications: ServiceApplication[];
}

const serviceIcons: Record<string, typeof CreditCard> = {
  forex_card: CreditCard,
  education_loan: GraduationCap,
  send_money: Send,
  remittance: Send,
  currency_exchange: ArrowRightLeft,
};

const serviceLabels: Record<string, string> = {
  forex_card: "Forex Card",
  education_loan: "Education Loan",
  send_money: "Send Money",
  remittance: "International Remittance",
  currency_exchange: "Currency Exchange",
};

const serviceRoutes: Record<string, string> = {
  forex_card: "/forex-card-apply",
  education_loan: "/education-loan-apply",
  send_money: "/send-money",
  remittance: "/remittance",
  currency_exchange: "/currency-exchange",
};

export const MyApplications = ({ applications }: MyApplicationsProps) => {
  const navigate = useNavigate();
  const [selectedApp, setSelectedApp] = useState<ServiceApplication | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-success"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (applications.length === 0) {
    return null;
  }

  // Separate applications needing action
  const actionRequiredApps = applications.filter(a => a.action_required);
  const otherApps = applications.filter(a => !a.action_required);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            My Applications
          </CardTitle>
          <CardDescription>
            Track the status of your service applications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Action Required Section */}
          {actionRequiredApps.length > 0 && (
            <div className="mb-4">
              {actionRequiredApps.map((app) => {
                const Icon = serviceIcons[app.service_type] || ClipboardList;
                return (
                  <div
                    key={app.id}
                    className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg mb-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center shrink-0">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-medium text-orange-900 dark:text-orange-100">
                            {serviceLabels[app.service_type] || app.service_type}
                          </h4>
                          {getStatusBadge(app.application_status)}
                        </div>
                        <p className="text-sm text-orange-800 dark:text-orange-200 mb-2">
                          🔴 {app.action_required}
                        </p>
                        <Button
                          size="sm"
                          className="bg-orange-600 hover:bg-orange-700"
                          onClick={() => navigate(serviceRoutes[app.service_type] || "/dashboard")}
                        >
                          Take Action
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Other Applications */}
          <div className="space-y-3">
            {otherApps.map((app) => {
              const Icon = serviceIcons[app.service_type] || ClipboardList;
              return (
                <div
                  key={app.id}
                  className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedApp(app)}
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-medium">
                        {serviceLabels[app.service_type] || app.service_type}
                      </h4>
                      {getStatusBadge(app.application_status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-mono">#{app.id.slice(0, 8).toUpperCase()}</span>
                      <span>•</span>
                      <span>{formatDate(app.submitted_at || app.created_at)}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              );
            })}
          </div>

          {applications.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No applications yet</p>
              <p className="text-sm">Apply for services to see them here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Details Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedApp && (
                <>
                  {(() => {
                    const Icon = serviceIcons[selectedApp.service_type] || ClipboardList;
                    return <Icon className="h-5 w-5" />;
                  })()}
                  {serviceLabels[selectedApp?.service_type || ""] || selectedApp?.service_type}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Application ID: #{selectedApp?.id.slice(0, 8).toUpperCase()}
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-4">
              <ServiceStatusTracker
                referenceId={selectedApp.id.slice(0, 8).toUpperCase()}
                serviceType={selectedApp.service_type}
                status={selectedApp.application_status}
                rejectionReason={selectedApp.rejection_reason || undefined}
                actionRequired={selectedApp.action_required || undefined}
              />

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedApp(null)}
                >
                  Close
                </Button>
                {selectedApp.application_status === "action_required" && (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setSelectedApp(null);
                      navigate(serviceRoutes[selectedApp.service_type] || "/dashboard");
                    }}
                  >
                    Take Action
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
