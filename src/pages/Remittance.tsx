import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useForexRates } from "@/hooks/useForexRates";
import { useServiceIntent } from "@/hooks/useServiceIntent";
import { useLRSUsage } from "@/hooks/useLRSUsage";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PaymentCheckout } from "@/components/dashboard/PaymentCheckout";
import { rbpBankDetails, currencySymbols, generateReferenceCode } from "@/config/bankDetails";
import { LRSLimitTracker } from "@/components/remittance/LRSLimitTracker";
import { RemittancePurposeSelect } from "@/components/remittance/RemittancePurposeSelect";
import { FEMADeclaration } from "@/components/remittance/FEMADeclaration";
import { RemittanceReceipt } from "@/components/remittance/RemittanceReceipt";
import { DocumentUpload, PURPOSE_DOCUMENTS, UploadedDocument } from "@/components/shared/DocumentUpload";
import {
  Globe,
  Loader2,
  CheckCircle,
  Clock,
  Shield,
  ArrowRight,
  AlertTriangle,
  Upload,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { calculateExchangeRate, calculateExchangeRateWithBreakdown } from "@/utils/pricing";

interface Profile {
  kyc_status: string;
  full_name?: string | null;
  kyc_verified_at?: string | null;
}

const countries = [
  { code: "US", name: "United States", currency: "USD", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", currency: "GBP", flag: "🇬🇧" },
  { code: "EU", name: "Europe", currency: "EUR", flag: "🇪🇺" },
  { code: "AE", name: "United Arab Emirates", currency: "AED", flag: "🇦🇪" },
  { code: "SG", name: "Singapore", currency: "SGD", flag: "🇸🇬" },
  { code: "AU", name: "Australia", currency: "AUD", flag: "🇦🇺" },
];

const Remittance = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { rates } = useForexRates();
  const { captureIntent } = useServiceIntent();
  const { lrsData, loading: lrsLoading, recordLRSUsage } = useLRSUsage();

  useEffect(() => {
    captureIntent("send_money");
  }, [captureIntent]);

  const [step, setStep] = useState<"calculate" | "purpose" | "documents" | "declaration" | "payment" | "complete">("calculate");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [sendCurrency] = useState("INR");
  const [sendAmount, setSendAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [transactionRef, setTransactionRef] = useState("");
  const [referenceCode, setReferenceCode] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState("");
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [transactionData, setTransactionData] = useState<any>(null);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);

  // determine if all documents (and therefore required docs) for the selected purpose are uploaded
  const docsForPurpose = PURPOSE_DOCUMENTS[selectedPurpose] ?? [];
  const allDocIds = docsForPurpose.map(d => d.id);
  const allDocsUploaded = allDocIds.length > 0 && allDocIds.every(id => uploadedDocs.some(u => u.documentId === id));

  const country = countries.find(c => c.code === selectedCountry);
  const receiveCurrency = country?.currency || "USD";
  const numAmount = parseFloat(sendAmount) || 0;

  /* ----------------------------------
     PRICING LOGIC
  ----------------------------------- */
  // Determine product based on purpose
  const getProductType = (purpose: string) => {
    if (purpose === "education") return "Education TT";
    if (purpose === "gift") return "Gift TT";
    // Default to Maintenance TT for family_maintenance, travel, etc as fallback
    // pending specific mapping for other keys if needed, but Maintenance is a safe general category for personal transfers
    return "Maintaince TT";
  };

  const productType = getProductType(selectedPurpose);

  // Get Raw IBR Rate (Simulated or from Hook)
  const getBaseIBR_Rate = () => {
    const rate = rates.find(r => r.currency === receiveCurrency);
    // If receiveCurrency is USD, rate.sellRate is approx 84. IBR should be slightly lower than sellRate typically, 
    // but here we treat the 'rate.sellRate' from the hook as the base reference or derive IBR.
    // For simplicity in this context, we will treat the hook's rate as the IBR base if it's raw, 
    // OR if the hook already includes a markup, we might need to strip it. 
    // Assuming hook returns a market rate (approx IBR).
    return rate ? rate.sellRate : 84.00;
  };

  const ibrRate = getBaseIBR_Rate();
  // Calculate estimated FCY first to determine the correct slab
  const estimatedFCY = numAmount / ibrRate;

  // Calculate Exchange Rate based on estimated FCY (which determines the INR slab in pricing.ts)
  const exchangeRate = calculateExchangeRate(productType, estimatedFCY, ibrRate);

  // DEBUG: Log the calculation values
  console.log('🔍 Pricing Debug:', {
    productType,
    numAmount,
    ibrRate,
    estimatedFCY,
    exchangeRate,
    receiveCurrency,
    selectedPurpose
  });

  // Recipient Amount = FCY they get
  const receiveAmount = numAmount / exchangeRate;

  // Clean up unused variables if any
  // const estimatedFCY = numAmount / ibrRate; // Already calculated
  // const finalExchangeRate ... // Redundant now

  // Final FCY is the same as receiveAmount now
  const finalReceiveAmount = receiveAmount;

  // Swap logic if the UI was actually "You Send FCY" vs "You Send INR".
  // Looking at code: Send Currency is INR. Recipient Gets FCY.
  // So Exchange Rate displayed should be INR/FCY (e.g., 85.50).
  // Formula: 1 FCY = X INR.
  // Recipient Amount = Send Amount (INR) / Exchange Rate.

  const fee = 0; // Fee is now included in the rate markup
  const totalAmount = numAmount + fee; // Should be just numAmount if fee is 0, but keeping structure

  const estimatedDelivery = "1-2 business days";

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    setReferenceCode(generateReferenceCode("RBPREM"));
  }, []);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("kyc_status")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) setProfile(data as Profile);
  };

  // Calculate USD equivalent for LRS tracking
  const usdEquivalent = receiveCurrency === "USD" ? receiveAmount : receiveAmount * (rates.find(r => r.currency === "USD")?.sellRate || 84);

  const handleContinue = () => {
    if (!user) {
      navigate("/auth", { state: { redirectTo: "/remittance" } });
      return;
    }

    if (profile?.kyc_status !== "verified") {
      toast({
        title: "KYC Required",
        description: "Please complete KYC verification to proceed with remittance.",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    // Check LRS limit
    if (lrsData && usdEquivalent > lrsData.remainingLimit) {
      toast({
        title: "LRS Limit Exceeded",
        description: `This transaction would exceed your remaining LRS limit of USD ${lrsData.remainingLimit.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }

    setStep("purpose");
  };

  const handlePurposeSelected = () => {
    if (!selectedPurpose) {
      toast({
        title: "Purpose Required",
        description: "Please select the purpose of remittance as per RBI/LRS guidelines.",
        variant: "destructive",
      });
      return;
    }
    setStep("documents");
  };

  const handleDocumentsComplete = () => {
    setStep("declaration");
  };

  const handleDeclarationAccepted = () => {
    if (!declarationAccepted) {
      toast({
        title: "Declaration Required",
        description: "Please accept the FEMA & RBI compliance declaration to proceed.",
        variant: "destructive",
      });
      return;
    }
    setStep("payment");
  };

  const handlePaymentConfirm = async (paymentMethod: "gateway" | "bank_transfer") => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: txData, error: txError } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          transaction_type: "send",
          source_currency: sendCurrency,
          source_amount: numAmount,
          destination_currency: receiveCurrency,
          destination_amount: receiveAmount,
          exchange_rate: exchangeRate,
          fee_amount: fee,
          fee_currency: sendCurrency,
          status: paymentMethod === "bank_transfer" ? "pending" : "processing",
          notes: `Outward remittance to ${country?.name}. Payment via ${paymentMethod}. Reference: ${referenceCode}`,
          purpose: selectedPurpose,
          lrs_purpose: selectedPurpose,
          usd_equivalent: usdEquivalent,
          compliance_status: "pending",
          compliance_notes: "Transaction processed as per RBI FEMA & LRS guidelines",
          declaration_accepted: true,
          declaration_timestamp: new Date().toISOString(),
        })
        .select()
        .single();

      if (txError) throw txError;

      // Record LRS usage
      await recordLRSUsage({
        serviceType: "remittance",
        amountUSD: usdEquivalent,
        purpose: selectedPurpose,
        transactionId: txData.id,
      });

      setTransactionRef(txData.reference_number || txData.id.slice(0, 8).toUpperCase());
      setTransactionData(txData);
      setStep("complete");

      toast({
        title: paymentMethod === "bank_transfer" ? "Remittance Submitted" : "Remittance Processing",
        description: paymentMethod === "bank_transfer"
          ? "Your remittance will be processed once payment is confirmed."
          : "Your remittance request is being processed.",
      });
    } catch (error: any) {
      console.error("Remittance error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep("calculate");
    setSendAmount("");
    setTransactionRef("");
    setReferenceCode(generateReferenceCode("RBPREM"));
    setSelectedPurpose("");
    setDeclarationAccepted(false);
    setTransactionData(null);
    setUploadedDocs([]);
  };

  return (
    <>
      <Helmet>
        <title>International Remittance - Send Money Abroad | RBP FINIVIS</title>
        <meta name="description" content="Send money abroad with competitive exchange rates. RBI-licensed outward remittance under LRS. Fast, secure international transfers." />
      </Helmet>
      <Layout>
        {/* Hero */}
        <section className="gradient-hero py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern opacity-20" />
          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-primary-foreground"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
                International Remittance
              </h1>
              <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
                Send money abroad instantly with the best exchange rates. RBI-licensed & FEMA compliant.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-12 bg-background">
          <div className="container-custom max-w-5xl">
            {step === "complete" ? (
              <RemittanceReceipt
                transactionId={transactionData?.id || transactionRef}
                referenceNumber={transactionRef}
                senderName={profile?.full_name || user?.email || "Customer"}
                recipientName={country?.name || "Recipient"}
                recipientCountry={country?.name || ""}
                sourceAmount={numAmount}
                sourceCurrency={sendCurrency}
                destinationAmount={receiveAmount}
                destinationCurrency={receiveCurrency}
                exchangeRate={exchangeRate}
                fee={fee}
                totalPaid={totalAmount}
                purpose={selectedPurpose}
                purposeCode={`P${selectedPurpose.toUpperCase().slice(0, 4)}`}
                status="pending"
                createdAt={new Date().toISOString()}
                estimatedDelivery={estimatedDelivery}
                kycReference={profile?.kyc_verified_at ? "KYC-VERIFIED" : undefined}
              />
            ) : step === "declaration" ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      FEMA & RBI Compliance Declaration
                    </CardTitle>
                    <CardDescription>
                      Please read and accept the compliance declarations to proceed
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {user && <LRSLimitTracker />}

                    <FEMADeclaration
                      onAccept={setDeclarationAccepted}
                      accepted={declarationAccepted}
                      purpose={selectedPurpose}
                      amount={usdEquivalent}
                      currency="USD"
                      showFullDeclaration={true}
                    />

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setStep("documents")}>
                        Back
                      </Button>
                      <Button
                        className="flex-1"
                        disabled={!declarationAccepted}
                        onClick={handleDeclarationAccepted}
                      >
                        Continue to Payment
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : step === "documents" ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Upload Documents
                    </CardTitle>
                    <CardDescription>
                      Upload required documents for your remittance purpose
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {user && (
                      <DocumentUpload
                        purpose={selectedPurpose}
                        userId={user.id}
                        serviceType="remittance"
                        onUploadComplete={setUploadedDocs}
                        uploadedDocs={uploadedDocs}
                      />
                    )}

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setStep("purpose")}>
                        Back
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={handleDocumentsComplete}
                        disabled={!allDocsUploaded}
                      >
                        Continue to Declaration
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : step === "purpose" ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Purpose of Remittance
                    </CardTitle>
                    <CardDescription>
                      Select the purpose of your remittance as required by RBI under LRS
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Transfer Amount</span>
                        <span className="font-medium">{currencySymbols[sendCurrency]}{numAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Recipient Gets</span>
                        <span className="font-medium">{country?.flag} {receiveCurrency} {receiveAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">USD Equivalent (LRS)</span>
                        <span className="font-mono">~USD {usdEquivalent.toFixed(2)}</span>
                      </div>
                    </div>

                    <RemittancePurposeSelect
                      value={selectedPurpose}
                      onChange={setSelectedPurpose}
                      onUploaded={(doc) =>
                        setUploadedDocs((prev) => {
                          const filtered = prev.filter((d) => d.documentId !== doc.documentId);
                          return [...filtered, doc];
                        })
                      }
                    />

                    {lrsData && usdEquivalent > lrsData.remainingLimit && (
                      <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                        <div className="text-sm text-destructive">
                          <p className="font-medium">LRS Limit Exceeded</p>
                          <p>This transaction exceeds your remaining LRS limit of USD {lrsData.remainingLimit.toLocaleString()}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setStep("calculate")}>
                        Back
                      </Button>
                      <Button
                        className="flex-1"
                        disabled={!selectedPurpose || (lrsData && usdEquivalent > lrsData.remainingLimit)}
                        onClick={handlePurposeSelected}
                      >
                        Continue to Documents
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : step === "payment" ? (
              <PaymentCheckout
                serviceName="International Remittance"
                fees={[
                  { label: "Transfer Amount", amount: numAmount, currency: sendCurrency, type: "base" },
                  { label: "Transfer Fee", amount: fee, currency: sendCurrency, type: "fee" },
                  { label: "Total Amount", amount: totalAmount, currency: sendCurrency, type: "total" },
                ]}
                totalAmount={totalAmount}
                totalCurrency={sendCurrency}
                onConfirm={handlePaymentConfirm}
                onCancel={() => setStep("calculate")}
                bankDetails={{
                  ...rbpBankDetails,
                  referenceCode,
                }}
                isProcessing={loading}
              />
            ) : (
              <div className="grid lg:grid-cols-5 gap-8">
                {/* Calculator */}
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Send Money Abroad
                    </CardTitle>
                    <CardDescription>
                      Calculate your transfer and proceed to payment
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Destination Country */}
                    <div className="space-y-2">
                      <Label>Destination Country</Label>
                      <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map(c => (
                            <SelectItem key={c.code} value={c.code}>
                              <span className="flex items-center gap-2">
                                <span>{c.flag}</span>
                                <span>{c.name}</span>
                                <span className="text-muted-foreground">({c.currency})</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* You Send */}
                    <div className="space-y-2">
                      <Label>You Send</Label>
                      <div className="flex gap-3">
                        <div className="flex items-center gap-2 px-4 bg-muted rounded-lg">
                          <span className="text-lg">{currencySymbols.INR}</span>
                          <span className="font-medium">INR</span>
                        </div>
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          value={sendAmount}
                          onChange={(e) => setSendAmount(e.target.value)}
                          className="flex-1 text-xl"
                          min="1000"
                        />
                      </div>
                      {numAmount > 0 && numAmount < 1000 && (
                        <p className="text-xs text-destructive">Minimum amount is ₹1,000</p>
                      )}
                    </div>

                    {/* Exchange Rate Display */}
                    {(() => {
                      const breakdown = calculateExchangeRateWithBreakdown(productType, estimatedFCY, ibrRate);
                      const serviceChargeTotal = breakdown.serviceChargePerUnit * numAmount / exchangeRate;
                      return (
                        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Currency Rate</span>
                            <span className="font-mono">1 {receiveCurrency} = ₹{breakdown.baseRate.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Service Charges ({breakdown.markupPercent.toFixed(2)}%)</span>
                            <span className="font-mono">₹{(numAmount - (receiveAmount * breakdown.baseRate)).toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Recipient Gets */}
                    <div className="space-y-2">
                      <Label>Recipient Gets</Label>
                      <div className="flex gap-3">
                        <div className="flex items-center gap-2 px-4 bg-muted rounded-lg">
                          <span className="text-lg">{country?.flag}</span>
                          <span className="font-medium">{receiveCurrency}</span>
                        </div>
                        <Input
                          type="text"
                          value={numAmount > 0 ? receiveAmount.toFixed(2) : ""}
                          readOnly
                          className="flex-1 text-xl bg-muted"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {/* Fee & Total */}
                    {numAmount > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-muted p-4 rounded-lg space-y-2"
                      >
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Transfer Fee</span>
                          <span>{currencySymbols[sendCurrency]}{fee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Total to Pay</span>
                          <span className="text-primary">{currencySymbols[sendCurrency]}{totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2 pt-2 border-t text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>Estimated delivery: {estimatedDelivery}</span>
                        </div>
                      </motion.div>
                    )}

                    {/* Regulatory Inline Notice */}
                    <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground mb-4">
                      <Shield className="h-4 w-4 shrink-0 mt-0.5 text-accent" />
                      <p>
                        Processed under LRS (Liberalised Remittance Scheme) as per RBI Master Directions. Annual limit: USD 2,50,000 per individual. KYC & Form A2 required.
                      </p>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      disabled={!allDocsUploaded || numAmount < 1000}
                      onClick={handleContinue}
                    >
                      {!user ? "Login to Continue" : "Continue to Payment"}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>

                {/* Sidebar */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">RBI Licensed</h3>
                          <p className="text-sm text-muted-foreground">
                            Authorized dealer under FEMA. 100% compliant with LRS guidelines.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                          <Clock className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Fast Processing</h3>
                          <p className="text-sm text-muted-foreground">
                            Most transfers complete within 1-2 business days after payment confirmation.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-semibold mb-3">How it works</h4>
                      <ol className="space-y-3 text-sm text-muted-foreground">
                        <li className="flex gap-3">
                          <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">1</span>
                          <span>Enter transfer details and recipient info</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">2</span>
                          <span>Complete payment via bank transfer</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">3</span>
                          <span>We process and send money to recipient</span>
                        </li>
                      </ol>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </section>
      </Layout>
    </>
  );
};

export default Remittance;
