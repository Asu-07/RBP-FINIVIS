import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle, FileText, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface KYCGateMessageProps {
  kycStatus: string | null;
  variant?: "inline" | "card" | "banner";
  showCTA?: boolean;
  context?: string;
}

export function KYCGateMessage({ 
  kycStatus, 
  variant = "card",
  showCTA = true,
  context = "proceed with this transaction"
}: KYCGateMessageProps) {
  const navigate = useNavigate();

  const getStatusInfo = () => {
    switch (kycStatus) {
      case "verified":
        return {
          icon: CheckCircle,
          title: "KYC Verified",
          message: "Your identity is verified. You can proceed with all services.",
          color: "text-green-600",
          bgColor: "bg-green-50 dark:bg-green-950/20",
          borderColor: "border-green-200 dark:border-green-800",
        };
      case "submitted":
        return {
          icon: FileText,
          title: "KYC Under Review",
          message: "Your documents are being verified. This usually takes 1-2 business hours.",
          color: "text-yellow-600",
          bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
          borderColor: "border-yellow-200 dark:border-yellow-800",
        };
      case "rejected":
        return {
          icon: AlertTriangle,
          title: "KYC Rejected",
          message: "Your KYC documents were rejected. Please re-upload valid documents.",
          color: "text-red-600",
          bgColor: "bg-red-50 dark:bg-red-950/20",
          borderColor: "border-red-200 dark:border-red-800",
        };
      default:
        return {
          icon: Shield,
          title: "KYC Required",
          message: `Complete KYC verification to ${context}. This is mandatory as per RBI regulations.`,
          color: "text-orange-600",
          bgColor: "bg-orange-50 dark:bg-orange-950/20",
          borderColor: "border-orange-200 dark:border-orange-800",
        };
    }
  };

  const info = getStatusInfo();
  const Icon = info.icon;

  if (variant === "inline") {
    return (
      <div className={`flex items-start gap-3 p-4 rounded-lg ${info.bgColor} border ${info.borderColor}`}>
        <Icon className={`h-5 w-5 ${info.color} shrink-0 mt-0.5`} />
        <div className="flex-1">
          <p className={`font-medium ${info.color}`}>{info.title}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{info.message}</p>
          {showCTA && kycStatus !== "verified" && kycStatus !== "submitted" && (
            <Button 
              variant="link" 
              className="p-0 h-auto mt-2"
              onClick={() => navigate("/dashboard?tab=kyc")}
            >
              Complete KYC <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (variant === "banner") {
    if (kycStatus === "verified") return null;
    
    return (
      <div className={`w-full p-3 ${info.bgColor} border-b ${info.borderColor} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${info.color}`} />
          <span className="text-sm font-medium">{info.title}:</span>
          <span className="text-sm text-muted-foreground">{info.message}</span>
        </div>
        {showCTA && kycStatus !== "submitted" && (
          <Button size="sm" variant="outline" onClick={() => navigate("/dashboard?tab=kyc")}>
            Complete KYC
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={`${info.borderColor} ${info.bgColor}`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className={`h-12 w-12 rounded-full ${info.bgColor} flex items-center justify-center`}>
            <Icon className={`h-6 w-6 ${info.color}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-semibold ${info.color}`}>{info.title}</h3>
              <Badge variant="outline" className="text-xs">RBI Mandatory</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{info.message}</p>
            {showCTA && kycStatus !== "verified" && kycStatus !== "submitted" && (
              <Button 
                className="mt-4"
                onClick={() => navigate("/dashboard?tab=kyc")}
              >
                <Shield className="h-4 w-4 mr-2" />
                Complete KYC Verification
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
