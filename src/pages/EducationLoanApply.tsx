import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useServiceIntent, ServiceApplication } from "@/hooks/useServiceIntent";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ServiceStatusTracker } from "@/components/dashboard/ServiceStatusTracker";
import { EducationLoanDeclaration } from "@/components/compliance/EducationLoanDeclaration";
import {
  GraduationCap,
  Upload,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  FileText,
  User,
  Building,
  DollarSign,
  Clock,
  AlertCircle,
  Shield,
} from "lucide-react";

const EducationLoanApply = () => {
  const { user, loading: authLoading } = useAuth();
  const { captureIntent, applications, refreshIntents } = useServiceIntent();
  const { scrollToTop } = useAutoScroll();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [existingApplication, setExistingApplication] = useState<ServiceApplication | null>(null);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    universityName: "",
    universityCountry: "",
    courseName: "",
    courseDuration: "",
    intakeDate: "",
    loanAmount: "",
    loanCurrency: "USD",
    coApplicantName: "",
    coApplicantRelation: "",
    coApplicantPhone: "",
  });

  const [documents, setDocuments] = useState<{
    offerLetter: File | null;
    passport: File | null;
    academicRecords: File | null;
    incomeProof: File | null;
  }>({
    offerLetter: null,
    passport: null,
    academicRecords: null,
    incomeProof: null,
  });

  useEffect(() => {
    captureIntent("education_loan");
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const existing = applications.find(a => a.service_type === "education_loan");
    if (existing) {
      setExistingApplication(existing);
    }
  }, [applications]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (docType: keyof typeof documents, file: File | null) => {
    setDocuments(prev => ({ ...prev, [docType]: file }));
  };

  const uploadDocuments = async () => {
    if (!user) return [];

    const uploadedDocs: string[] = [];

    for (const [docType, file] of Object.entries(documents)) {
      if (file) {
        const fileExt = file.name.split(".").pop();
        const filePath = `${user.id}/education-loan/${docType}-${Date.now()}.${fileExt}`;

        const { error } = await supabase.storage
          .from("kyc-documents")
          .upload(filePath, file);

        if (!error) {
          uploadedDocs.push(filePath);
        }
      }
    }

    return uploadedDocs;
  };

  const handleSubmitApplication = async () => {
    if (!user) return;

    if (!declarationAccepted) {
      toast.error("Please accept the declaration to continue");
      return;
    }

    setLoading(true);

    try {
      setUploading(true);
      const uploadedDocs = await uploadDocuments();
      setUploading(false);

      const { data, error } = await supabase
        .from("service_applications")
        .insert({
          user_id: user.id,
          service_type: "education_loan",
          application_status: "applied",
          application_data: {
            ...formData,
            documents: uploadedDocs,
            declaration_accepted: true,
            declaration_timestamp: new Date().toISOString(),
          },
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Also insert into kyc_documents table for the admin viewer to work correctly
      if (!error && data && uploadedDocs.length > 0) {
        const kycDocs = uploadedDocs.map(path => {
          // Extract document type from filename (e.g., "offerLetter" from "offerLetter-123.pdf")
          const filename = path.split('/').pop() || "";
          const type = filename.split('-')[0] || "document";

          return {
            user_id: user.id,
            order_id: data.id, // Link to the application ID
            service_type: "education_loan",
            document_type: type,
            storage_bucket: "kyc-documents",
            storage_path: path,
            status: "pending",
          };
        });

        const { error: kycError } = await supabase
          .from("kyc_documents")
          .insert(kycDocs);

        if (kycError) {
          console.error("Failed to link documents to order:", kycError);
          // Don't fail the whole application, just log it
        }
      }

      if (error) throw error;

      setApplicationSubmitted(true);
      scrollToTop();
      await refreshIntents();

      toast.success("Your Education Loan application has been submitted!");
    } catch (error: any) {
      console.error("Application error:", error);
      toast.error(error.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };
  const steps = [
    { number: 1, title: "Personal Details", icon: User },
    { number: 2, title: "University & Course", icon: Building },
    { number: 3, title: "Loan Details", icon: DollarSign },
    { number: 4, title: "Documents", icon: FileText },
    { number: 5, title: "Declaration", icon: Shield },
    { number: 6, title: "Review", icon: CheckCircle },
  ];

  const canProceedStep1 = formData.fullName && formData.email && formData.phone && formData.address;
  const canProceedStep2 = formData.universityName && formData.universityCountry && formData.courseName;
  const canProceedStep3 = formData.loanAmount;
  const canProceedStep4 = documents.offerLetter && documents.passport;
  const canProceedStep5 = declarationAccepted;

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Show existing application status
  if (existingApplication && !applicationSubmitted) {
    return (
      <>
        <Helmet>
          <title>Education Loan Application Status - RBP FINIVIS</title>
        </Helmet>
        <Layout>
          <section className="py-12">
            <div className="container-custom max-w-2xl">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Your Education Loan Application
                  </CardTitle>
                  <CardDescription>
                    Track the status of your application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ServiceStatusTracker
                    referenceId={existingApplication.id.slice(0, 8).toUpperCase()}
                    serviceType="education_loan"
                    status={existingApplication.application_status}
                    rejectionReason={existingApplication.rejection_reason || undefined}
                    actionRequired={existingApplication.action_required || undefined}
                  />

                  <div className="mt-6 flex gap-3">
                    <Button variant="outline" onClick={() => navigate("/dashboard")}>
                      Go to Dashboard
                    </Button>
                    {existingApplication.application_status === "rejected" && (
                      <Button onClick={() => setExistingApplication(null)}>
                        Apply Again
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </Layout>
      </>
    );
  }

  // Application submitted success
  if (applicationSubmitted) {
    return (
      <>
        <Helmet>
          <title>Application Submitted - RBP FINIVIS</title>
        </Helmet>
        <Layout>
          <section className="py-12">
            <div className="container-custom max-w-2xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="border-green-500/20 bg-green-500/5">
                  <CardContent className="pt-8 text-center">
                    <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-heading font-bold mb-2">Application Submitted!</h2>
                    <p className="text-muted-foreground mb-6">
                      Your Education Loan application has been received. Our team will review your documents and contact you within 3-5 business days.
                    </p>

                    <div className="bg-card p-4 rounded-lg border mb-6 text-left">
                      <h4 className="font-medium mb-2">What's Next?</h4>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>Document verification (2-3 days)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>Credit assessment & eligibility check</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>Loan sanction & disbursement</span>
                        </li>
                      </ul>
                    </div>

                    <Button onClick={() => navigate("/dashboard")}>
                      Go to Dashboard
                    </Button>
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
        <title>Apply for Education Loan - RBP FINIVIS</title>
        <meta name="description" content="Apply for study abroad education loan. Competitive interest rates, quick approval, and hassle-free disbursement." />
      </Helmet>
      <Layout>
        {/* Hero */}
        <section className="gradient-hero py-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern opacity-20" />
          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-primary-foreground"
            >
              <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-2">
                Apply for Education Loan
              </h1>
              <p className="text-primary-foreground/80">
                Finance your study abroad dreams with competitive rates
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-12 bg-background">
          <div className="container-custom max-w-3xl">
            {/* Progress Steps */}
            <div className="flex justify-center mb-10 overflow-x-auto">
              <div className="flex items-center">
                {steps.map((s, index) => (
                  <div key={s.number} className="flex items-center">
                    <div
                      className={`flex items-center gap-2 px-3 py-2 rounded-full ${step >= s.number
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                        }`}
                    >
                      <s.icon className="h-4 w-4" />
                      <span className="text-sm font-medium hidden md:inline">
                        {s.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-6 sm:w-12 h-0.5 ${step > s.number ? "bg-accent" : "bg-muted"
                          }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>
                  {step === 1 && "Personal Details"}
                  {step === 2 && "University & Course Information"}
                  {step === 3 && "Loan Details"}
                  {step === 4 && "Upload Documents"}
                  {step === 5 && "Declaration"}
                  {step === 6 && "Review & Submit"}
                </CardTitle>
                <CardDescription>
                  {step === 1 && "Enter your personal information"}
                  {step === 2 && "Tell us about your university and course"}
                  {step === 3 && "Specify loan amount and co-applicant details"}
                  {step === 4 && "Upload required documents"}
                  {step === 5 && "Confirm your declaration"}
                  {step === 6 && "Review your application before submitting"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Step 1: Personal Details */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Full Name*</Label>
                        <Input
                          value={formData.fullName}
                          onChange={(e) => handleInputChange("fullName", e.target.value)}
                          className="mt-2"
                          placeholder="As per passport"
                        />
                      </div>
                      <div>
                        <Label>Email*</Label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="mt-2"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Phone Number*</Label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className="mt-2"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Address</Label>
                      <Textarea
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        className="mt-2"
                        placeholder="Current residential address"
                        rows={3}
                      />
                    </div>
                    <Button
                      className="w-full mt-6"
                      onClick={() => { setStep(2); scrollToTop(); }}
                      disabled={!canProceedStep1}
                    >
                      Continue
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}

                {/* Step 2: University & Course */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <Label>University Name*</Label>
                      <Input
                        value={formData.universityName}
                        onChange={(e) => handleInputChange("universityName", e.target.value)}
                        className="mt-2"
                        placeholder="Enter university name"
                      />
                    </div>

                    <div>
                      <Label>Country*</Label>
                      <Select
                        value={formData.universityCountry}
                        onValueChange={(v) => handleInputChange("universityCountry", v)}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">🇺🇸 United States</SelectItem>
                          <SelectItem value="UK">🇬🇧 United Kingdom</SelectItem>
                          <SelectItem value="CA">🇨🇦 Canada</SelectItem>
                          <SelectItem value="AU">🇦🇺 Australia</SelectItem>
                          <SelectItem value="DE">🇩🇪 Germany</SelectItem>
                          <SelectItem value="FR">🇫🇷 France</SelectItem>
                          <SelectItem value="NL">🇳🇱 Netherlands</SelectItem>
                          <SelectItem value="SG">🇸🇬 Singapore</SelectItem>
                          <SelectItem value="NZ">🇳🇿 New Zealand</SelectItem>
                          <SelectItem value="IE">🇮🇪 Ireland</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Course Name*</Label>
                      <Input
                        value={formData.courseName}
                        onChange={(e) => handleInputChange("courseName", e.target.value)}
                        className="mt-2"
                        placeholder="e.g., MS in Computer Science"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Course Duration</Label>
                        <Select
                          value={formData.courseDuration}
                          onValueChange={(v) => handleInputChange("courseDuration", v)}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Year</SelectItem>
                            <SelectItem value="2">2 Years</SelectItem>
                            <SelectItem value="3">3 Years</SelectItem>
                            <SelectItem value="4">4 Years</SelectItem>
                            <SelectItem value="5+">5+ Years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Intake Date</Label>
                        <Input
                          type="month"
                          value={formData.intakeDate}
                          onChange={(e) => handleInputChange("intakeDate", e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Button variant="outline" onClick={() => setStep(1)}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => setStep(3)}
                        disabled={!canProceedStep2}
                      >
                        Continue
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Loan Details */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Loan Amount Required*</Label>
                        <Input
                          type="number"
                          value={formData.loanAmount}
                          onChange={(e) => handleInputChange("loanAmount", e.target.value)}
                          className="mt-2"
                          placeholder="50000"
                        />
                      </div>
                      <div>
                        <Label>Currency*</Label>
                        <Select
                          value={formData.loanCurrency}
                          onValueChange={(v) => handleInputChange("loanCurrency", v)}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">$ USD</SelectItem>
                            <SelectItem value="GBP">£ GBP</SelectItem>
                            <SelectItem value="EUR">€ EUR</SelectItem>
                            <SelectItem value="AUD">A$ AUD</SelectItem>
                            <SelectItem value="CAD">C$ CAD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="border-t pt-4 mt-6">
                      <h4 className="font-medium mb-4">Co-Applicant Details (Optional)</h4>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Co-Applicant Name</Label>
                          <Input
                            value={formData.coApplicantName}
                            onChange={(e) => handleInputChange("coApplicantName", e.target.value)}
                            className="mt-2"
                            placeholder="Parent/Guardian name"
                          />
                        </div>
                        <div>
                          <Label>Relationship</Label>
                          <Select
                            value={formData.coApplicantRelation}
                            onValueChange={(v) => handleInputChange("coApplicantRelation", v)}
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select relation" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="father">Father</SelectItem>
                              <SelectItem value="mother">Mother</SelectItem>
                              <SelectItem value="spouse">Spouse</SelectItem>
                              <SelectItem value="guardian">Guardian</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Label>Co-Applicant Phone</Label>
                        <Input
                          value={formData.coApplicantPhone}
                          onChange={(e) => handleInputChange("coApplicantPhone", e.target.value)}
                          className="mt-2"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Button variant="outline" onClick={() => setStep(2)}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => setStep(4)}
                        disabled={!canProceedStep3}
                      >
                        Continue
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 4: Documents */}
                {step === 4 && (
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { key: "offerLetter", label: "University Offer Letter*", required: true },
                        { key: "passport", label: "Passport Copy*", required: true },
                        { key: "academicRecords", label: "Academic Records", required: false },
                        { key: "incomeProof", label: "Income Proof (Co-Applicant)", required: false },
                      ].map((doc) => (
                        <div key={doc.key} className="border rounded-lg p-4">
                          <Label className="text-sm">{doc.label}</Label>
                          <div className="mt-2">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                              id={`file-${doc.key}`}
                              onChange={(e) => handleFileChange(
                                doc.key as keyof typeof documents,
                                e.target.files?.[0] || null
                              )}
                            />
                            <label
                              htmlFor={`file-${doc.key}`}
                              className={`flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${documents[doc.key as keyof typeof documents]
                                ? "border-green-500 bg-green-50"
                                : "border-muted-foreground/30 hover:border-primary"
                                }`}
                            >
                              {documents[doc.key as keyof typeof documents] ? (
                                <>
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                  <span className="text-sm text-green-700 truncate max-w-32">
                                    {documents[doc.key as keyof typeof documents]?.name}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Upload className="h-5 w-5 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">Upload</span>
                                </>
                              )}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        Accepted formats: PDF, JPG, PNG. Maximum file size: 5MB per document.
                      </p>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Button variant="outline" onClick={() => { setStep(3); scrollToTop(); }}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => { setStep(5); scrollToTop(); }}
                        disabled={!canProceedStep4}
                      >
                        Continue
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 5: Declaration */}
                {step === 5 && (
                  <div className="space-y-6">
                    <EducationLoanDeclaration
                      onAccept={setDeclarationAccepted}
                      accepted={declarationAccepted}
                    />

                    <div className="flex gap-3 mt-6">
                      <Button variant="outline" onClick={() => { setStep(4); scrollToTop(); }}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => { setStep(6); scrollToTop(); }}
                        disabled={!canProceedStep5}
                      >
                        Continue
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 6: Review */}
                {step === 6 && (
                  <div className="space-y-6">
                    <div className="grid gap-6">
                      {/* Personal Details Summary */}
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Personal Details
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-2 text-sm">
                          <div><span className="text-muted-foreground">Name:</span> {formData.fullName}</div>
                          <div><span className="text-muted-foreground">Email:</span> {formData.email}</div>
                          <div><span className="text-muted-foreground">Phone:</span> {formData.phone}</div>
                        </div>
                      </div>

                      {/* University Summary */}
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          University & Course
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-2 text-sm">
                          <div><span className="text-muted-foreground">University:</span> {formData.universityName}</div>
                          <div><span className="text-muted-foreground">Country:</span> {formData.universityCountry}</div>
                          <div><span className="text-muted-foreground">Course:</span> {formData.courseName}</div>
                          <div><span className="text-muted-foreground">Duration:</span> {formData.courseDuration} Year(s)</div>
                        </div>
                      </div>

                      {/* Loan Summary */}
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Loan Details
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-2 text-sm">
                          <div><span className="text-muted-foreground">Amount:</span> {formData.loanCurrency} {parseFloat(formData.loanAmount).toLocaleString()}</div>
                          {formData.coApplicantName && (
                            <div><span className="text-muted-foreground">Co-Applicant:</span> {formData.coApplicantName}</div>
                          )}
                        </div>
                      </div>

                      {/* Documents Summary */}
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Documents Uploaded
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(documents).map(([key, file]) => file && (
                            <span key={key} className="inline-flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent rounded text-xs">
                              <CheckCircle className="h-3 w-3" />
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Declaration Status */}
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Declaration
                        </h4>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-muted-foreground">Declaration accepted</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => { setStep(5); scrollToTop(); }}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={handleSubmitApplication}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {uploading ? "Uploading Documents..." : "Submitting..."}
                          </>
                        ) : (
                          <>
                            Submit Application
                            <CheckCircle className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default EducationLoanApply;
