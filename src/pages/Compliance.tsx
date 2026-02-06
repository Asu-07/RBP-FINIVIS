import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { Shield, CheckCircle, Building2, FileText, AlertTriangle, Scale } from "lucide-react";
import { companyInfo } from "@/data/mockData";

const Compliance = () => (
  <>
    <Helmet>
      <title>Compliance - Regulatory Information | RBP FINIVIS</title>
      <meta name="description" content="RBP FINIVIS regulatory compliance information. RBI-licensed Full-Fledged Money Changer (FFMC) with complete FEMA compliance." />
    </Helmet>
    <Layout>
      <section className="gradient-hero py-16">
        <div className="container-custom text-center text-primary-foreground">
          <h1 className="text-4xl font-heading font-bold">Compliance</h1>
          <p className="text-primary-foreground/80 mt-2">Our commitment to regulatory compliance</p>
        </div>
      </section>
      <section className="py-16 bg-background">
        <div className="container-custom max-w-4xl">
          {/* RBI License Badge */}
          <div className="flex items-center gap-4 mb-10 p-6 bg-accent/10 rounded-xl border border-accent/20">
            <Shield className="h-14 w-14 text-accent shrink-0" />
            <div>
              <h2 className="font-heading font-semibold text-xl">RBI Licensed Full-Fledged Money Changer</h2>
              <p className="text-muted-foreground">
                {companyInfo.legalName} operates under RBI Licence No. <strong>{companyInfo.regulatory.rbiLicence}</strong>, 
                authorized to deal in foreign exchange under FEMA regulations.
              </p>
            </div>
          </div>

          {/* Regulatory Details */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="p-6 bg-card rounded-xl border border-border">
              <Building2 className="h-8 w-8 text-accent mb-4" />
              <h3 className="font-heading font-semibold text-lg mb-3">Company Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Legal Name</span>
                  <span className="font-medium">{companyInfo.legalName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CIN</span>
                  <span className="font-medium">{companyInfo.regulatory.cin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PAN</span>
                  <span className="font-medium">{companyInfo.regulatory.pan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST</span>
                  <span className="font-medium">{companyInfo.regulatory.gst}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TAN</span>
                  <span className="font-medium">{companyInfo.regulatory.tan}</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-card rounded-xl border border-border">
              <FileText className="h-8 w-8 text-accent mb-4" />
              <h3 className="font-heading font-semibold text-lg mb-3">Registered Office</h3>
              <p className="text-muted-foreground text-sm">
                {companyInfo.address.line1}<br />
                {companyInfo.address.line2}<br />
                {companyInfo.address.line3}<br />
                {companyInfo.address.city}, {companyInfo.address.state}<br />
                {companyInfo.address.pincode}, {companyInfo.address.country}
              </p>
            </div>
          </div>

          {/* Compliance Checklist */}
          <h3 className="font-heading font-semibold text-xl mb-6">Our Compliance Framework</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-10">
            {[
              "Full compliance with RBI Master Directions",
              "FEMA (Foreign Exchange Management Act) compliant",
              "Liberalized Remittance Scheme (LRS) guidelines",
              "Anti-Money Laundering (AML) policies",
              "Know Your Customer (KYC) verification",
              "Prevention of Money Laundering Act (PMLA)",
              "Regular reporting to FIU-IND",
              "Sanctions screening (OFAC, UN, EU)",
              "PCI-DSS compliant payment processing",
              "Regular internal and external audits",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-success shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>

          {/* AML Notice */}
          <div className="p-6 bg-warning/10 rounded-xl border border-warning/20 mb-10">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-warning shrink-0 mt-1" />
              <div>
                <h4 className="font-heading font-semibold mb-2">Anti-Money Laundering Notice</h4>
                <p className="text-sm text-muted-foreground">
                  We are committed to preventing money laundering and terrorist financing. All transactions 
                  undergo thorough screening and verification. We report suspicious transactions to FIU-IND 
                  as required by law. Providing false information may result in legal action.
                </p>
              </div>
            </div>
          </div>

          {/* Grievance */}
          <div className="p-6 bg-card rounded-xl border border-border">
            <Scale className="h-8 w-8 text-accent mb-4" />
            <h3 className="font-heading font-semibold text-lg mb-3">Grievance Redressal</h3>
            <p className="text-muted-foreground text-sm mb-4">
              For any complaints or grievances, please contact our Grievance Officer:
            </p>
            <div className="space-y-2 text-sm">
              <p>Email: <a href={`mailto:grievance@rbpfinivis.com`} className="text-accent hover:underline">grievance@rbpfinivis.com</a></p>
              <p>Phone: {companyInfo.contact.phone}</p>
              <p className="text-muted-foreground mt-4">
                If your complaint is not resolved within 30 days, you may escalate to the 
                Banking Ombudsman, Reserve Bank of India.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  </>
);

export default Compliance;
