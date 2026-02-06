import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { forexRates as mockRates } from "@/data/mockData";

export interface ForexRate {
  currency: string;
  name: string;
  flag: string;
  buyRate: number;
  sellRate: number;
  change: number;
}

interface ForexRatesResponse {
  rates: ForexRate[];
  lastUpdated: string;
}

export function useForexRates() {
  const [rates, setRates] = useState<ForexRate[]>(mockRates);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First, check for admin-set rates in the database
      // Using 'any' cast since currency_rates table may not exist in generated types yet
      const { data: dbRates, error: dbError } = await (supabase as any)
        .from("currency_rates")
        .select("*")
        .order("currency");

      if (!dbError && dbRates && dbRates.length > 0) {
        // Admin-set rates found - use them
        const formattedRates: ForexRate[] = dbRates.map((r: any) => ({
          currency: r.currency,
          name: r.name,
          flag: r.flag || "",
          buyRate: Number(r.buy_rate),
          sellRate: Number(r.sell_rate),
          change: Number(r.change) || 0,
        }));
        setRates(formattedRates);

        // Get the most recent update time
        const latestUpdate = dbRates.reduce((latest: Date, r: any) => {
          const rDate = new Date(r.updated_at);
          return rDate > latest ? rDate : latest;
        }, new Date(0));
        setLastUpdated(latestUpdate.toISOString());
        console.log("✅ Using admin-set rates from database");
        return;
      }

      // Fallback: Try the edge function for live rates
      const { data, error: fnError } =
        await supabase.functions.invoke<ForexRatesResponse>(
          "get-forex-rates"
        );

      if (fnError || !data?.rates?.length) {
        console.warn("⚠️ Forex API failed, using mock data");
        setRates(mockRates);
        setLastUpdated(null);
        return;
      }

      setRates(data.rates);
      setLastUpdated(data.lastUpdated);
    } catch (err) {
      console.error("❌ Forex rates fetch failed:", err);
      setRates(mockRates); // HARD fallback
      setLastUpdated(null);
      setError("Using fallback rates");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('currency-rates-change')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'currency_rates',
        },
        (payload) => {
          console.log('Real-time rate update received:', payload);
          fetchRates(); // Refetch all rates to be safe and consistent
        }
      )
      .subscribe();

    const interval = setInterval(fetchRates, 5 * 60 * 1000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchRates]);

  return {
    rates,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchRates,
  };
}