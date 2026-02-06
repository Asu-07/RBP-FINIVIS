import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface TDSCalculationResult {
  tdsApplicable: boolean;
  tdsAmount: number;
  tdsRate: number;
  tdsRateName: string;
  thresholdUsed: number;
  remainingThreshold: number;
  totalFYUsage: number;
  regulatoryNote: string;
}

/**
 * TDS Calculation Hook as per Section 206C(1G) of Income Tax Act
 * 
 * Threshold: ₹7,00,000 per financial year
 * 
 * TDS Rates:
 * - Education via loan: 0.5%
 * - Education (no loan) / Medical: 5%
 * - All other LRS purposes: 20%
 * 
 * Note: Selling Forex does NOT attract TDS
 * 
 * Disclaimer: "TDS is collected as mandated by the Income Tax Department and is not a fee charged by RBP FINIVIS."
 */

const TDS_THRESHOLD_INR = 700000; // ₹7,00,000 per FY

const TDS_RATES: Record<string, { rate: number; name: string }> = {
  education_loan: { rate: 0.005, name: "Education (with loan)" }, // 0.5%
  education: { rate: 0.05, name: "Education (self-funded)" }, // 5%
  medical: { rate: 0.05, name: "Medical Treatment" }, // 5%
  travel: { rate: 0.20, name: "Travel" }, // 20%
  business: { rate: 0.20, name: "Business" }, // 20%
  family_maintenance: { rate: 0.20, name: "Family Maintenance" }, // 20%
  emigration: { rate: 0.20, name: "Emigration" }, // 20%
  employment: { rate: 0.20, name: "Employment" }, // 20%
  investment: { rate: 0.20, name: "Investment" }, // 20%
  gift: { rate: 0.20, name: "Gift/Donation" }, // 20%
  other: { rate: 0.20, name: "Other" }, // 20%
};

export function useTDSCalculation() {
  const { user } = useAuth();
  const [calculating, setCalculating] = useState(false);

  const getCurrentFinancialYear = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    // FY starts April 1
    if (month >= 4) {
      return `${year}-${(year + 1).toString().slice(-2)}`;
    }
    return `${year - 1}-${year.toString().slice(-2)}`;
  };

  const getFYRemittanceTotal = useCallback(async (): Promise<number> => {
    if (!user) return 0;
    
    try {
      const fy = getCurrentFinancialYear();
      
      // Get all forex transactions for this FY
      const { data: lrsData, error } = await supabase
        .from("lrs_usage")
        .select("amount_usd")
        .eq("user_id", user.id)
        .eq("financial_year", fy);

      if (error) {
        console.error("Error fetching FY usage:", error);
        return 0;
      }

      // Convert to INR (approximate rate)
      const totalUSD = lrsData?.reduce((sum, item) => sum + (Number(item.amount_usd) || 0), 0) || 0;
      return totalUSD * 84; // Approximate USD to INR
    } catch {
      return 0;
    }
  }, [user]);

  const calculateTDS = useCallback(async (
    amountINR: number,
    purpose: string,
    exchangeType: "buy" | "sell"
  ): Promise<TDSCalculationResult> => {
    setCalculating(true);

    try {
      // Selling forex does NOT attract TDS
      if (exchangeType === "sell") {
        return {
          tdsApplicable: false,
          tdsAmount: 0,
          tdsRate: 0,
          tdsRateName: "N/A",
          thresholdUsed: 0,
          remainingThreshold: TDS_THRESHOLD_INR,
          totalFYUsage: 0,
          regulatoryNote: "TDS is not applicable on sale of foreign currency.",
        };
      }

      // Get existing FY usage
      const fyTotal = await getFYRemittanceTotal();
      
      // Determine TDS rate based on purpose
      const purposeKey = purpose.toLowerCase().replace(/\s+/g, "_");
      const rateInfo = TDS_RATES[purposeKey] || TDS_RATES.other;

      // Calculate amount above threshold
      const totalAfterTransaction = fyTotal + amountINR;
      
      // If this transaction crosses threshold
      const amountSubjectToTDS = fyTotal >= TDS_THRESHOLD_INR 
        ? amountINR 
        : Math.max(0, totalAfterTransaction - TDS_THRESHOLD_INR);

      const tdsAmount = amountSubjectToTDS * rateInfo.rate;
      const tdsApplicable = tdsAmount > 0;

      return {
        tdsApplicable,
        tdsAmount: Math.round(tdsAmount * 100) / 100,
        tdsRate: rateInfo.rate * 100,
        tdsRateName: rateInfo.name,
        thresholdUsed: Math.min(fyTotal, TDS_THRESHOLD_INR),
        remainingThreshold: Math.max(0, TDS_THRESHOLD_INR - fyTotal),
        totalFYUsage: fyTotal,
        regulatoryNote: tdsApplicable 
          ? `TDS of ${(rateInfo.rate * 100).toFixed(1)}% (₹${tdsAmount.toLocaleString()}) applies as your FY remittances exceed ₹7,00,000. TDS is a government requirement and can be claimed while filing your income tax return.`
          : `No TDS applicable as your FY remittances are within ₹7,00,000 threshold.`,
      };
    } catch (error) {
      console.error("TDS calculation error:", error);
      return {
        tdsApplicable: false,
        tdsAmount: 0,
        tdsRate: 0,
        tdsRateName: "Error",
        thresholdUsed: 0,
        remainingThreshold: TDS_THRESHOLD_INR,
        totalFYUsage: 0,
        regulatoryNote: "Unable to calculate TDS. Please try again.",
      };
    } finally {
      setCalculating(false);
    }
  }, [getFYRemittanceTotal]);

  return {
    calculateTDS,
    calculating,
    TDS_THRESHOLD_INR,
    getCurrentFinancialYear,
  };
}
