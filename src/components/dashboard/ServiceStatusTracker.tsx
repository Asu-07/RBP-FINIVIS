import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Clock, 
  FileText, 
  Search, 
  XCircle,
  AlertCircle 
} from "lucide-react";

interface StatusStep {
  id: string;
  label: string;
  completed: boolean;
  current: boolean;
}

interface ServiceStatusTrackerProps {
  referenceId: string;
  serviceType: string;
  status: string;
  rejectionReason?: string;
  actionRequired?: string;
  timestamps?: {
    applied?: string;
    documentsSubmitted?: string;
    underReview?: string;
    approved?: string;
    active?: string;
    rejected?: string;
  };
}

const serviceStatusSteps: Record<string, StatusStep[]> = {
  forex_card: [
    { id: "applied", label: "Applied", completed: false, current: false },
    { id: "awaiting_payment", label: "Awaiting Payment", completed: false, current: false },
    { id: "payment_confirmed", label: "Payment Confirmed", completed: false, current: false },
    { id: "under_review", label: "Under Review", completed: false, current: false },
    { id: "approved", label: "Approved", completed: false, current: false },
    { id: "active", label: "Card Active", completed: false, current: false },
  ],
  education_loan: [
    { id: "applied", label: "Applied", completed: false, current: false },
    { id: "documents_submitted", label: "Documents Submitted", completed: false, current: false },
    { id: "under_review", label: "Under Review", completed: false, current: false },
    { id: "sanction_letter", label: "Sanction Letter", completed: false, current: false },
    { id: "disbursed", label: "Disbursed", completed: false, current: false },
  ],
  iban_account: [
    { id: "applied", label: "Applied", completed: false, current: false },
    { id: "kyc_verification", label: "KYC Verification", completed: false, current: false },
    { id: "account_setup", label: "Account Setup", completed: false, current: false },
    { id: "active", label: "Active", completed: false, current: false },
  ],
  currency_exchange: [
    { id: "created", label: "Order Booked", completed: false, current: false },
    { id: "awaiting_payment", label: "Awaiting Payment", completed: false, current: false },
    { id: "payment_confirmed", label: "Payment Confirmed", completed: false, current: false },
    { id: "processing", label: "Processing", completed: false, current: false },
    { id: "dispatched", label: "Dispatched", completed: false, current: false },
    { id: "completed", label: "Delivered", completed: false, current: false },
  ],
  send_money: [
    { id: "created", label: "Order Booked", completed: false, current: false },
    { id: "awaiting_payment", label: "Awaiting Payment", completed: false, current: false },
    { id: "payment_confirmed", label: "Payment Confirmed", completed: false, current: false },
    { id: "processing", label: "Processing", completed: false, current: false },
    { id: "dispatched", label: "Dispatched", completed: false, current: false },
    { id: "completed", label: "Delivered", completed: false, current: false },
  ],
  remittance: [
    { id: "created", label: "Order Booked", completed: false, current: false },
    { id: "awaiting_payment", label: "Awaiting Payment", completed: false, current: false },
    { id: "payment_confirmed", label: "Payment Confirmed", completed: false, current: false },
    { id: "processing", label: "Processing", completed: false, current: false },
    { id: "dispatched", label: "Dispatched", completed: false, current: false },
    { id: "completed", label: "Delivered", completed: false, current: false },
  ],
};

const statusOrder: Record<string, number> = {
  created: 0,
  applied: 0,
  pending: 1,
  awaiting_payment: 1,
  payment_confirmed: 2,
  documents_submitted: 1,
  under_review: 3,
  sanction_letter: 4,
  approved: 4,
  kyc_verification: 1,
  account_setup: 2,
  processing: 3,
  dispatched: 4,
  active: 5,
  disbursed: 5,
  completed: 5,
  rejected: -1,
};

export const ServiceStatusTracker = ({
  referenceId,
  serviceType,
  status,
  rejectionReason,
  actionRequired,
  timestamps,
}: ServiceStatusTrackerProps) => {
  const baseSteps = serviceStatusSteps[serviceType] || [];
  const currentStatusIndex = statusOrder[status] ?? -1;
  const isRejected = status === "rejected";

  const steps = baseSteps.map((step, index) => ({
    ...step,
    completed: !isRejected && statusOrder[step.id] < currentStatusIndex,
    current: !isRejected && statusOrder[step.id] === currentStatusIndex,
  }));

  return (
    <div className="space-y-4">
      {/* Reference & Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Ref:</span>
          <code className="font-mono bg-muted px-2 py-0.5 rounded">{referenceId}</code>
        </div>
        {isRejected ? (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        ) : (
          <Badge className="bg-primary gap-1">
            <Clock className="h-3 w-3" />
            In Progress
          </Badge>
        )}
      </div>

      {/* Action Required Alert */}
      {actionRequired && !isRejected && (
        <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
              Action Required
            </span>
            <p className="text-sm text-orange-600 dark:text-orange-400 mt-0.5">
              {actionRequired}
            </p>
          </div>
        </div>
      )}

      {/* Rejection Reason */}
      {isRejected && rejectionReason && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
          <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <div>
            <span className="text-sm font-medium text-destructive">
              Application Rejected
            </span>
            <p className="text-sm text-destructive/80 mt-0.5">
              {rejectionReason}
            </p>
          </div>
        </div>
      )}

      {/* Progress Timeline */}
      <div className="relative">
        <div className="flex justify-between items-start">
          {steps.map((step, index) => {
            const Icon = step.completed 
              ? CheckCircle 
              : step.current 
                ? (step.id.includes("review") ? Search : FileText)
                : Clock;
            
            return (
              <div 
                key={step.id} 
                className="flex flex-col items-center flex-1"
              >
                <div 
                  className={`
                    h-8 w-8 rounded-full flex items-center justify-center z-10
                    ${step.completed 
                      ? "bg-green-500 text-white" 
                      : step.current 
                        ? "bg-primary text-primary-foreground animate-pulse" 
                        : "bg-muted text-muted-foreground"
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span 
                  className={`
                    text-xs mt-2 text-center max-w-[80px]
                    ${step.completed || step.current 
                      ? "text-foreground font-medium" 
                      : "text-muted-foreground"
                    }
                  `}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Progress Line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted -z-0">
          <div 
            className="h-full bg-green-500 transition-all duration-500"
            style={{ 
              width: isRejected 
                ? "0%" 
                : `${Math.max(0, (currentStatusIndex / (steps.length - 1)) * 100)}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
};
