import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useCallback } from "react";

interface KYCStatus {
  isVerified: boolean;
  status: string | null;
  loading: boolean;
  error: string | null;
}

export function useKYCGate() {
  const { user } = useAuth();
  const [kycStatus, setKycStatus] = useState<KYCStatus>({
    isVerified: false,
    status: null,
    loading: true,
    error: null,
  });

  const checkKYC = useCallback(async () => {
    if (!user) {
      setKycStatus({
        isVerified: false,
        status: null,
        loading: false,
        error: null,
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("kyc_status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      setKycStatus({
        isVerified: data?.kyc_status === "verified",
        status: data?.kyc_status || "pending",
        loading: false,
        error: null,
      });
    } catch (err: any) {
      setKycStatus({
        isVerified: false,
        status: null,
        loading: false,
        error: err.message,
      });
    }
  }, [user]);

  useEffect(() => {
    checkKYC();
  }, [checkKYC]);

  const canProceedToPayment = kycStatus.isVerified;
  const canSubmitOrder = kycStatus.isVerified;
  const canUseLRS = kycStatus.isVerified;

  return {
    ...kycStatus,
    canProceedToPayment,
    canSubmitOrder,
    canUseLRS,
    refresh: checkKYC,
  };
}
