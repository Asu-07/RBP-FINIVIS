import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { companyInfo } from "@/data/mockData";

const Privacy = () => (
  <>
    <Helmet>
      <title>Privacy Policy - RBP FINIVIS</title>
      <meta name="description" content="Privacy policy of RBP FINIVIS. Learn how we collect, use, and protect your personal information." />
    </Helmet>
    <Layout>
      <section className="gradient-hero py-16">
        <div className="container-custom text-center text-primary-foreground">
          <h1 className="text-4xl font-heading font-bold">Privacy Policy</h1>
          <p className="text-primary-foreground/80 mt-2">How we protect your information</p>
        </div>
      </section>
      <section className="py-16 bg-background">
        <div className="container-custom max-w-3xl">
          <p className="text-muted-foreground mb-8">Last updated: December 2024</p>
          
          <div className="space-y-8">
            <div>
              <h2 className="font-heading text-xl font-semibold mb-3">Introduction</h2>
              <p className="text-muted-foreground">
                {companyInfo.legalName} ("we," "our," or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                when you use our forex exchange and remittance services.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold mb-3">Information We Collect</h2>
              <p className="text-muted-foreground mb-3">
                We collect personal information necessary to provide our services and comply with regulatory requirements:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Identity information (name, date of birth, PAN, Aadhaar)</li>
                <li>Contact details (email, phone number, address)</li>
                <li>Financial information (bank account details, transaction history)</li>
                <li>KYC documents (ID proofs, address proofs, photographs)</li>
                <li>Source of funds documentation</li>
              </ul>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold mb-3">How We Use Your Information</h2>
              <p className="text-muted-foreground mb-3">Your information is used to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Process forex transactions and remittances</li>
                <li>Verify your identity and prevent fraud</li>
                <li>Comply with RBI, FEMA, and AML regulations</li>
                <li>Improve our services and customer experience</li>
                <li>Communicate important updates and offers</li>
              </ul>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold mb-3">Data Security</h2>
              <p className="text-muted-foreground">
                We employ industry-standard security measures including 256-bit SSL encryption, 
                secure data centers, and access controls to protect your data. We are committed to 
                safeguarding your information against unauthorized access, alteration, or destruction.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold mb-3">Data Sharing</h2>
              <p className="text-muted-foreground">
                We may share your information with regulatory authorities (RBI, FIU-IND), 
                correspondent banks for transaction processing, and authorized third-party 
                service providers. We do not sell your personal information to third parties.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold mb-3">Data Retention</h2>
              <p className="text-muted-foreground">
                We retain your data for as long as required by law and regulatory guidelines. 
                Transaction records are maintained for a minimum of 10 years as per PMLA requirements.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold mb-3">Your Rights</h2>
              <p className="text-muted-foreground">
                You have the right to access, correct, or request deletion of your personal data, 
                subject to legal and regulatory requirements. Contact us at {companyInfo.contact.email} 
                to exercise your rights.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-semibold mb-3">Contact Us</h2>
              <p className="text-muted-foreground">
                For privacy-related queries, please contact our Data Protection Officer at {companyInfo.contact.email} 
                or write to us at {companyInfo.address.line1}, {companyInfo.address.line2}, 
                {companyInfo.address.line3}, {companyInfo.address.state} - {companyInfo.address.pincode}.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  </>
);

export default Privacy;
