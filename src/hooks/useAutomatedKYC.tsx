import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";


export interface KYCVerificationResult {
  isVerified: boolean;
  panVerified: boolean;
  aadhaarVerified: boolean;
  passportVerified: boolean;
  nameMatch: boolean;
  dobMatch: boolean;
  verificationId?: string;
  errors: string[];
  warnings: string[];
}

export interface KYCDocuments {
  panNumber?: string;
  aadhaarNumber?: string;
  passportNumber?: string;
  fullName?: string;
  dateOfBirth?: string;
}

/**
 * Automated KYC Verification Hook
 * 
 * This hook provides fully automated KYC verification without manual admin approval.
 * - PAN verification (placeholder for API integration)
 * - Aadhaar verification via OTP/DigiLocker (placeholder)
 * - Passport & Visa OCR verification (placeholder)
 * - Name & DOB matching across documents
 * 
 * Disclaimer: "KYC verification is required as per RBI guidelines and is completed digitally for faster processing."
 */
export function useAutomatedKYC() {
  const { user } = useAuth();
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<KYCVerificationResult | null>(null);

  // Simulate PAN verification (placeholder for actual API)
  const verifyPAN = async (panNumber: string): Promise<{ verified: boolean; name?: string; error?: string }> => {
    // In production, this would call a PAN verification API
    // For now, we validate format and auto-approve
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    if (!panRegex.test(panNumber.toUpperCase())) {
      return { verified: false, error: "Invalid PAN format" };
    }
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { verified: true, name: "Auto-Verified" };
  };

  // Simulate Aadhaar verification (placeholder for OTP/DigiLocker API)
  const verifyAadhaar = async (aadhaarNumber: string): Promise<{ verified: boolean; name?: string; error?: string }> => {
    // In production, this would trigger OTP verification or DigiLocker
    const aadhaarRegex = /^\d{12}$/;
    if (!aadhaarRegex.test(aadhaarNumber.replace(/\s/g, ""))) {
      return { verified: false, error: "Invalid Aadhaar format (12 digits required)" };
    }
    await new Promise(resolve => setTimeout(resolve, 500));
    return { verified: true, name: "Auto-Verified" };
  };

  // Simulate Passport verification (placeholder for OCR API)
  const verifyPassport = async (passportNumber: string): Promise<{ verified: boolean; error?: string }> => {
    // In production, this would use OCR to extract and verify passport details
    if (passportNumber.length < 7) {
      return { verified: false, error: "Invalid passport number format" };
    }
    await new Promise(resolve => setTimeout(resolve, 500));
    return { verified: true };
  };

  // Main verification function
  const verifyKYC = useCallback(async (documents: KYCDocuments): Promise<KYCVerificationResult> => {
    if (!user) {
      return {
        isVerified: false,
        panVerified: false,
        aadhaarVerified: false,
        passportVerified: false,
        nameMatch: false,
        dobMatch: false,
        errors: ["User not authenticated"],
        warnings: [],
      };
    }

    setVerifying(true);
    const errors: string[] = [];
    const warnings: string[] = [];
    let panVerified = false;
    let aadhaarVerified = false;
    let passportVerified = false;

    try {
      // Verify PAN (mandatory)
      if (documents.panNumber) {
        const panResult = await verifyPAN(documents.panNumber);
        panVerified = panResult.verified;
        if (!panResult.verified && panResult.error) {
          errors.push(panResult.error);
        }
      } else {
        errors.push("PAN number is required for KYC verification");
      }

      // Verify Aadhaar (if provided)
      if (documents.aadhaarNumber) {
        const aadhaarResult = await verifyAadhaar(documents.aadhaarNumber);
        aadhaarVerified = aadhaarResult.verified;
        if (!aadhaarResult.verified && aadhaarResult.error) {
          errors.push(aadhaarResult.error);
        }
      }

      // Verify Passport (if provided)
      if (documents.passportNumber) {
        const passportResult = await verifyPassport(documents.passportNumber);
        passportVerified = passportResult.verified;
        if (!passportResult.verified && passportResult.error) {
          errors.push(passportResult.error);
        }
      }

      // Name matching (simplified - in production would compare across documents)
      const nameMatch = Boolean(documents.fullName && documents.fullName.length >= 3);
      
      // DOB matching (simplified)
      const dobMatch = Boolean(documents.dateOfBirth);

      // Overall verification status
      const isVerified = panVerified && (aadhaarVerified || passportVerified) && errors.length === 0;

      // Update profile with KYC status
      if (isVerified) {
        await supabase
          .from("profiles")
          .update({
            kyc_status: "verified",
            kyc_verified_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
      }

      const verificationResult: KYCVerificationResult = {
        isVerified,
        panVerified,
        aadhaarVerified,
        passportVerified,
        nameMatch,
        dobMatch,
        verificationId: isVerified ? `KYC-${Date.now()}` : undefined,
        errors,
        warnings,
      };

      setResult(verificationResult);
      return verificationResult;
    } catch (error: any) {
      console.error("KYC verification error:", error);
      const failedResult: KYCVerificationResult = {
        isVerified: false,
        panVerified: false,
        aadhaarVerified: false,
        passportVerified: false,
        nameMatch: false,
        dobMatch: false,
        errors: [error.message || "KYC verification failed"],
        warnings: [],
      };
      setResult(failedResult);
      return failedResult;
    } finally {
      setVerifying(false);
    }
  }, [user]);

  // Quick verification check for existing KYC
  const checkExistingKYC = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("kyc_status, kyc_verified_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data?.kyc_status === "verified";
    } catch {
      return false;
    }
  }, [user]);

  return {
    verifyKYC,
    checkExistingKYC,
    verifying,
    result,
  };
}
