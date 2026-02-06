import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowRightLeft, Shield, Clock, Award, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countries } from "@/data/mockData";
import { useForexRates } from "@/hooks/useForexRates";
import { Link } from "react-router-dom";

// Floating currency data
const floatingCurrencies = [
  { symbol: "$", x: "5%", y: "15%", delay: 0, duration: 8 },
  { symbol: "€", x: "15%", y: "70%", delay: 1, duration: 10 },
  { symbol: "£", x: "85%", y: "20%", delay: 2, duration: 9 },
  { symbol: "¥", x: "90%", y: "75%", delay: 0.5, duration: 11 },
  { symbol: "₹", x: "25%", y: "85%", delay: 1.5, duration: 7 },
  { symbol: "د.إ", x: "75%", y: "10%", delay: 3, duration: 12 },
  { symbol: "S$", x: "60%", y: "80%", delay: 2.5, duration: 8 },
  { symbol: "A$", x: "10%", y: "45%", delay: 0.8, duration: 10 },
  { symbol: "C$", x: "80%", y: "50%", delay: 1.2, duration: 9 },
  { symbol: "CHF", x: "40%", y: "5%", delay: 2.2, duration: 11 },
  { symbol: "฿", x: "95%", y: "40%", delay: 0.3, duration: 8 },
  { symbol: "kr", x: "50%", y: "90%", delay: 1.8, duration: 10 },
];

export function HeroSection() {
  const [sendAmount, setSendAmount] = useState("1000");
  const [fromCurrency] = useState("INR");
  const [toCurrency, setToCurrency] = useState("USD");

  const { rates, isLoading } = useForexRates();

  const selectedRate = rates.find((r) => r.currency === toCurrency);
  const receiveAmount = selectedRate
    ? (parseFloat(sendAmount) / selectedRate.buyRate).toFixed(2)
    : "0";

  const trustBadges = [
    { icon: Shield, text: "RBI Licensed FFMC" },
    { icon: Clock, text: "Same Day Transfer" },
    { icon: Award, text: "Best Rates Guaranteed" },
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 bg-hero-pattern opacity-30" />

      {/* Animated circles */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      {/* Floating Currency Icons */}
      {floatingCurrencies.map((currency, index) => (
        <motion.div
          key={index}
          className="absolute text-primary-foreground/20 font-heading font-bold text-5xl sm:text-6xl md:text-7xl select-none pointer-events-none"
          style={{
            left: currency.x,
            top: currency.y,
            filter: 'blur(0.3px)',
            textShadow: '0 0 25px rgba(255, 255, 255, 0.2), 0 0 12px rgba(255, 255, 255, 0.15)'
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: [0.12, 0.25, 0.12],
            y: [0, -35, 0],
            x: [0, 8, -8, 0],
            rotate: [0, 6, -6, 0],
            scale: [1, 1.06, 1],
          }}
          transition={{
            duration: currency.duration,
            delay: currency.delay,
            repeat: Infinity,
            ease: [0.45, 0.05, 0.55, 0.95],
          }}
        >
          {currency.symbol}
        </motion.div>
      ))}

      <div className="container-custom relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-primary-foreground"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 backdrop-blur-sm border border-accent/30 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              <span className="text-sm font-medium">RBI-licensed Full-Fledged Money Changer</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold leading-tight mb-6">
              One Platform for
              <br />
              <span className="text-accent">Remittance, Forex Cards</span>
              <br />
              and <span className="text-accent">Currency Exchange</span>
            </h1>

            <p className="text-lg text-primary-foreground/80 mb-8 max-w-lg">
              Your complete forex solution. Send money abroad, get multi-currency forex cards,
              and exchange currencies at the best rates—all from one trusted platform.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              {trustBadges.map((badge, index) => (
                <motion.div
                  key={badge.text}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-2 text-primary-foreground/90"
                >
                  <div className="p-2 rounded-lg bg-accent/20">
                    <badge.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">{badge.text}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Link to="/send-money">
                <Button variant="hero" size="xl">
                  Send Money
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link to="/currency-exchange">
                <Button variant="hero-outline" size="xl">
                  Currency Exchange
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right - Calculator Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-lg bg-accent/10">
                  <ArrowRightLeft className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-foreground">
                  Quick Rate Calculator
                </h3>
              </div>

              <div className="space-y-6">
                {/* Send Amount */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    You Send
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      className="flex-1 text-lg font-semibold h-14"
                      placeholder="0.00"
                    />
                    <div className="flex items-center gap-2 px-4 bg-muted rounded-lg min-w-[100px] justify-center">
                      <span className="text-lg">🇮🇳</span>
                      <span className="font-semibold">INR</span>
                    </div>
                  </div>
                </div>

                {/* Exchange Rate Info */}
                <div className="flex items-center justify-between py-3 px-4 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Exchange Rate</span>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <span className="font-semibold text-foreground">
                      1 {toCurrency} = ₹{selectedRate?.buyRate.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Receive Amount */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Recipient Gets
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={receiveAmount}
                      readOnly
                      className="flex-1 text-lg font-semibold h-14 bg-accent/5 border-accent/20"
                    />
                    <Select value={toCurrency} onValueChange={setToCurrency}>
                      <SelectTrigger className="w-[140px] h-14">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.currency}>
                            <div className="flex items-center gap-2">
                              <span>{country.flag}</span>
                              <span>{country.currency}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Link to="/send-money" className="block">
                  <Button variant="cta" size="lg" className="w-full">
                    Send Money Now
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>

                <p className="text-xs text-center text-muted-foreground">
                  Zero hidden fees • RBI compliant • Secure transfers
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
