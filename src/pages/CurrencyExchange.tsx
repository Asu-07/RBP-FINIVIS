import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useServiceIntent } from "@/hooks/useServiceIntent";
import { Loader2 } from "lucide-react";
import { RegulatoryDisclaimer } from "@/components/RegulatoryDisclaimer";
import type { DenominationBreakdown } from "@/components/currency-exchange/CurrencyDenominationInput";
import type { SettlementDetails } from "@/components/currency-exchange/SellForexSettlement";

// Step Components
import { Step1OrderDetails } from "@/components/currency-exchange/Step1OrderDetails";
import { Step2CustomerDetails } from "@/components/currency-exchange/Step2CustomerDetails";
import { Step3EligibilityCheck } from "@/components/currency-exchange/Step3EligibilityCheck";
import { Step4OrderProcessing } from "@/components/currency-exchange/Step4OrderProcessing";
import { Step5ReviewConfirmation } from "@/components/currency-exchange/Step5ReviewConfirmation";
import { ExchangeProgressBar } from "@/components/currency-exchange/ExchangeProgressBar";

import type { PaymentOption } from "@/components/currency-exchange/PaymentOptionSelector";

export interface ExchangeOrderData {
  exchangeType: "buy" | "sell" | "";
  city: string;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  convertedAmount: number;
  exchangeRate: number;
  serviceFee: number;
  totalAmount: number;
  rateLockAmount: number;
  balanceAmount: number;
  purpose: string;
  travelDate: string;
  declarationAccepted: boolean;
  uploadedDocuments: string[];
  usdEquivalent: number;
  exceedsCashLimit: boolean;
  kycReference: string;
  payeeName: string;
  payeeAddress: string;
  payeePhone: string;
  deliveryAddress: string;
  deliveryDate: string;
  deliveryTimeSlot: string;
  deliveryPreference: "home_delivery" | "branch_pickup";
  orderId?: string;
  orderNumber?: string;
  rateLockedAt?: string;
  // New Sell Forex fields
  denominationBreakdown?: DenominationBreakdown;
  settlementDetails?: SettlementDetails;
  // Payment option (10% advance OR 100% full)
  paymentOption: PaymentOption | null;
  // Rate lock payment status
  rateLockPaymentStatus: "pending" | "paid" | "confirmed";
  rateLockPaymentMethod?: "bank_transfer" | "gateway";
  rateLockReference?: string;
  // Balance settlement
  balanceSettlementStatus: "pending" | "partial" | "completed";
  balanceSettlementMethod?: string;
}

export type ExchangeStep = 
  | "order_details"
  | "customer_details" 
  | "eligibility" 
  | "processing"
  | "confirmation";

const CurrencyExchange = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { captureIntent } = useServiceIntent();

  const [step, setStep] = useState<ExchangeStep>("order_details");
  const [orderData, setOrderData] = useState<ExchangeOrderData>({
    exchangeType: "",
    city: "",
    fromCurrency: "INR",
    toCurrency: "USD",
    amount: 0,
    convertedAmount: 0,
    exchangeRate: 0,
    serviceFee: 0,
    totalAmount: 0,
    rateLockAmount: 0,
    balanceAmount: 0,
    purpose: "",
    travelDate: "",
    declarationAccepted: false,
    uploadedDocuments: [],
    usdEquivalent: 0,
    exceedsCashLimit: false,
    kycReference: "",
    payeeName: "",
    payeeAddress: "",
    payeePhone: "",
    deliveryAddress: "",
    deliveryDate: "",
    deliveryTimeSlot: "",
    deliveryPreference: "home_delivery",
    paymentOption: null,
    rateLockPaymentStatus: "pending",
    balanceSettlementStatus: "pending",
  });

  useEffect(() => {
    captureIntent("currency_exchange");
  }, []);

  useEffect(() => {
    if (!authLoading && !user && step !== "order_details") {
      navigate("/auth", { state: { redirectTo: "/currency-exchange" } });
    }
  }, [user, authLoading, navigate, step]);

  const updateOrderData = (data: Partial<ExchangeOrderData>) => {
    setOrderData(prev => ({ ...prev, ...data }));
  };

  const resetOrder = () => {
    setOrderData({
      exchangeType: "",
      city: "",
      fromCurrency: "INR",
      toCurrency: "USD",
      amount: 0,
      convertedAmount: 0,
      exchangeRate: 0,
      serviceFee: 0,
      totalAmount: 0,
      rateLockAmount: 0,
      balanceAmount: 0,
      purpose: "",
      travelDate: "",
      declarationAccepted: false,
      uploadedDocuments: [],
      usdEquivalent: 0,
      exceedsCashLimit: false,
      kycReference: "",
      payeeName: "",
      payeeAddress: "",
      payeePhone: "",
      deliveryAddress: "",
      deliveryDate: "",
      deliveryTimeSlot: "",
      deliveryPreference: "home_delivery",
      paymentOption: null,
      rateLockPaymentStatus: "pending",
      balanceSettlementStatus: "pending",
    });
    setStep("order_details");
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const renderStep = () => {
    switch (step) {
      case "order_details":
        return (
          <Step1OrderDetails
            orderData={orderData}
            onUpdateData={updateOrderData}
            onContinue={() => {
              if (!user) {
                navigate("/auth", { state: { redirectTo: "/currency-exchange" } });
                return;
              }
              setStep("customer_details");
            }}
          />
        );
      case "customer_details":
        return (
          <Step2CustomerDetails
            orderData={orderData}
            onUpdateData={updateOrderData}
            onBack={() => setStep("order_details")}
            onContinue={() => setStep("eligibility")}
          />
        );
      case "eligibility":
        return (
          <Step3EligibilityCheck
            orderData={orderData}
            onUpdateData={updateOrderData}
            onBack={() => setStep("customer_details")}
            onContinue={() => setStep("processing")}
          />
        );
      case "processing":
        return (
          <Step4OrderProcessing
            orderData={orderData}
            onUpdateData={updateOrderData}
            onBack={() => setStep("eligibility")}
            onContinue={() => setStep("confirmation")}
          />
        );
      case "confirmation":
        return (
          <Step5ReviewConfirmation
            orderData={orderData}
            onBack={() => navigate("/dashboard")}
            onNewOrder={resetOrder}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Currency Exchange - Book Forex | RBP FINIVIS</title>
        <meta name="description" content="Book currency exchange with rate lock. Pay 10% to lock today's rate, balance payable on delivery." />
      </Helmet>
      <Layout>
        <section className="gradient-hero py-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern opacity-20" />
          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-primary-foreground"
            >
              <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-2">
                Currency Exchange
              </h1>
              <p className="text-primary-foreground/80">
                RBI-Compliant Forex • Lock Rates • Home Delivery
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-8 bg-background">
          <div className="container-custom max-w-4xl">
            <ExchangeProgressBar currentStep={step} />

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8">
              <RegulatoryDisclaimer serviceType="currency_exchange" variant="compact" />
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default CurrencyExchange;
