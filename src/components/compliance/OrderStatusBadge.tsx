import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  FileText, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Banknote,
  Truck,
  Package,
  AlertTriangle,
  RotateCcw,
  Ban,
} from "lucide-react";

interface OrderStatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

const statusConfig: Record<string, { 
  label: string; 
  className: string; 
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}> = {
  // Initial stages
  draft: { 
    label: "Draft", 
    className: "bg-muted text-muted-foreground", 
    icon: Clock,
    description: "Order started but not submitted",
  },
  
  // Compliance review stages
  pending_compliance: { 
    label: "Pending Compliance Review", 
    className: "bg-amber-500 text-white", 
    icon: Shield,
    description: "Awaiting admin compliance review",
  },
  pending_review: { 
    label: "Pending Review", 
    className: "bg-amber-500 text-white", 
    icon: Shield,
    description: "Awaiting admin review",
  },
  documents_submitted: { 
    label: "Documents Submitted", 
    className: "bg-blue-400 text-white", 
    icon: FileText,
    description: "Documents uploaded, pending verification",
  },
  documents_verified: { 
    label: "Documents Verified", 
    className: "bg-emerald-500 text-white", 
    icon: CheckCircle,
    description: "Documents verified by admin",
  },
  documents_rejected: { 
    label: "Documents Rejected", 
    className: "bg-red-500 text-white", 
    icon: XCircle,
    description: "Please re-upload documents",
  },
  
  // Approval stages
  approved: { 
    label: "Approved", 
    className: "bg-green-500 text-white", 
    icon: CheckCircle,
    description: "Compliance approved - proceed to payment",
  },
  rejected: { 
    label: "Rejected", 
    className: "bg-destructive text-destructive-foreground", 
    icon: XCircle,
    description: "Order rejected by compliance",
  },
  
  // Payment stages
  awaiting_payment: { 
    label: "Awaiting Payment", 
    className: "bg-yellow-500 text-white", 
    icon: Banknote,
    description: "Payment enabled - please complete payment",
  },
  advance_paid: { 
    label: "Advance Paid", 
    className: "bg-blue-500 text-white", 
    icon: Banknote,
    description: "10% advance received",
  },
  balance_paid: { 
    label: "Fully Paid", 
    className: "bg-green-600 text-white", 
    icon: CheckCircle,
    description: "Full payment received",
  },
  
  // Processing stages
  processing: { 
    label: "Processing", 
    className: "bg-blue-600 text-white", 
    icon: Clock,
    description: "Order is being processed",
  },
  scheduled: { 
    label: "Scheduled", 
    className: "bg-purple-500 text-white", 
    icon: Clock,
    description: "Scheduled for delivery",
  },
  dispatched: { 
    label: "Dispatched", 
    className: "bg-purple-600 text-white", 
    icon: Truck,
    description: "Order dispatched",
  },
  out_for_delivery: { 
    label: "Out for Delivery", 
    className: "bg-orange-500 text-white", 
    icon: Truck,
    description: "On the way to you",
  },
  
  // Completion stages
  delivered: { 
    label: "Delivered", 
    className: "bg-success text-success-foreground", 
    icon: Package,
    description: "Order completed",
  },
  completed: { 
    label: "Completed", 
    className: "bg-success text-success-foreground", 
    icon: CheckCircle,
    description: "Transaction completed",
  },
  
  // Cancellation stages
  cancellation_pending: { 
    label: "Cancellation Pending", 
    className: "bg-orange-500 text-white", 
    icon: AlertTriangle,
    description: "Cancellation requested",
  },
  cancelled: { 
    label: "Cancelled", 
    className: "bg-muted text-muted-foreground", 
    icon: Ban,
    description: "Order cancelled",
  },
  refund_pending: { 
    label: "Refund Pending", 
    className: "bg-yellow-500 text-white", 
    icon: RotateCcw,
    description: "Refund in progress",
  },
  refunded: { 
    label: "Refunded", 
    className: "bg-green-500 text-white", 
    icon: CheckCircle,
    description: "Refund completed",
  },
  
  // Fallback
  pending: { 
    label: "Pending", 
    className: "bg-yellow-500 text-white", 
    icon: Clock,
    description: "Awaiting action",
  },
};

export function OrderStatusBadge({ status, size = "md" }: OrderStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;
  
  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  
  return (
    <Badge className={`${config.className} ${sizeClasses} inline-flex items-center gap-1.5`}>
      <Icon className={iconSize} />
      {config.label}
    </Badge>
  );
}

export function getOrderStatusDescription(status: string): string {
  return statusConfig[status]?.description || "Status unknown";
}
