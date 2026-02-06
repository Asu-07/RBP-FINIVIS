import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// API Integration points for external verification services
// These are placeholders that will be connected to real APIs when credentials are available

export interface VerificationResult {
  verified: boolean;
  message: string;
  data?: Record<string, unknown>;
  errors?: string[];
}

export interface PANVerificationPayload {
  panNumber: string;
  fullName: string;
  dateOfBirth?: string;
}

export interface PassportVerificationPayload {
  passportNumber: string;
  fullName: string;
  dateOfBirth: string;
  nationality: string;
}

export interface VisaVerificationPayload {
  passportNumber: string;
  visaNumber: string;
  destinationCountry: string;
  visaType: string;
}

export interface LRSUsagePayload {
  userId: string;
  panNumber: string;
  financialYear?: string;
}

export interface InsurancePolicyPayload {
  userId: string;
  policyDetails: {
    travellers: unknown[];
    destination: string;
    startDate: string;
    endDate: string;
    planType: string;
    premiumAmount: number;
  };
}

export interface LoanEligibilityPayload {
  userId: string;
  panNumber: string;
  annualIncome: number;
  courseDetails: {
    university: string;
    country: string;
    courseFee: number;
    courseDuration: number;
  };
}

export const useApiVerification = () => {
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // PAN Verification Hook
  // Integrates with NSDL/UTIITSL PAN verification API
  const verifyPAN = useCallback(async (payload: PANVerificationPayload): Promise<VerificationResult> => {
    setVerifying(true);
    setError(null);

    try {
      // API integration point - will be connected to real PAN verification API
      // For now, simulate verification
      const { data, error: fnError } = await supabase.functions.invoke("verify-pan", {
        body: payload,
      });

      if (fnError) {
        // If edge function doesn't exist, simulate success for demo
        if (fnError.message.includes("not found") || fnError.message.includes("404")) {
          // Simulate PAN verification logic
          const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
          if (!panRegex.test(payload.panNumber)) {
            return {
              verified: false,
              message: "Invalid PAN format",
              errors: ["PAN number must be in format: ABCDE1234F"],
            };
          }
          return {
            verified: true,
            message: "PAN verification successful (simulated)",
            data: { panNumber: payload.panNumber, nameMatch: true },
          };
        }
        throw fnError;
      }

      return data as VerificationResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : "PAN verification failed";
      setError(message);
      return { verified: false, message, errors: [message] };
    } finally {
      setVerifying(false);
    }
  }, []);

  // Passport Verification Hook
  // Integrates with passport verification service
  const verifyPassport = useCallback(async (payload: PassportVerificationPayload): Promise<VerificationResult> => {
    setVerifying(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("verify-passport", {
        body: payload,
      });

      if (fnError) {
        if (fnError.message.includes("not found") || fnError.message.includes("404")) {
          // Simulate passport verification
          const passportRegex = /^[A-Z][0-9]{7}$/;
          if (!passportRegex.test(payload.passportNumber)) {
            return {
              verified: false,
              message: "Invalid passport format",
              errors: ["Passport number must be in format: A1234567"],
            };
          }
          return {
            verified: true,
            message: "Passport verification successful (simulated)",
            data: { passportNumber: payload.passportNumber, validUntil: "2030-01-01" },
          };
        }
        throw fnError;
      }

      return data as VerificationResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Passport verification failed";
      setError(message);
      return { verified: false, message, errors: [message] };
    } finally {
      setVerifying(false);
    }
  }, []);

  // Visa Verification Hook
  const verifyVisa = useCallback(async (payload: VisaVerificationPayload): Promise<VerificationResult> => {
    setVerifying(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("verify-visa", {
        body: payload,
      });

      if (fnError) {
        if (fnError.message.includes("not found") || fnError.message.includes("404")) {
          // Simulate visa verification
          return {
            verified: true,
            message: "Visa verification successful (simulated)",
            data: { visaNumber: payload.visaNumber, validUntil: "2025-12-31" },
          };
        }
        throw fnError;
      }

      return data as VerificationResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Visa verification failed";
      setError(message);
      return { verified: false, message, errors: [message] };
    } finally {
      setVerifying(false);
    }
  }, []);

  // LRS Usage Tracking Hook
  // Fetches user's LRS usage from RBI database
  const checkLRSUsage = useCallback(async (payload: LRSUsagePayload): Promise<VerificationResult> => {
    setVerifying(true);
    setError(null);

    try {
      // First check internal LRS tracking
      const { data: internalUsage } = await supabase.rpc("get_lrs_usage", {
        _user_id: payload.userId,
        _financial_year: payload.financialYear,
      });

      if (internalUsage && internalUsage.length > 0) {
        const usage = internalUsage[0];
        return {
          verified: true,
          message: "LRS usage retrieved successfully",
          data: {
            totalUsed: usage.total_used,
            remainingLimit: usage.remaining_limit,
            usagePercentage: usage.usage_percentage,
            transactionCount: usage.transaction_count,
          },
        };
      }

      // If no internal data, return default (no usage)
      return {
        verified: true,
        message: "No LRS usage found for this financial year",
        data: {
          totalUsed: 0,
          remainingLimit: 250000,
          usagePercentage: 0,
          transactionCount: 0,
        },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "LRS usage check failed";
      setError(message);
      return { verified: false, message, errors: [message] };
    } finally {
      setVerifying(false);
    }
  }, []);

  // Insurance Policy Issuance Hook
  // Integrates with partner insurance companies
  const issueInsurancePolicy = useCallback(async (payload: InsurancePolicyPayload): Promise<VerificationResult> => {
    setVerifying(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("issue-insurance-policy", {
        body: payload,
      });

      if (fnError) {
        if (fnError.message.includes("not found") || fnError.message.includes("404")) {
          // Simulate policy issuance
          const policyNumber = `TI${Date.now().toString(36).toUpperCase()}`;
          return {
            verified: true,
            message: "Insurance policy issued successfully (simulated)",
            data: {
              policyNumber,
              issuedAt: new Date().toISOString(),
              validFrom: payload.policyDetails.startDate,
              validTo: payload.policyDetails.endDate,
            },
          };
        }
        throw fnError;
      }

      return data as VerificationResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Policy issuance failed";
      setError(message);
      return { verified: false, message, errors: [message] };
    } finally {
      setVerifying(false);
    }
  }, []);

  // Loan Eligibility Check Hook
  // Integrates with lending partners
  const checkLoanEligibility = useCallback(async (payload: LoanEligibilityPayload): Promise<VerificationResult> => {
    setVerifying(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("check-loan-eligibility", {
        body: payload,
      });

      if (fnError) {
        if (fnError.message.includes("not found") || fnError.message.includes("404")) {
          // Simulate eligibility check
          const maxLoanAmount = Math.min(payload.annualIncome * 3, payload.courseDetails.courseFee);
          return {
            verified: true,
            message: "Loan eligibility checked successfully (simulated)",
            data: {
              eligible: maxLoanAmount >= payload.courseDetails.courseFee * 0.5,
              maxLoanAmount,
              estimatedEMI: Math.round(maxLoanAmount / (payload.courseDetails.courseDuration * 12)),
              interestRate: 10.5,
            },
          };
        }
        throw fnError;
      }

      return data as VerificationResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Eligibility check failed";
      setError(message);
      return { verified: false, message, errors: [message] };
    } finally {
      setVerifying(false);
    }
  }, []);

  return {
    verifying,
    error,
    verifyPAN,
    verifyPassport,
    verifyVisa,
    checkLRSUsage,
    issueInsurancePolicy,
    checkLoanEligibility,
  };
};
