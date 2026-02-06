import { useState } from "react";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RegulatoryDisclaimer } from "@/components/RegulatoryDisclaimer";
import {
  GraduationCap,
  Globe,
  CheckCircle,
  Calculator,
  FileText,
  Clock,
  Shield,
  IndianRupee,
  Percent,
  Users,
  Building2,
  ArrowRight,
  Loader2,
  Phone,
  Mail,
  BadgeCheck,
} from "lucide-react";

const loanFeatures = [
  {
    icon: IndianRupee,
    title: "Up to ₹1.5 Crore",
    description: "Finance your complete education including tuition, living expenses, and travel",
  },
  {
    icon: Percent,
    title: "Competitive Interest Rates",
    description: "Starting from 8.5% p.a. with flexible repayment options",
  },
  {
    icon: Clock,
    title: "Quick Approval",
    description: "Get in-principle approval within 48 hours of application",
  },
  {
    icon: Globe,
    title: "Study Anywhere",
    description: "Loans for USA, UK, Canada, Australia, Germany & 30+ countries",
  },
  {
    icon: Shield,
    title: "No Collateral Options",
    description: "Unsecured loans available for premier universities",
  },
  {
    icon: FileText,
    title: "100% Tuition Coverage",
    description: "Cover tuition fees, accommodation, books, and living expenses",
  },
];

const eligibilityCriteria = [
  "Indian citizen with valid passport",
  "Admission/offer letter from recognized foreign university",
  "Age: 18-35 years at the time of application",
  "Co-applicant (parent/guardian) with stable income",
  "Good academic record (minimum 50% in qualifying exam)",
  "Valid standardized test scores (GRE/GMAT/IELTS/TOEFL) if required",
];

const documentsRequired = [
  { category: "Identity & Address", docs: ["PAN Card", "Aadhaar Card", "Passport", "Address Proof"] },
  { category: "Academic", docs: ["Mark sheets (10th, 12th, Graduation)", "Admission/Offer Letter", "I-20/CAS/CoE", "Test Scores (GRE/GMAT/IELTS)"] },
  { category: "Financial", docs: ["Income Proof (ITR for 2 years)", "Bank Statements (6 months)", "Salary Slips (if salaried)", "Property Documents (if collateral)"] },
];

const partnerBanks = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Punjab National Bank",
  "Bank of Baroda",
  "Canara Bank",
  "IDFC First Bank",
];

const faqs = [
  {
    q: "What is the maximum loan amount I can get?",
    a: "The maximum loan amount depends on the country and university. For premier universities in USA/UK, you can get up to ₹1.5 Crore. The loan covers tuition fees, living expenses, travel, and other education-related costs.",
  },
  {
    q: "Do I need collateral for an education loan?",
    a: "Collateral requirements vary. Loans up to ₹7.5 Lakh typically don't require collateral. For higher amounts, collateral or a third-party guarantee may be required. We also offer collateral-free loans for students admitted to top-ranked universities.",
  },
  {
    q: "When do I start repaying the loan?",
    a: "Most education loans come with a moratorium period that includes the course duration plus 6-12 months after completion. You can choose to pay only the interest during the study period to reduce the total burden.",
  },
  {
    q: "Can I get a loan for part-time or online courses?",
    a: "Generally, education loans are provided for full-time courses at recognized universities. Some banks do offer loans for executive MBA or part-time programs at premier institutions. Contact us to discuss your specific case.",
  },
  {
    q: "What if my visa is rejected?",
    a: "If your visa is rejected and the loan has already been disbursed, you would need to return the amount. However, most disbursements happen only after visa approval. We guide you through the process to minimize such risks.",
  },
];

const EducationLoan = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    course: "",
    university: "",
    country: "",
    loanAmount: "",
    message: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Create a service application entry in the database
      const { error: dbError } = await supabase
        .from("service_applications")
        .insert({
          user_id: user?.id || null, // Allow guest submissions too
          service_type: "education_loan",
          application_status: "applied",
          application_data: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            course: formData.course,
            university: formData.university,
            country: formData.country,
            loanAmount: formData.loanAmount,
            message: formData.message,
            source: "inquiry_form", // Mark as inquiry form submission
          },
          submitted_at: new Date().toISOString(),
        });

      if (dbError) {
        console.error("Error creating application:", dbError);
        // Continue even if DB insert fails - still try to send email
      }

      // Try to send inquiry email (may fail due to CORS in dev, but that's OK)
      try {
        await supabase.functions.invoke("send-notification-email", {
          body: {
            type: "inquiry",
            email: "support@rbpfinivis.com",
            name: formData.name,
            subject: "Education Loan Inquiry",
            message: `
New Education Loan Inquiry:
- Name: ${formData.name}
- Email: ${formData.email}
- Phone: ${formData.phone}
- Course: ${formData.course}
- University: ${formData.university}
- Country: ${formData.country}
- Loan Amount: ${formData.loanAmount}
- Message: ${formData.message}
            `,
          },
        });
      } catch (emailError) {
        console.warn("Email notification failed (CORS):", emailError);
        // Continue - email is optional
      }

      toast.success("Inquiry submitted! Our team will contact you within 24 hours.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        course: "",
        university: "",
        country: "",
        loanAmount: "",
        message: "",
      });
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      toast.error("Failed to submit inquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Loan calculator state
  const [loanCalc, setLoanCalc] = useState({
    amount: "2000000",
    rate: "9.5",
    tenure: "84",
  });

  const calculateEMI = () => {
    const P = parseFloat(loanCalc.amount);
    const r = parseFloat(loanCalc.rate) / 12 / 100;
    const n = parseFloat(loanCalc.tenure);

    if (P && r && n) {
      const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      return emi.toFixed(0);
    }
    return "0";
  };

  return (
    <>
      <Helmet>
        <title>Education Loan for Abroad Studies - Study Loan | RBP FINIVIS</title>
        <meta
          name="description"
          content="Get education loans up to ₹1.5 Crore for studying abroad. Competitive interest rates, quick approval, and hassle-free process. Finance your dreams with RBP FINIVIS."
        />
      </Helmet>
      <Layout>
        {/* Hero Section */}
        <section className="gradient-hero py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern opacity-20" />
          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-primary-foreground max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
                <GraduationCap className="h-5 w-5" />
                <span className="text-sm font-medium">Education Financing Solutions</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-6">
                Education Loan for<br />Studying Abroad
              </h1>
              <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-8">
                Turn your dream of studying abroad into reality. Get up to ₹1.5 Crore with competitive rates,
                flexible repayment, and hassle-free processing.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" variant="secondary" onClick={() => document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth' })}>
                  Apply Now
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                  <Phone className="h-5 w-5 mr-2" />
                  Talk to Expert
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 bg-background">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-4">
                Why Choose Our Education Loan?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We partner with leading banks to offer you the best education loan options
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loanFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-heading font-semibold text-lg mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* EMI Calculator */}
        <section className="py-16 bg-muted/50">
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-4">
                  EMI Calculator
                </h2>
                <p className="text-muted-foreground mb-6">
                  Plan your finances better. Calculate your monthly EMI based on loan amount, interest rate, and tenure.
                </p>

                <Card>
                  <CardContent className="pt-6 space-y-6">
                    <div>
                      <Label>Loan Amount (₹)</Label>
                      <Input
                        type="number"
                        value={loanCalc.amount}
                        onChange={(e) => setLoanCalc(prev => ({ ...prev, amount: e.target.value }))}
                        className="mt-2"
                      />
                      <div className="flex gap-2 mt-2">
                        {["1000000", "2000000", "5000000", "10000000"].map(amt => (
                          <Button
                            key={amt}
                            variant="outline"
                            size="sm"
                            onClick={() => setLoanCalc(prev => ({ ...prev, amount: amt }))}
                          >
                            ₹{(parseInt(amt) / 100000).toFixed(0)}L
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Interest Rate (% p.a.)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={loanCalc.rate}
                          onChange={(e) => setLoanCalc(prev => ({ ...prev, rate: e.target.value }))}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Tenure (months)</Label>
                        <Input
                          type="number"
                          value={loanCalc.tenure}
                          onChange={(e) => setLoanCalc(prev => ({ ...prev, tenure: e.target.value }))}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="bg-primary text-primary-foreground">
                  <CardContent className="pt-8 text-center">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-80" />
                    <p className="text-primary-foreground/70 mb-2">Your Monthly EMI</p>
                    <p className="text-5xl font-bold mb-4">
                      ₹{parseInt(calculateEMI()).toLocaleString()}
                    </p>
                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-primary-foreground/20 text-sm">
                      <div>
                        <p className="text-primary-foreground/70">Principal</p>
                        <p className="font-semibold">₹{(parseInt(loanCalc.amount) / 100000).toFixed(1)}L</p>
                      </div>
                      <div>
                        <p className="text-primary-foreground/70">Interest</p>
                        <p className="font-semibold">{loanCalc.rate}%</p>
                      </div>
                      <div>
                        <p className="text-primary-foreground/70">Tenure</p>
                        <p className="font-semibold">{Math.round(parseInt(loanCalc.tenure) / 12)} Years</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="mt-6 p-4 bg-accent/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> EMI calculation is indicative. Actual EMI may vary based on bank policies,
                    processing fees, and other charges. Moratorium period benefits not included in this calculation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Eligibility & Documents */}
        <section className="py-16 bg-background">
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Eligibility */}
              <div>
                <h2 className="text-2xl font-heading font-bold mb-6 flex items-center gap-2">
                  <BadgeCheck className="h-6 w-6 text-accent" />
                  Eligibility Criteria
                </h2>
                <Card>
                  <CardContent className="pt-6">
                    <ul className="space-y-4">
                      {eligibilityCriteria.map((criteria, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                          <span className="text-sm">{criteria}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Documents */}
              <div>
                <h2 className="text-2xl font-heading font-bold mb-6 flex items-center gap-2">
                  <FileText className="h-6 w-6 text-accent" />
                  Documents Required
                </h2>
                <div className="space-y-4">
                  {documentsRequired.map((doc) => (
                    <Card key={doc.category}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{doc.category}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {doc.docs.map((d) => (
                            <span key={d} className="px-3 py-1 bg-muted rounded-full text-xs">
                              {d}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partner Banks */}
        <section className="py-12 bg-muted/50">
          <div className="container-custom">
            <div className="text-center mb-8">
              <h2 className="text-xl font-heading font-semibold mb-2">Our Banking Partners</h2>
              <p className="text-sm text-muted-foreground">We work with India's leading banks to get you the best rates</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {partnerBanks.map((bank) => (
                <div
                  key={bank}
                  className="px-6 py-3 bg-card rounded-lg border flex items-center gap-2"
                >
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{bank}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section id="apply-form" className="py-16 bg-background">
          <div className="container-custom max-w-4xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-4">
                Apply for Education Loan
              </h2>
              <p className="text-muted-foreground">
                Fill in your details and our education loan experts will guide you through the process
              </p>
            </div>

            <Card>
              <CardContent className="pt-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Your full name"
                        className="mt-2"
                        required
                      />
                    </div>
                    <div>
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="your@email.com"
                        className="mt-2"
                        required
                      />
                    </div>
                    <div>
                      <Label>Phone Number *</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+91 XXXXX XXXXX"
                        className="mt-2"
                        required
                      />
                    </div>
                    <div>
                      <Label>Course / Program</Label>
                      <Input
                        value={formData.course}
                        onChange={(e) => handleInputChange("course", e.target.value)}
                        placeholder="e.g., MS in Computer Science"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>University Name</Label>
                      <Input
                        value={formData.university}
                        onChange={(e) => handleInputChange("university", e.target.value)}
                        placeholder="e.g., MIT, Stanford"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Destination Country</Label>
                      <Select value={formData.country} onValueChange={(v) => handleInputChange("country", v)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USA">🇺🇸 United States</SelectItem>
                          <SelectItem value="UK">🇬🇧 United Kingdom</SelectItem>
                          <SelectItem value="Canada">🇨🇦 Canada</SelectItem>
                          <SelectItem value="Australia">🇦🇺 Australia</SelectItem>
                          <SelectItem value="Germany">🇩🇪 Germany</SelectItem>
                          <SelectItem value="Ireland">🇮🇪 Ireland</SelectItem>
                          <SelectItem value="Singapore">🇸🇬 Singapore</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Loan Amount Required (₹)</Label>
                    <Select value={formData.loanAmount} onValueChange={(v) => handleInputChange("loanAmount", v)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select amount range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upto-20L">Up to ₹20 Lakhs</SelectItem>
                        <SelectItem value="20-50L">₹20 - 50 Lakhs</SelectItem>
                        <SelectItem value="50-75L">₹50 - 75 Lakhs</SelectItem>
                        <SelectItem value="75L-1Cr">₹75 Lakhs - 1 Crore</SelectItem>
                        <SelectItem value="above-1Cr">Above ₹1 Crore</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Additional Information</Label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Any specific requirements or questions..."
                      className="mt-2"
                      rows={4}
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Submit Application
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By submitting, you agree to our Terms of Service and Privacy Policy.
                    Our team will contact you within 24 hours.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 bg-muted/50">
          <div className="container-custom max-w-3xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-4">
                Frequently Asked Questions
              </h2>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="bg-card rounded-lg border px-6">
                  <AccordionTrigger className="text-left hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 gradient-hero">
          <div className="container-custom text-center text-primary-foreground">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Get expert guidance on education loans. Our team helps you choose the right loan,
              prepare documents, and get quick approvals.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="secondary">
                <Phone className="h-5 w-5 mr-2" />
                Call: +91 7717309363
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                <Mail className="h-5 w-5 mr-2" />
                support@rbpfinivis.com
              </Button>
            </div>
          </div>
        </section>

        {/* Regulatory Disclaimer */}
        <section className="py-12 bg-background">
          <div className="container-custom max-w-4xl">
            <RegulatoryDisclaimer serviceType="education_loan" variant="full" />
          </div>
        </section>
      </Layout>
    </>
  );
};

export default EducationLoan;
