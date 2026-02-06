import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useServiceIntent } from "@/hooks/useServiceIntent";
import { useLRSUsage } from "@/hooks/useLRSUsage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useForexRates } from "@/hooks/useForexRates";
import { calculateExchangeRate, calculateExchangeRateWithBreakdown } from "@/utils/pricing";

import { LRSLimitTracker } from "@/components/remittance/LRSLimitTracker";
import { ForexCardDeclaration } from "@/components/compliance/ForexCardDeclaration";
import { DocumentUpload, UploadedDocument } from "@/components/shared/DocumentUpload";

import {
  CreditCard,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  FileText,
  User,
  MapPin,
  AlertCircle,
  Clock,
  Shield,
  Plus,
  RefreshCw,
} from "lucide-react";

/* =======================
   LOCAL DOCUMENT CONFIG
   (CRITICAL FIX)
======================= */

const FOREX_CARD_DOCUMENTS = [
  {
    id: "passport",
    label: "Passport",
    required: true,
    description: "Valid passport (front & back)",
  },
  {
    id: "visa",
    label: "Visa / Travel Proof",
    required: false,
    description: "Visa, ticket, or travel confirmation (if available)",
  },
  {
    id: "pan",
    label: "PAN Card",
    required: true,
    description: "PAN required for FEMA & RBI compliance",
  },
];

type ApplicationMode = "new" | "topup";

const ForexCardApply = () => {
  const { user, loading: authLoading } = useAuth();
  const { rates } = useForexRates();
  const { captureIntent, refreshIntents } = useServiceIntent();
  const { recordLRSUsage } = useLRSUsage();
  const navigate = useNavigate();

  const [mode, setMode] = useState<ApplicationMode | null>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);

  // Form data for new card application
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    travelPurpose: "",
    destinationCountry: "",
    travelDate: "",
    initialLoadAmount: "50000",
    initialLoadCurrency: "USD",
    // Topup specific fields
    cardNumberMasked: "",
  });

  useEffect(() => {
    captureIntent("forex_card");
  }, []);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  const handleInputChange = (k: string, v: string) =>
    setFormData((p) => ({ ...p, [k]: v }));

  const requiredDocs = FOREX_CARD_DOCUMENTS.filter((d) => d.required);
  const canProceedStep3 = requiredDocs.every((doc) =>
    uploadedDocs.some((u) => u.documentId === doc.id)
  );

  // ====== SUBMIT APPLICATION TO DATABASE ======
  const handleSubmitApplication = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Calculate USD equivalent for LRS tracking
      const loadAmount = parseFloat(formData.initialLoadAmount) || 0;
      let usdEquivalent = loadAmount;

      // Use live rates from useForexRates hook
      if (formData.initialLoadCurrency !== "USD") {
        // First, find the rate for the selected currency to get INR equivalent
        const currencyRate = rates.find(r => r.currency === formData.initialLoadCurrency);
        const usdRate = rates.find(r => r.currency === "USD");

        if (currencyRate && usdRate && usdRate.buyRate > 0) {
          // Convert: foreign currency -> INR -> USD
          // Amount in foreign currency * (foreign/INR rate) / (USD/INR rate)
          const inrEquivalent = loadAmount * currencyRate.buyRate;
          usdEquivalent = inrEquivalent / usdRate.buyRate;
        } else {
          // Fallback to approximate rates if live rates not available
          if (formData.initialLoadCurrency === "EUR") usdEquivalent = loadAmount * 1.08;
          else if (formData.initialLoadCurrency === "GBP") usdEquivalent = loadAmount * 1.25;
          else if (formData.initialLoadCurrency === "AUD") usdEquivalent = loadAmount * 0.65;
          else if (formData.initialLoadCurrency === "CAD") usdEquivalent = loadAmount * 0.74;
        }
      }

      // Insert into service_applications table
      // Insert into service_applications table
      const { data: appData, error } = await supabase
        .from("service_applications")
        .insert({
          user_id: user.id,
          service_type: "forex_card",
          application_status: "applied",
          load_amount: loadAmount,
          load_currency: formData.initialLoadCurrency,
          usd_equivalent: usdEquivalent,
          application_data: {
            ...formData,
            is_topup: mode === "topup",
            application_type: mode,
            card_number_masked: mode === "topup" ? formData.cardNumberMasked : null,
            documents: uploadedDocs.map(d => d.filePath),
            declaration_accepted: true,
            declaration_timestamp: new Date().toISOString(),
          },
          documents: uploadedDocs.map(d => ({
            documentId: d.documentId,
            fileName: d.fileName,
            filePath: d.filePath,
          })),
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Link uploaded documents to the order
      if (uploadedDocs.length > 0 && appData) {
        const filePaths = uploadedDocs.map(d => d.filePath);
        const { error: linkError } = await supabase
          .from("kyc_documents")
          .update({ order_id: appData.id })
          .in("storage_path", filePaths);

        if (linkError) {
          console.error("Failed to link documents to forex card application:", linkError);
        }
      }

      // Record LRS usage if applicable
      if (usdEquivalent > 0) {
        await recordLRSUsage({
          serviceType: "forex_card",
          amountUSD: usdEquivalent,
          purpose: mode === "topup" ? "forex_card_topup" : "forex_card_new",
        });
      }

      setApplicationSubmitted(true);
      await refreshIntents();

      toast.success("Your Forex Card application has been submitted!");
    } catch (error: any) {
      console.error("Application error:", error);
      toast.error(error.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
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

  /* =======================
     SUCCESS STATE
  ======================= */

  if (applicationSubmitted) {
    return (
      <Layout>
        <section className="py-12">
          <div className="container-custom max-w-2xl">
            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="pt-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">
                  Forex Card Application Submitted
                </h2>
                <p className="text-muted-foreground mb-6">
                  Your application is under verification.
                </p>
                <Button onClick={() => navigate("/dashboard")}>
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </Layout>
    );
  }

  /* =======================
     MODE SELECTION
  ======================= */

  if (mode === null) {
    return (
      <Layout>
        <section className="py-12">
          <div className="container-custom max-w-3xl grid md:grid-cols-2 gap-6">
            <Card
              className="cursor-pointer hover:shadow-lg"
              onClick={() => setMode("new")}
            >
              <CardContent className="pt-8 text-center">
                <Plus className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold">Apply New Forex Card</h3>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg"
              onClick={() => setMode("topup")}
            >
              <CardContent className="pt-8 text-center">
                <RefreshCw className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold">Top-Up Existing Card</h3>
              </CardContent>
            </Card>
          </div>
        </section>
      </Layout>
    );
  }

  /* =======================
     TOP-UP FLOW
  ======================= */
  if (mode === "topup") {
    return (
      <Layout>
        <section className="py-12">
          <div className="container-custom max-w-3xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Top-Up Existing Forex Card
                </CardTitle>
                <CardDescription>
                  Add funds to your existing forex card
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Card Details */}
                <div className="space-y-4">
                  <div>
                    <Label>Card Number (Last 4 digits)*</Label>
                    <Input
                      value={formData.cardNumberMasked}
                      onChange={(e) => handleInputChange("cardNumberMasked", e.target.value)}
                      className="mt-2"
                      placeholder="XXXX-XXXX-XXXX-1234"
                      maxLength={19}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Top-Up Amount*</Label>
                      <Input
                        type="number"
                        value={formData.initialLoadAmount}
                        onChange={(e) => handleInputChange("initialLoadAmount", e.target.value)}
                        className="mt-2"
                        placeholder="1000"
                      />
                    </div>
                    <div>
                      <Label>Currency*</Label>
                      <Select
                        value={formData.initialLoadCurrency}
                        onValueChange={(v) => handleInputChange("initialLoadCurrency", v)}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">$ USD</SelectItem>
                          <SelectItem value="EUR">€ EUR</SelectItem>
                          <SelectItem value="GBP">£ GBP</SelectItem>
                          <SelectItem value="AUD">A$ AUD</SelectItem>
                          <SelectItem value="CAD">C$ CAD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Document Upload */}
                <DocumentUpload
                  userId={user!.id}
                  documents={[
                    { id: "pan", label: "PAN Card", required: true, description: "Required for FEMA compliance" },
                  ]}
                  serviceType="forex_card"
                  uploadedDocs={uploadedDocs}
                  onUploadComplete={(docs) => setUploadedDocs(docs)}
                />

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setMode(null)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={!formData.cardNumberMasked || !formData.initialLoadAmount || !uploadedDocs.some(d => d.documentId === 'pan') || loading}
                    onClick={handleSubmitApplication}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Top-Up Request
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </Layout>
    );
  }

  /* =======================
     NEW CARD FLOW
  ======================= */

  return (
    <Layout>
      <section className="py-12">
        <div className="container-custom max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Upload Documents</CardTitle>
              <CardDescription>
                Required for Forex Card issuance
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Load Amount for new card */}
              <div className="mb-6 grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Initial Load Amount*</Label>
                  <Input
                    type="number"
                    value={formData.initialLoadAmount}
                    onChange={(e) => handleInputChange("initialLoadAmount", e.target.value)}
                    className="mt-2"
                    placeholder="50000"
                  />
                </div>
                <div>
                  <Label>Currency*</Label>
                  <Select
                    value={formData.initialLoadCurrency}
                    onValueChange={(v) => handleInputChange("initialLoadCurrency", v)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">$ USD</SelectItem>
                      <SelectItem value="EUR">€ EUR</SelectItem>
                      <SelectItem value="GBP">£ GBP</SelectItem>
                      <SelectItem value="AUD">A$ AUD</SelectItem>
                      <SelectItem value="CAD">C$ CAD</SelectItem>
                    </SelectContent>

                  </Select>
                </div>
              </div>

              {/* Pricing Display */}
              {formData.initialLoadAmount && formData.initialLoadCurrency && (() => {
                const loadAmt = parseFloat(formData.initialLoadAmount) || 0;
                const rateObj = rates.find(r => r.currency === formData.initialLoadCurrency);
                const baseRate = rateObj ? rateObj.sellRate : 84.0;
                const breakdown = calculateExchangeRateWithBreakdown("Currency Card", loadAmt, baseRate);
                const serviceChargeTotal = breakdown.serviceChargePerUnit * loadAmt;
                const totalPayable = loadAmt * breakdown.finalRate;

                return (
                  <div className="mb-6 p-4 bg-muted/50 rounded-lg space-y-2">
                    {/* Base Currency Rate */}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Currency Rate</span>
                      <span className="font-mono">
                        1 {formData.initialLoadCurrency} = ₹{breakdown.baseRate.toFixed(2)}
                      </span>
                    </div>
                    {/* Service Charges */}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Service Charges ({breakdown.markupPercent.toFixed(2)}%)
                      </span>
                      <span className="font-mono">
                        ₹{serviceChargeTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="h-px bg-border my-2" />
                    {/* Total Payable */}
                    <div className="flex justify-between font-medium">
                      <span>Total Payable</span>
                      <span className="text-primary">
                        ₹{totalPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                );
              })()}

              <DocumentUpload
                userId={user!.id}
                documents={FOREX_CARD_DOCUMENTS}
                serviceType="forex_card"
                uploadedDocs={uploadedDocs}
                onUploadComplete={(docs) => setUploadedDocs(docs)}
              />

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setMode(null)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  className="flex-1"
                  disabled={!canProceedStep3 || loading}
                  onClick={handleSubmitApplication}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default ForexCardApply;