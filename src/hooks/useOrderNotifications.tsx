import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logError } from "@/lib/errorHandler";

interface NotificationPayload {
  email: string;
  name: string;
  type: string;
  orderReference?: string;
  amount?: number;
  currency?: string;
  status?: string;
  message?: string;
  serviceType?: string;
}

export const useOrderNotifications = () => {
  // Send notification for order events
  const sendNotification = useCallback(async (payload: NotificationPayload) => {
    try {
      const { error } = await supabase.functions.invoke("send-notification-email", {
        body: payload,
      });

      if (error) {
        logError("useOrderNotifications.sendNotification", error);
        return false;
      }
      return true;
    } catch (error) {
      logError("useOrderNotifications.sendNotification", error);
      return false;
    }
  }, []);

  // Notify on order creation
  const notifyOrderCreated = useCallback(async (
    email: string,
    name: string,
    orderReference: string,
    serviceType: string,
    amount: number,
    currency: string
  ) => {
    return sendNotification({
      email,
      name,
      type: "order_created",
      orderReference,
      serviceType,
      amount,
      currency,
      message: `Your ${serviceType} order has been created successfully.`,
    });
  }, [sendNotification]);

  // Notify on document submission
  const notifyDocumentsSubmitted = useCallback(async (
    email: string,
    name: string,
    orderReference: string,
    serviceType: string
  ) => {
    return sendNotification({
      email,
      name,
      type: "documents_submitted",
      orderReference,
      serviceType,
      message: "Your documents have been submitted and are under review.",
    });
  }, [sendNotification]);

  // Notify on verification success
  const notifyVerificationSuccess = useCallback(async (
    email: string,
    name: string,
    orderReference: string,
    serviceType: string
  ) => {
    return sendNotification({
      email,
      name,
      type: "verification_success",
      orderReference,
      serviceType,
      status: "verified",
      message: "Your documents have been verified successfully. You can now proceed with payment.",
    });
  }, [sendNotification]);

  // Notify on verification failure
  const notifyVerificationFailed = useCallback(async (
    email: string,
    name: string,
    orderReference: string,
    serviceType: string,
    reason: string
  ) => {
    return sendNotification({
      email,
      name,
      type: "verification_failed",
      orderReference,
      serviceType,
      status: "failed",
      message: reason || "Document verification failed. Please resubmit correct documents.",
    });
  }, [sendNotification]);

  // Notify on payment success
  const notifyPaymentSuccess = useCallback(async (
    email: string,
    name: string,
    orderReference: string,
    serviceType: string,
    amount: number,
    currency: string
  ) => {
    return sendNotification({
      email,
      name,
      type: "payment_success",
      orderReference,
      serviceType,
      amount,
      currency,
      status: "paid",
      message: `Payment of ${currency} ${amount.toLocaleString()} received successfully.`,
    });
  }, [sendNotification]);

  // Notify on order completion
  const notifyOrderCompleted = useCallback(async (
    email: string,
    name: string,
    orderReference: string,
    serviceType: string
  ) => {
    return sendNotification({
      email,
      name,
      type: "order_completed",
      orderReference,
      serviceType,
      status: "completed",
      message: `Your ${serviceType} order has been completed successfully.`,
    });
  }, [sendNotification]);

  // Notify on order cancellation
  const notifyOrderCancelled = useCallback(async (
    email: string,
    name: string,
    orderReference: string,
    serviceType: string,
    reason?: string
  ) => {
    return sendNotification({
      email,
      name,
      type: "order_cancelled",
      orderReference,
      serviceType,
      status: "cancelled",
      message: reason || "Your order has been cancelled.",
    });
  }, [sendNotification]);

  return {
    sendNotification,
    notifyOrderCreated,
    notifyDocumentsSubmitted,
    notifyVerificationSuccess,
    notifyVerificationFailed,
    notifyPaymentSuccess,
    notifyOrderCompleted,
    notifyOrderCancelled,
  };
};
