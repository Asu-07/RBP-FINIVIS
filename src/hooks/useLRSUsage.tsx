import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface LRSUsageData {
  totalUsed: number;
  remainingLimit: number;
  usagePercentage: number;
  transactionCount: number;
  financialYear: string;
}

export function useLRSUsage() {
  const { user } = useAuth();
  const [lrsData, setLrsData] = useState<LRSUsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLRSUsage = useCallback(async () => {
    if (!user) {
      setLrsData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Get current financial year
      const { data: fyData } = await supabase.rpc('get_current_financial_year');
      const financialYear = fyData || '2025-26';
      
      // Get LRS usage
      const { data, error: rpcError } = await supabase.rpc('get_lrs_usage', {
        _user_id: user.id,
        _financial_year: null // Use current year
      });

      if (rpcError) {
        console.error('LRS usage error:', rpcError);
        setError(rpcError.message);
        setLrsData(null);
      } else if (data && data.length > 0) {
        const usage = data[0];
        setLrsData({
          totalUsed: Number(usage.total_used) || 0,
          remainingLimit: Number(usage.remaining_limit) || 250000,
          usagePercentage: Number(usage.usage_percentage) || 0,
          transactionCount: Number(usage.transaction_count) || 0,
          financialYear,
        });
        setError(null);
      } else {
        // No usage data, return defaults
        setLrsData({
          totalUsed: 0,
          remainingLimit: 250000,
          usagePercentage: 0,
          transactionCount: 0,
          financialYear,
        });
        setError(null);
      }
    } catch (err: any) {
      console.error('LRS fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLRSUsage();
  }, [fetchLRSUsage]);

  const checkLimit = useCallback((amountUSD: number): { allowed: boolean; message?: string } => {
    if (!lrsData) {
      return { allowed: false, message: 'Unable to verify LRS limit. Please try again.' };
    }

    if (amountUSD > lrsData.remainingLimit) {
      return {
        allowed: false,
        message: `Transaction exceeds your remaining LRS limit of USD ${lrsData.remainingLimit.toLocaleString()}. Annual limit is USD 2,50,000.`,
      };
    }

    // Warning if approaching limit (above 80%)
    const newUsage = lrsData.totalUsed + amountUSD;
    const newPercentage = (newUsage / 250000) * 100;
    
    if (newPercentage >= 90) {
      return {
        allowed: true,
        message: `Warning: This transaction will use ${newPercentage.toFixed(1)}% of your annual LRS limit.`,
      };
    }

    return { allowed: true };
  }, [lrsData]);

  const recordLRSUsage = useCallback(async (params: {
    serviceType: 'remittance' | 'currency_exchange' | 'forex_card';
    amountUSD: number;
    purpose: string;
    transactionId?: string;
    currencyExchangeOrderId?: string;
    serviceApplicationId?: string;
  }) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      // Get current financial year
      const { data: fyData } = await supabase.rpc('get_current_financial_year');
      
      const { error: insertError } = await supabase
        .from('lrs_usage')
        .insert({
          user_id: user.id,
          financial_year: fyData || '2025-26',
          service_type: params.serviceType,
          amount_usd: params.amountUSD,
          purpose: params.purpose,
          transaction_id: params.transactionId || null,
          currency_exchange_order_id: params.currencyExchangeOrderId || null,
          service_application_id: params.serviceApplicationId || null,
          transaction_date: new Date().toISOString().split('T')[0],
        });

      if (insertError) {
        console.error('LRS record error:', insertError);
        return { success: false, error: insertError.message };
      }

      // Refresh usage data
      await fetchLRSUsage();
      return { success: true };
    } catch (err: any) {
      console.error('LRS record error:', err);
      return { success: false, error: err.message };
    }
  }, [user, fetchLRSUsage]);

  return {
    lrsData,
    loading,
    error,
    checkLimit,
    recordLRSUsage,
    refresh: fetchLRSUsage,
  };
}
