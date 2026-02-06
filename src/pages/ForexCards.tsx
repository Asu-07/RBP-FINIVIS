import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cardBenefits } from "@/data/mockData";
import { useServiceIntent } from "@/hooks/useServiceIntent";
import { RegulatoryDisclaimer } from "@/components/RegulatoryDisclaimer";
import {
  CreditCard,
  Shield,
  Globe,
  Smartphone,
  ArrowRight,
  CheckCircle,
  Wallet,
  Lock,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const ForexCards = () => {
  const { captureIntent } = useServiceIntent();
  const navigate = useNavigate();

  // Capture intent when visiting this page
  useEffect(() => {
    captureIntent("forex_card");
  }, []);

  const cardFeatures = [
    { icon: Globe, title: "Global Acceptance", value: "45M+ Merchants" },
    { icon: CreditCard, title: "Currencies Supported", value: "16+" },
    { icon: Shield, title: "Daily ATM Limit", value: "$1,000" },
    { icon: Wallet, title: "Card Validity", value: "5 Years" },
  ];

  const currencies = [
    "USD", "EUR", "GBP", "AED", "SGD", "AUD", "CAD", "CHF",
    "JPY", "SAR", "THB", "NZD", "HKD", "SEK", "DKK", "NOK",
  ];

  return (
    <>
      <Helmet>
        <title>Prepaid Forex Card - Multi-Currency Travel Card | RBP FINIVIS</title>
        <meta
          name="description"
          content="Get RBP FINIVIS multi-currency prepaid forex card. Load 16+ currencies, zero forex markup, global acceptance at 45M+ merchants. RBI licensed."
        />
      </Helmet>
      <Layout>
        {/* Hero */}
        <section className="gradient-hero py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern opacity-20" />
          <div className="container-custom relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-primary-foreground"
              >
                <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-sm font-medium mb-6">
                  Multi-Currency Travel Card
                </span>
                <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-6">
                  RBP FINIVIS
                  <br />
                  <span className="text-accent">Forex Card</span>
                </h1>
                <p className="text-lg text-primary-foreground/80 mb-8 max-w-lg">
                  The smart way to travel. Load multiple currencies, spend globally,
                  and enjoy zero forex markup on all transactions.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button variant="hero" size="xl" onClick={() => navigate("/forex-card-apply")}>
                    Apply Now
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                  <Button variant="hero-outline" size="xl">
                    Know More
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-accent to-blue-light p-1 rounded-3xl shadow-2xl">
                  <div className="bg-primary rounded-3xl p-8 aspect-[1.6/1] flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="text-primary-foreground">
                        <span className="text-xl font-heading font-bold">RBP</span>
                        <span className="text-xl font-heading font-bold text-accent ml-1">
                          FINIVIS
                        </span>
                      </div>
                      <div className="text-right text-primary-foreground/80 text-sm">
                        MULTI-CURRENCY
                      </div>
                    </div>
                    <div className="text-primary-foreground">
                      <div className="text-xl tracking-[0.25em] font-mono mb-4">
                        •••• •••• •••• 1234
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-xs text-primary-foreground/60">
                            CARDHOLDER
                          </div>
                          <div className="font-medium">YOUR NAME HERE</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-primary-foreground/60">
                            VALID THRU
                          </div>
                          <div className="font-medium">12/29</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-card rounded-xl shadow-xl p-4 animate-float">
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-success" />
                    <span className="text-sm font-medium">Chip & PIN Secured</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-background">
          <div className="container-custom">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {cardFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="text-center shadow-card">
                    <CardContent className="pt-6">
                      <div className="inline-flex p-3 rounded-xl bg-accent/10 mb-4">
                        <feature.icon className="h-6 w-6 text-accent" />
                      </div>
                      <div className="text-2xl font-heading font-bold text-foreground">
                        {feature.value}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {feature.title}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 bg-muted/30">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
                Why Choose RBP FINIVIS Forex Card
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our prepaid forex card is designed for the modern traveler with
                features that make international spending effortless.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cardBenefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full shadow-card">
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-heading font-semibold text-foreground mb-1">
                            {benefit.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Currencies */}
        <section className="py-16 bg-background">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
                Supported Currencies
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Load multiple currencies on a single card and switch between them
                instantly.
              </p>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-3">
              {currencies.map((currency) => (
                <div
                  key={currency}
                  className="px-6 py-3 bg-card rounded-full border border-border shadow-sm font-semibold text-foreground"
                >
                  {currency}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center text-primary-foreground"
            >
              <Smartphone className="h-12 w-12 mx-auto mb-6 text-accent" />
              <h2 className="text-3xl font-heading font-bold mb-4">
                Get Your Card Today
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                Apply online in minutes. Get instant virtual card and physical
                card delivered within 5-7 business days.
              </p>
              <Button variant="hero" size="xl" onClick={() => navigate("/forex-card-apply")}>
                Apply for Free
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Regulatory Disclaimer */}
        <section className="py-12 bg-background">
          <div className="container-custom max-w-4xl">
            <RegulatoryDisclaimer serviceType="forex_card" variant="full" />
          </div>
        </section>
      </Layout>
    </>
  );
};

export default ForexCards;
