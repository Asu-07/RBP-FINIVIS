import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { useForexRates } from "@/hooks/useForexRates";

export function RatesTicker() {
  const { rates, isLoading } = useForexRates();

  if (isLoading && rates.length === 0) {
    return (
      <div className="bg-primary/5 border-y border-border overflow-hidden">
        <div className="container-custom py-3">
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider shrink-0">
              Live Rates
            </span>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading live rates...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary/5 border-y border-border overflow-hidden">
      <div className="container-custom py-3">
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider shrink-0">
            Live Rates
          </span>
          <div className="overflow-hidden flex-1 relative">
            <motion.div
              className="flex gap-8"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 30,
                  ease: "linear",
                },
              }}
            >
              {[...rates, ...rates].map((rate, index) => (
                <div
                  key={`${rate.currency}-${index}`}
                  className="flex items-center gap-2 shrink-0"
                >
                  <span className="text-lg">{rate.flag}</span>
                  <span className="font-semibold text-sm">{rate.currency}</span>
                  <span className="text-sm text-muted-foreground">
                    ₹{rate.buyRate.toFixed(2)}
                  </span>
                  <span
                    className={`flex items-center text-xs ${
                      rate.change >= 0 ? "text-success" : "text-destructive"
                    }`}
                  >
                    {rate.change >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-0.5" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-0.5" />
                    )}
                    {Math.abs(rate.change).toFixed(2)}%
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
