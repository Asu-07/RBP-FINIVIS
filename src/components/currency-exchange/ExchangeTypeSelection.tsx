import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Shield, 
  Info,
  CheckCircle,
} from "lucide-react";
import { companyInfo } from "@/data/mockData";

interface ExchangeTypeSelectionProps {
  exchangeType: "buy" | "sell" | "";
  onSelectType: (type: "buy" | "sell") => void;
  onContinue: () => void;
}

export const ExchangeTypeSelection = ({ 
  exchangeType, 
  onSelectType, 
  onContinue 
}: ExchangeTypeSelectionProps) => {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">Currency Exchange</CardTitle>
            <CardDescription>
              RBI-licensed FFMC • FEMA Compliant
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Exchange Type Selection */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Buy Forex */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              onClick={() => onSelectType("buy")}
              className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                exchangeType === "buy"
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-border hover:border-primary/50 bg-card"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <ArrowDownCircle className="h-6 w-6 text-green-600" />
                </div>
                {exchangeType === "buy" && (
                  <CheckCircle className="h-6 w-6 text-primary" />
                )}
              </div>
              <h3 className="text-lg font-heading font-semibold mb-1">Buy Forex</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Convert INR to Foreign Currency
              </p>
              <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-200">
                INR → USD, EUR, GBP...
              </Badge>
            </button>
          </motion.div>

          {/* Sell Forex */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              onClick={() => onSelectType("sell")}
              className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                exchangeType === "sell"
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-border hover:border-primary/50 bg-card"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <ArrowUpCircle className="h-6 w-6 text-blue-600" />
                </div>
                {exchangeType === "sell" && (
                  <CheckCircle className="h-6 w-6 text-primary" />
                )}
              </div>
              <h3 className="text-lg font-heading font-semibold mb-1">Sell Forex</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Convert Foreign Currency to INR
              </p>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-200">
                USD, EUR, GBP... → INR
              </Badge>
            </button>
          </motion.div>
        </div>

        {/* RBI Compliance Notice */}
        <div className="bg-muted/50 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent" />
            <span className="font-heading font-semibold text-sm">RBI Compliance Notice</span>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1.5">
            <li className="flex items-start gap-2">
              <Info className="h-3 w-3 mt-0.5 shrink-0 text-accent" />
              <span>All forex transactions must involve INR as one leg (RBI mandate)</span>
            </li>
            <li className="flex items-start gap-2">
              <Info className="h-3 w-3 mt-0.5 shrink-0 text-accent" />
              <span>FX trading, speculation, or investment is strictly prohibited under FEMA</span>
            </li>
            <li className="flex items-start gap-2">
              <Info className="h-3 w-3 mt-0.5 shrink-0 text-accent" />
              <span>Cash forex limit: USD 3,000 equivalent per trip</span>
            </li>
            <li className="flex items-start gap-2">
              <Info className="h-3 w-3 mt-0.5 shrink-0 text-accent" />
              <span>LRS limit: USD 2,50,000 per financial year per individual</span>
            </li>
          </ul>
        </div>

        {/* FFMC Badge */}
        <div className="flex items-center justify-center gap-2 py-2">
          <Badge variant="secondary" className="gap-1.5">
            <Shield className="h-3 w-3" />
            FFMC Licence: {companyInfo.regulatory.rbiLicence}
          </Badge>
        </div>

        {/* Continue Button */}
        <Button
          className="w-full"
          size="lg"
          disabled={!exchangeType}
          onClick={onContinue}
        >
          Continue
        </Button>
      </CardContent>
    </Card>
  );
};
