import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface RefundableBalance {
  id: string;
  user_id: string;
  balance_amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

interface BalanceEntry {
  id: string;
  user_id: string;
  refundable_balance_id: string;
  entry_type: "credit" | "debit";
  amount: number;
  reason: string;
  source_type: string | null;
  source_id: string | null;
  source_reference: string | null;
  description: string | null;
  created_at: string;
}

interface RefundRequest {
  id: string;
  user_id: string;
  refundable_balance_id: string;
  requested_amount: number;
  bank_account_name: string;
  bank_account_number: string;
  bank_ifsc: string;
  bank_name: string | null;
  status: "pending" | "approved" | "processed" | "rejected";
  admin_notes: string | null;
  processed_by: string | null;
  processed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export const useRefundableBalance = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<RefundableBalance | null>(null);
  const [entries, setEntries] = useState<BalanceEntry[]>([]);
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBalance = useCallback(async () => {
    if (!user) {
      setBalance(null);
      setEntries([]);
      setRefundRequests([]);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch balance
      const { data: balanceData, error: balanceError } = await supabase
        .from("refundable_balances")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (balanceError) throw balanceError;
      setBalance(balanceData);

      // Fetch entries
      const { data: entriesData, error: entriesError } = await supabase
        .from("refundable_balance_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (entriesError) throw entriesError;
      setEntries(entriesData as BalanceEntry[] || []);

      // Fetch refund requests
      const { data: requestsData, error: requestsError } = await supabase
        .from("refund_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (requestsError) throw requestsError;
      setRefundRequests(requestsData as RefundRequest[] || []);
    } catch (error) {
      console.error("Error fetching refundable balance:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const requestBankRefund = async (
    amount: number,
    bankDetails: {
      accountName: string;
      accountNumber: string;
      ifsc: string;
      bankName?: string;
    }
  ) => {
    if (!user || !balance) {
      toast.error("No refundable balance available");
      return { success: false };
    }

    if (amount > balance.balance_amount) {
      toast.error("Requested amount exceeds available balance");
      return { success: false };
    }

    try {
      const { data, error } = await supabase
        .from("refund_requests")
        .insert({
          user_id: user.id,
          refundable_balance_id: balance.id,
          requested_amount: amount,
          bank_account_name: bankDetails.accountName,
          bank_account_number: bankDetails.accountNumber,
          bank_ifsc: bankDetails.ifsc,
          bank_name: bankDetails.bankName,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Refund request submitted successfully");
      await fetchBalance();
      return { success: true, data };
    } catch (error) {
      console.error("Error requesting refund:", error);
      toast.error("Failed to submit refund request");
      return { success: false };
    }
  };

  const useBalanceForService = async (
    amount: number,
    serviceType: string,
    orderId: string
  ) => {
    if (!user) {
      toast.error("Please login to continue");
      return { success: false };
    }

    try {
      const { data, error } = await supabase.rpc("debit_refundable_balance", {
        _user_id: user.id,
        _amount: amount,
        _reason: "used_for_service",
        _source_type: serviceType,
        _source_id: orderId,
        _description: `Used for ${serviceType}`,
      });

      if (error) throw error;

      toast.success("Balance applied to your order");
      await fetchBalance();
      return { success: true, data };
    } catch (error: any) {
      console.error("Error using balance:", error);
      toast.error(error.message || "Failed to apply balance");
      return { success: false };
    }
  };

  return {
    balance,
    balanceAmount: balance?.balance_amount || 0,
    entries,
    refundRequests,
    isLoading,
    fetchBalance,
    requestBankRefund,
    useBalanceForService,
  };
};
