// Standardized order lifecycle statuses across all services
export type OrderStatus = 
  | "created"
  | "documents_required"
  | "documents_uploaded"
  | "verification_in_progress"
  | "verified"
  | "verification_failed"
  | "payment_pending"
  | "payment_received"
  | "processing"
  | "completed"
  | "cancelled"
  | "rejected";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  created: "Order Created",
  documents_required: "Documents Required",
  documents_uploaded: "Documents Uploaded",
  verification_in_progress: "Verification in Progress",
  verified: "Verified",
  verification_failed: "Verification Failed",
  payment_pending: "Payment Pending",
  payment_received: "Payment Received",
  processing: "Processing",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "created",
  "documents_required",
  "documents_uploaded",
  "verification_in_progress",
  "verified",
  "payment_pending",
  "payment_received",
  "processing",
  "completed",
];

// Map service-specific statuses to normalized statuses
export const normalizeStatus = (status: string, _serviceType?: string): OrderStatus => {
  const statusMap: Record<string, OrderStatus> = {
    // Currency Exchange mappings
    draft: "created",
    pending: "verification_in_progress",
    pending_compliance: "verification_in_progress",
    rate_locked: "payment_pending",
    advance_paid: "payment_received",
    approved: "verified",
    balance_paid: "payment_received",
    scheduled: "processing",
    dispatched: "processing",
    delivered: "completed",
    
    // Remittance mappings
    payment_pending: "payment_pending",
    compliance_pending: "verification_in_progress",
    
    // Forex Card mappings
    applied: "created",
    awaiting_payment: "payment_pending",
    under_review: "verification_in_progress",
    documents_submitted: "documents_uploaded",
    card_active: "completed",
    
    // Travel Insurance mappings
    pending_payment: "payment_pending",
    issued: "completed",
    active: "completed",
    expired: "completed",
    
    // Common mappings
    completed: "completed",
    cancelled: "cancelled",
    rejected: "rejected",
    failed: "verification_failed",
    action_required: "documents_required",
  };

  return statusMap[status.toLowerCase()] || "created";
};

// Get next required action based on current status
export const getNextAction = (status: OrderStatus): {
  action: string;
  label: string;
  blocked: boolean;
} => {
  switch (status) {
    case "created":
      return { action: "upload_documents", label: "Upload Documents", blocked: false };
    case "documents_required":
      return { action: "upload_documents", label: "Upload Required Documents", blocked: true };
    case "documents_uploaded":
      return { action: "wait", label: "Awaiting Verification", blocked: true };
    case "verification_in_progress":
      return { action: "wait", label: "Verification in Progress", blocked: true };
    case "verified":
      return { action: "make_payment", label: "Complete Payment", blocked: false };
    case "verification_failed":
      return { action: "resubmit", label: "Resubmit Documents", blocked: true };
    case "payment_pending":
      return { action: "make_payment", label: "Complete Payment", blocked: true };
    case "payment_received":
      return { action: "wait", label: "Processing Order", blocked: true };
    case "processing":
      return { action: "track", label: "Track Order", blocked: false };
    case "completed":
      return { action: "view", label: "View Details", blocked: false };
    case "cancelled":
      return { action: "view", label: "View Details", blocked: false };
    case "rejected":
      return { action: "reapply", label: "Re-Apply", blocked: false };
    default:
      return { action: "contact", label: "Contact Support", blocked: false };
  }
};

// Check if status allows payment
export const canMakePayment = (status: OrderStatus): boolean => {
  return ["verified", "payment_pending"].includes(status);
};

// Check if status allows document upload
export const canUploadDocuments = (status: OrderStatus): boolean => {
  return ["created", "documents_required", "verification_failed"].includes(status);
};
