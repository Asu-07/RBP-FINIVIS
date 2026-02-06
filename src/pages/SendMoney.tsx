import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { countries, transferMethods } from "@/data/mockData";
import { useForexRates } from "@/hooks/useForexRates";
import { useAuth } from "@/hooks/useAuth";
import { useServiceIntent } from "@/hooks/useServiceIntent";
import { useAutomatedKYC } from "@/hooks/useAutomatedKYC";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { PaymentCheckout } from "@/components/dashboard/PaymentCheckout";
import { rbpBankDetails, generateReferenceCode } from "@/config/bankDetails";
import { sanitizeError, logError } from "@/lib/errorHandler";
import { RegulatoryDisclaimer } from "@/components/RegulatoryDisclaimer";
import { RemittancePurposeSelect, LRS_PURPOSES } from "@/components/remittance/RemittancePurposeSelect";
import { PURPOSE_DOCUMENTS } from "@/components/shared/DocumentUpload";
import { LRSDeclarationCheckbox, LRSDeclarationChoice } from "@/components/compliance/LRSDeclarationCheckbox";
import { RemittanceDeclaration } from "@/components/compliance/RemittanceDeclaration";
import {
  ArrowRight,
  ArrowRightLeft,
  Shield,
  Clock,
  CheckCircle,
  Upload,
  Banknote,
  Loader2,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { calculateExchangeRate, calculateExchangeRateWithBreakdown, ProductType } from "@/utils/pricing";

interface Beneficiary {
  id: string;
  name: string;
  country: string;
  currency: string;
  bank_name: string | null;
  bank_account_number: string | null;
}

const SendMoney = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { rates } = useForexRates();
  const { captureIntent } = useServiceIntent();
  const { verifyKYC, checkExistingKYC, verifying } = useAutomatedKYC();

  const [step, setStep] = useState(1);
  const [sendAmount, setSendAmount] = useState("50000");
  const [toCurrency, setToCurrency] = useState("USD");
  const [toCountry, setToCountry] = useState("US");
  const [transferMethod, setTransferMethod] = useState("bank");
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string>("");
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [referenceCode, setReferenceCode] = useState("");
  const [transactionComplete, setTransactionComplete] = useState(false);
  const [transactionRef, setTransactionRef] = useState("");

  // New beneficiary form fields
  const [recipientName, setRecipientName] = useState("");
  const [recipientBank, setRecipientBank] = useState("");
  const [recipientAccount, setRecipientAccount] = useState("");
  const [recipientSwift, setRecipientSwift] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [pickupCity, setPickupCity] = useState("");

  // Compliance states
  const [purpose, setPurpose] = useState("");
  const [lrsDeclaration, setLrsDeclaration] = useState<LRSDeclarationChoice>(null);
  const [complianceAccepted, setComplianceAccepted] = useState(false);
  const [kycCompleted, setKycCompleted] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);

  const isCashPickup = transferMethod === "cash";

  // Determine product type based on purpose for slab-based pricing
  const getProductType = (purposeValue: string): ProductType => {
    if (purposeValue === "education") return "Education TT";
    if (purposeValue === "gift") return "Gift TT";
    // Default for family_maintenance, travel, medical, etc.
    return "Maintaince TT";
  };

  const productType = getProductType(purpose);
  const selectedRate = rates.find((r) => r.currency === toCurrency);
  const baseIBR = selectedRate?.buyRate || 84;
  const numSendAmount = parseFloat(sendAmount) || 0;

  // Calculate estimated FCY for slab determination, then get final rate with markup
  const estimatedFCY = numSendAmount / baseIBR;
  const slabExchangeRate = calculateExchangeRate(productType, estimatedFCY, baseIBR);

  // Recipient gets: Send Amount (INR) / Exchange Rate (with markup)
  const receiveAmount = numSendAmount > 0
    ? (numSendAmount / slabExchangeRate).toFixed(2)
    : "0";

  const selectedMethod = transferMethods.find((m) => m.id === transferMethod);
  const fee = selectedMethod?.fee || 0;
  const totalAmount = numSendAmount + fee;

  // Calculate USD equivalent for LRS tracking
  const usdRate = rates.find((r) => r.currency === "USD")?.buyRate || 83;
  const usdEquivalent = Math.round(parseFloat(sendAmount) / usdRate);

  // Check if all required documents for the selected purpose are uploaded
  const docsForPurpose = PURPOSE_DOCUMENTS[purpose] ?? [];
  const requiredDocIds = docsForPurpose.filter(d => d.required).map(d => d.id);
  const allRequiredDocsUploaded = requiredDocIds.length === 0 || requiredDocIds.every(id => uploadedDocs.some(u => u.documentId === id));

  const selectedPurpose = LRS_PURPOSES.find((p) => p.value === purpose);

  const steps = [
    { number: 1, title: "Amount", icon: ArrowRightLeft },
    { number: 2, title: "Recipient", icon: Upload },
    { number: 3, title: "Compliance", icon: Shield },
    { number: 4, title: "Payment", icon: CheckCircle },
  ];

  useEffect(() => {
    captureIntent("send_money");
    setReferenceCode(generateReferenceCode("RBPSM"));
  }, []);

  useEffect(() => {
    if (user) {
      fetchBeneficiaries();
    }
  }, [user]);

  const fetchBeneficiaries = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("beneficiaries")
      .select("id, name, country, currency, bank_name, bank_account_number")
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (data) {
      setBeneficiaries(data);
    }
  };

  // Automated KYC verification
  const handleKYCVerification = async () => {
    if (!user) {
      toast.error("Please log in to continue");
      navigate("/auth");
      return;
    }

    // Check existing KYC status first
    const existingKYC = await checkExistingKYC();
    if (existingKYC) {
      setKycCompleted(true);
      toast.success("KYC already verified");
      return;
    }

    // For demo, simulate verification with placeholder documents
    const result = await verifyKYC({
      panNumber: "ABCDE1234F",
      aadhaarNumber: "123456789012",
      fullName: user.user_metadata?.full_name || "User",
      dateOfBirth: "1990-01-01",
    });

    if (result.isVerified) {
      setKycCompleted(true);
      toast.success("KYC verified successfully");
    } else {
      toast.error(result.errors[0] || "KYC verification failed");
    }
  };

  const handlePaymentConfirm = async (paymentMethod: "gateway" | "bank_transfer") => {
    if (!user) {
      toast.error("Please log in to make a transfer");
      navigate("/auth");
      return;
    }

    if (!selectedRate) {
      toast.error("Invalid exchange rate");
      return;
    }

    setSubmitting(true);

    try {
      // Create or get beneficiary
      let beneficiaryId = selectedBeneficiaryId;

      if (!beneficiaryId && recipientName) {
        const { data: newBeneficiary, error: benefError } = await supabase
          .from("beneficiaries")
          .insert({
            user_id: user.id,
            name: recipientName,
            country: toCountry,
            currency: toCurrency,
            bank_name: recipientBank || null,
            bank_account_number: recipientAccount || null,
            bank_swift_code: recipientSwift || null,
          })
          .select("id")
          .single();

        if (benefError) {
          logError("SendMoney.createBeneficiary", benefError);
        } else {
          beneficiaryId = newBeneficiary.id;
        }
      }

      const transferNotes = isCashPickup
        ? `Cash Pickup in ${pickupCity}, ${toCountry}. Recipient: ${recipientName}, Phone: ${recipientPhone}`
        : `Transfer to ${toCountry} via ${selectedMethod?.name}`;

      // Create transaction with payment status
      const { data: txData, error: txError } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          transaction_type: "send",
          source_currency: "INR",
          source_amount: totalAmount,
          destination_currency: toCurrency,
          destination_amount: parseFloat(receiveAmount),
          exchange_rate: slabExchangeRate,
          fee_amount: fee,
          fee_currency: "INR",
          beneficiary_id: beneficiaryId || null,
          status: "pending",
          // compliance_status is omitted to use database default (auto_verified is not a valid value)
          declaration_accepted: true,
          declaration_timestamp: new Date().toISOString(),
          usd_equivalent: usdEquivalent,
          lrs_purpose: purpose,
          notes: `${transferNotes}. Payment via ${paymentMethod}. Reference: ${referenceCode}`,
          purpose: selectedPurpose?.label || "International remittance",
        })
        .select()
        .single();

      if (txError) {
        console.error("SendMoney.createTransaction - FULL ERROR:", JSON.stringify(txError, null, 2));
        logError("SendMoney.createTransaction", txError);
        toast.error(sanitizeError(txError));
        setSubmitting(false);
        return;
      }

      // Verify transaction was actually created
      if (!txData || !txData.id) {
        console.error("SendMoney.createTransaction - Transaction not created, no ID returned");
        toast.error("Transaction failed to save. Please try again.");
        setSubmitting(false);
        return;
      }

      // Link uploaded documents to the transaction
      if (uploadedDocs.length > 0) {
        const filePaths = uploadedDocs.map(d => d.filePath);
        const { error: linkError } = await supabase
          .from("kyc_documents")
          .update({ order_id: txData.id })
          .in("storage_path", filePaths);

        if (linkError) {
          console.error("Failed to link documents to transaction:", linkError);
        }
      }

      console.log("SendMoney - Transaction CREATED successfully:", txData.id, txData.reference_number);

      // Record LRS usage (non-blocking, log errors but don't fail the transaction)
      const currentDate = new Date();
      const financialYear = currentDate.getMonth() >= 3
        ? `${currentDate.getFullYear()}-${currentDate.getFullYear() + 1}`
        : `${currentDate.getFullYear() - 1}-${currentDate.getFullYear()}`;

      const { error: lrsError } = await supabase.from("lrs_usage").insert({
        user_id: user.id,
        transaction_id: txData.id,
        amount_usd: usdEquivalent,
        financial_year: financialYear,
        service_type: "remittance",
        purpose: purpose,
      });

      if (lrsError) {
        console.error("SendMoney.lrsUsage - LRS INSERT FAILED:", JSON.stringify(lrsError, null, 2));
        logError("SendMoney.lrsUsage", lrsError);
        // Don't fail the transaction, just log - LRS tracking is secondary
      }

      setTransactionRef(txData.reference_number || txData.id.slice(0, 8).toUpperCase());
      setTransactionComplete(true);

      toast.success("Transfer initiated successfully!");

      // Send email notification
      const selectedBeneficiary = beneficiaries.find(b => b.id === beneficiaryId);
      const recipientDisplayName = selectedBeneficiary?.name || recipientName || "Recipient";

      supabase.functions.invoke("send-notification-email", {
        body: {
          type: "transfer",
          email: user.email,
          name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Customer",
          amount: totalAmount,
          currency: "INR",
          recipientName: recipientDisplayName,
          recipientCurrency: toCurrency,
          recipientAmount: parseFloat(receiveAmount),
          exchangeRate: slabExchangeRate,
          referenceNumber: txData?.reference_number || "N/A",
        },
      }).catch((err) => logError("SendMoney.emailNotification", err));

    } catch (error) {
      logError("SendMoney.transfer", error);
      toast.error(sanitizeError(error));
    }

    setSubmitting(false);
  };

  const resetForm = () => {
    setStep(1);
    setSendAmount("50000");
    setSelectedBeneficiaryId("");
    setRecipientName("");
    setRecipientBank("");
    setRecipientAccount("");
    setRecipientSwift("");
    setRecipientPhone("");
    setPickupCity("");
    setPurpose("");
    setLrsDeclaration(null);
    setComplianceAccepted(false);
    setKycCompleted(false);
    setTransactionComplete(false);
    setTransactionRef("");
    setReferenceCode(generateReferenceCode("RBPSM"));
    setUploadedDocs([]);
  };

  const canProceedStep1 = parseFloat(sendAmount) >= 1000 && purpose && allRequiredDocsUploaded;
  const canProceedStep2 = selectedBeneficiaryId || (
    recipientName.trim().length > 0 &&
    (isCashPickup ? (recipientPhone.trim().length > 0 && pickupCity.trim().length > 0) : true)
  );
  const canProceedStep3 = kycCompleted &&
    lrsDeclaration === "within_limit" &&
    complianceAccepted;

  // Show success screen
  if (transactionComplete) {
    return (
      <>
        <Helmet>
          <title>Transfer Submitted - RBP FINIVIS</title>
        </Helmet>
        <Layout>
          <section className="py-16 bg-background">
            <div className="container-custom max-w-lg">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="border-green-500/20 bg-green-500/5">
                  <CardContent className="pt-8 text-center">
                    <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-heading font-bold mb-2">Transfer Initiated!</h2>
                    <p className="text-muted-foreground mb-6">
                      Your international remittance is being processed. ETA: 12–48 business hours.
                    </p>

                    <div className="bg-card p-6 rounded-lg border mb-6 text-left space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Reference</span>
                        <span className="font-mono font-medium">{transactionRef}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount Paid</span>
                        <span className="font-medium">₹{totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Recipient Gets</span>
                        <span className="font-medium text-green-600">{toCurrency} {receiveAmount}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-left mb-6">
                      <FileCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        Form A2 has been generated and will be submitted to the Authorized Dealer as per RBI guidelines.
                      </p>
                    </div>

                    <div className="flex gap-4 justify-center">
                      <Button onClick={resetForm}>New Transfer</Button>
                      <Button variant="outline" onClick={() => navigate("/dashboard")}>
                        Go to Dashboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </section>
        </Layout>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Send Money Abroad - International Remittance | RBP FINIVIS</title>
        <meta
          name="description"
          content="Send money internationally with the best exchange rates. Fast, secure transfers to 100+ countries. RBI-licensed FFMC."
        />
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
                Send Money Abroad
              </h1>
              <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
                Fast, secure, and affordable international money transfers to
                100+ countries worldwide.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-12 bg-background">
          <div className="container-custom">
            {/* Auth Warning */}
            {!authLoading && !user && (
              <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <p className="text-sm">
                  Please <button onClick={() => navigate("/auth")} className="font-medium underline">log in</button> to complete your transfer.
                </p>
              </div>
            )}

            {/* Progress Steps */}
            <div className="flex justify-center mb-10">
              <div className="flex items-center">
                {steps.map((s, index) => (
                  <div key={s.number} className="flex items-center">
                    <div
                      className={`flex items-center gap-2 px-4 py-2 rounded-full ${step >= s.number
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                        }`}
                    >
                      <s.icon className="h-4 w-4" />
                      <span className="text-sm font-medium hidden sm:inline">
                        {s.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-8 sm:w-12 h-0.5 ${step > s.number ? "bg-accent" : "bg-muted"
                          }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Form */}
              <div className="lg:col-span-2">
                {step === 4 ? (
                  <PaymentCheckout
                    serviceName="International Remittance"
                    fees={[
                      { label: "Transfer Amount", amount: parseFloat(sendAmount), currency: "INR", type: "base" },
                      { label: "Transfer Fee", amount: fee, currency: "INR", type: "fee" },
                      { label: "Total Payable", amount: totalAmount, currency: "INR", type: "total" },
                    ]}
                    totalAmount={totalAmount}
                    totalCurrency="INR"
                    onConfirm={handlePaymentConfirm}
                    onCancel={() => setStep(3)}
                    bankDetails={{
                      ...rbpBankDetails,
                      referenceCode,
                    }}
                    isProcessing={submitting}
                  />
                ) : (
                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle className="font-heading">
                        {step === 1 && "Enter Transfer Details"}
                        {step === 2 && "Select Recipient"}
                        {step === 3 && "Compliance & Declaration"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {step === 1 && (
                        <div className="space-y-6">
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <Label>You Send</Label>
                              <div className="flex gap-2 mt-2">
                                <Input
                                  type="number"
                                  value={sendAmount}
                                  onChange={(e) => setSendAmount(e.target.value)}
                                  className="flex-1 text-lg font-semibold"
                                  min="1000"
                                />
                                <div className="flex items-center gap-2 px-4 bg-muted rounded-lg">
                                  <span>🇮🇳</span>
                                  <span className="font-semibold">INR</span>
                                </div>
                              </div>
                              {parseFloat(sendAmount) < 1000 && (
                                <p className="text-xs text-destructive mt-1">Minimum amount is ₹1,000</p>
                              )}
                            </div>
                            <div>
                              <Label>Recipient Gets</Label>
                              <div className="flex gap-2 mt-2">
                                <Input
                                  type="text"
                                  value={receiveAmount}
                                  readOnly
                                  className="flex-1 text-lg font-semibold bg-accent/5"
                                />
                                <Select
                                  value={toCurrency}
                                  onValueChange={setToCurrency}
                                >
                                  <SelectTrigger className="w-[120px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {countries.map((c) => (
                                      <SelectItem key={c.code} value={c.currency}>
                                        {c.flag} {c.currency}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label>Destination Country</Label>
                            <Select value={toCountry} onValueChange={setToCountry}>
                              <SelectTrigger className="mt-2">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {countries.map((c) => (
                                  <SelectItem key={c.code} value={c.code}>
                                    {c.flag} {c.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Purpose Selection - Required for LRS */}
                          <RemittancePurposeSelect
                            value={purpose}
                            onChange={setPurpose}
                            showDocumentRequirements={true}
                            error={!purpose ? "Purpose is required for international remittance" : undefined}
                            onUploaded={(doc) => setUploadedDocs(prev => [...prev, doc])}
                          />

                          <div>
                            <Label>Transfer Method</Label>
                            <div className="grid sm:grid-cols-3 gap-3 mt-2">
                              {transferMethods.map((method) => (
                                <button
                                  key={method.id}
                                  onClick={() => setTransferMethod(method.id)}
                                  className={`p-4 rounded-xl border-2 text-left transition-all ${transferMethod === method.id
                                    ? "border-accent bg-accent/5"
                                    : "border-border hover:border-accent/50"
                                    }`}
                                >
                                  <div className="font-semibold text-foreground">
                                    {method.name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {method.time}
                                  </div>
                                  <div className="text-sm text-accent font-medium mt-1">
                                    {method.fee === 0 ? "Free" : `₹${method.fee} fee`}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          <Button
                            variant="cta"
                            size="lg"
                            className="w-full"
                            onClick={() => setStep(2)}
                            disabled={!canProceedStep1}
                          >
                            Continue
                            <ArrowRight className="h-5 w-5 ml-2" />
                          </Button>
                        </div>
                      )}

                      {step === 2 && (
                        <div className="space-y-6">
                          {beneficiaries.length > 0 && (
                            <div>
                              <Label>Select Saved Beneficiary</Label>
                              <Select
                                value={selectedBeneficiaryId || "new"}
                                onValueChange={(v) => {
                                  if (v === "new") {
                                    setSelectedBeneficiaryId("");
                                  } else {
                                    setSelectedBeneficiaryId(v);
                                    setRecipientName("");
                                    setRecipientBank("");
                                    setRecipientAccount("");
                                    setRecipientSwift("");
                                  }
                                }}
                              >
                                <SelectTrigger className="mt-2">
                                  <SelectValue placeholder="Choose a saved recipient" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="new">Add new recipient</SelectItem>
                                  {beneficiaries.map((b) => (
                                    <SelectItem key={b.id} value={b.id}>
                                      {b.name} - {b.bank_name || b.country}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {!selectedBeneficiaryId && (
                            <>
                              <div className="border-t pt-4">
                                <p className="text-sm text-muted-foreground mb-4">
                                  Or enter new recipient details {isCashPickup && "(Cash Pickup)"}:
                                </p>
                              </div>
                              <div className="grid sm:grid-cols-2 gap-4">
                                <div className="col-span-2">
                                  <Label>Recipient Name *</Label>
                                  <Input
                                    value={recipientName}
                                    onChange={(e) => setRecipientName(e.target.value)}
                                    className="mt-2"
                                    placeholder="Full name as per ID"
                                  />
                                </div>

                                {isCashPickup ? (
                                  <>
                                    <div>
                                      <Label>Recipient Phone *</Label>
                                      <Input
                                        value={recipientPhone}
                                        onChange={(e) => setRecipientPhone(e.target.value)}
                                        className="mt-2"
                                        placeholder="+1 234 567 8900"
                                      />
                                    </div>
                                    <div>
                                      <Label>Pickup City *</Label>
                                      <Input
                                        value={pickupCity}
                                        onChange={(e) => setPickupCity(e.target.value)}
                                        className="mt-2"
                                        placeholder="New York"
                                      />
                                    </div>
                                    <div className="col-span-2 p-4 bg-muted rounded-lg">
                                      <div className="flex items-start gap-3">
                                        <Banknote className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                                        <div>
                                          <p className="font-medium text-sm">Cash Pickup Instructions</p>
                                          <p className="text-xs text-muted-foreground mt-1">
                                            Recipient will receive a pickup code via SMS. They can collect cash from any partner location in {pickupCity || "the selected city"} within 4 hours.
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div>
                                      <Label>Bank Name</Label>
                                      <Input
                                        value={recipientBank}
                                        onChange={(e) => setRecipientBank(e.target.value)}
                                        className="mt-2"
                                        placeholder="Bank of America"
                                      />
                                    </div>
                                    <div>
                                      <Label>Account Number</Label>
                                      <Input
                                        value={recipientAccount}
                                        onChange={(e) => setRecipientAccount(e.target.value)}
                                        className="mt-2"
                                        placeholder="1234567890"
                                      />
                                    </div>
                                    <div className="col-span-2">
                                      <Label>SWIFT/BIC Code</Label>
                                      <Input
                                        value={recipientSwift}
                                        onChange={(e) => setRecipientSwift(e.target.value)}
                                        className="mt-2"
                                        placeholder="BOFAUS3N"
                                      />
                                    </div>
                                  </>
                                )}
                              </div>
                            </>
                          )}

                          <div className="flex gap-4">
                            <Button
                              variant="outline"
                              size="lg"
                              onClick={() => setStep(1)}
                            >
                              Back
                            </Button>
                            <Button
                              variant="cta"
                              size="lg"
                              className="flex-1"
                              onClick={() => setStep(3)}
                              disabled={!canProceedStep2}
                            >
                              Continue to Compliance
                              <ArrowRight className="h-5 w-5 ml-2" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {step === 3 && (
                        <div className="space-y-6">
                          {/* Automated KYC Section */}
                          <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2">
                              <Shield className="h-5 w-5 text-primary" />
                              Digital KYC Verification
                            </h3>

                            {!kycCompleted ? (
                              <div className="p-4 bg-muted/50 rounded-lg border">
                                <p className="text-sm text-muted-foreground mb-4">
                                  KYC verification is required as per RBI guidelines and is completed digitally for faster processing.
                                </p>
                                <Button
                                  onClick={handleKYCVerification}
                                  disabled={verifying}
                                  className="w-full"
                                >
                                  {verifying ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Verifying...
                                    </>
                                  ) : (
                                    "Verify KYC"
                                  )}
                                </Button>
                              </div>
                            ) : (
                              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                  <span className="font-medium text-green-700 dark:text-green-400">
                                    KYC verified successfully
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* LRS Declaration - Two Option System with Assisted Handling */}
                          <LRSDeclarationCheckbox
                            selected={lrsDeclaration}
                            onSelect={setLrsDeclaration}
                            usdAmount={usdEquivalent}
                            disabled={!kycCompleted}
                            serviceType="International Remittance"
                            referenceId={referenceCode}
                            purpose={selectedPurpose?.label}
                          />

                          {/* Streamlined Compliance Declaration */}
                          {lrsDeclaration === "within_limit" && (
                            <RemittanceDeclaration
                              accepted={complianceAccepted}
                              onAcceptChange={setComplianceAccepted}
                              disabled={!kycCompleted}
                            />
                          )}

                          <div className="flex gap-4">
                            <Button
                              variant="outline"
                              size="lg"
                              onClick={() => setStep(2)}
                            >
                              Back
                            </Button>
                            <Button
                              variant="cta"
                              size="lg"
                              className="flex-1"
                              onClick={() => setStep(4)}
                              disabled={!canProceedStep3}
                            >
                              Proceed to Payment
                              <ArrowRight className="h-5 w-5 ml-2" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Summary Sidebar */}
              <div className="space-y-6">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="font-heading text-lg">
                      Transfer Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(() => {
                      const breakdown = calculateExchangeRateWithBreakdown(productType, estimatedFCY, baseIBR);
                      const serviceChargeTotal = numSendAmount - (parseFloat(receiveAmount) * breakdown.baseRate);
                      return (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Amount</span>
                            <span className="font-medium">
                              ₹{parseFloat(sendAmount || "0").toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Currency Rate</span>
                            <span className="font-medium">
                              1 {toCurrency} = ₹{breakdown.baseRate.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Service Charges ({breakdown.markupPercent.toFixed(2)}%)</span>
                            <span className="font-medium">
                              ₹{serviceChargeTotal.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Transfer Fee</span>
                            <span className="font-medium">
                              {fee === 0 ? "Free" : `₹${fee}`}
                            </span>
                          </div>
                          <div className="border-t pt-4">
                            <div className="flex justify-between mb-2">
                              <span className="font-semibold">Total Payable</span>
                              <span className="font-bold">₹{totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-semibold">Recipient Gets</span>
                              <span className="font-bold text-accent">
                                {toCurrency} {receiveAmount}
                              </span>
                            </div>
                          </div>
                          {purpose && (
                            <div className="pt-2 border-t">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Purpose</span>
                                <span className="font-medium">{selectedPurpose?.label}</span>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>

                <Card className="shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                        <Shield className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">RBI Licensed</h3>
                        <p className="text-sm text-muted-foreground">
                          Fully compliant with FEMA regulations. Your money is
                          safe with us.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-card">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                        <Clock className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Fast Delivery</h3>
                        <p className="text-sm text-muted-foreground">
                          ETA: 12–48 business hours to most destinations worldwide.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Regulatory Compact Notice */}
                <RegulatoryDisclaimer serviceType="remittance" variant="compact" />
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default SendMoney;
