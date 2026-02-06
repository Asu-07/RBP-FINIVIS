import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { companyInfo } from "@/data/mockData";
import logo from "@/assets/rbp-finivis-logo.png";

const footerLinks = {
  products: [
    { name: "Send Money", href: "/send-money" },
    { name: "Currency Exchange", href: "/currency-exchange" },
    { name: "Forex Cards", href: "/forex-cards" },
    { name: "Travel Insurance", href: "/travel-insurance" },
    { name: "Education Loan", href: "/education-loan" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Partner With Us", href: "/partner" },
    { name: "FAQ", href: "/faq" },
  ],
  support: [
    { name: "FAQ", href: "/faq" },
    { name: "Contact Us", href: "/contact" },
    { name: "Track Transfer", href: "/dashboard" },
    { name: "Support Center", href: "/faq" },
  ],
  legal: [
    { name: "Terms of Service", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Cookie Policy", href: "/cookie-policy" },
    { name: "Refund Policy", href: "/refund" },
    { name: "AML/KYC Policy", href: "/aml-kyc-policy" },
    { name: "Acceptable Use", href: "/acceptable-use" },
    { name: "Legal Disclaimer", href: "/legal-disclaimer" },
    { name: "Complaints", href: "/complaints" },
    { name: "Compliance", href: "/compliance" },
  ],
};

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "https://www.facebook.com/share/1B2uSRFfxX/" },
  { name: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/company/aeps-api-provider/" },
  { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/rbp_finivis?igsh=NmQ1bTZ6NXphdmJv" },
];

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Newsletter Section */}
      <div className="border-b border-primary-foreground/10">
        <div className="container-custom py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-heading font-semibold mb-2">
                Stay Updated with Best Rates
              </h3>
              <p className="text-primary-foreground/70 text-sm">
                Get notified when rates are best for your transfers
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 md:w-64"
              />
              <Button variant="accent" className="shrink-0">
                Subscribe
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center mb-6">
              <img src={logo} alt="RBP FINIVIS" className="h-20 w-auto brightness-0 invert" />
            </Link>
            <p className="text-primary-foreground/70 text-sm mb-6 max-w-sm">
              Your trusted platform for international remittance and currency exchange.
              RBI-licensed Full-Fledged Money Changer (FFMC).
            </p>
            <div className="space-y-3">
              <a
                href={`tel:${companyInfo.contact.phone}`}
                className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-accent transition-colors"
              >
                <Phone className="h-4 w-4" />
                {companyInfo.contact.phone}
              </a>
              <a
                href={`mailto:${companyInfo.contact.email}`}
                className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-accent transition-colors"
              >
                <Mail className="h-4 w-4" />
                {companyInfo.contact.email}
              </a>
              <div className="flex items-start gap-3 text-sm text-primary-foreground/70">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  {companyInfo.address.line1}
                  <br />
                  {companyInfo.address.line2}
                  <br />
                  {companyInfo.address.line3}
                  <br />
                  {companyInfo.address.state} – {companyInfo.address.pincode}
                </span>
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Products</h4>
            <ul className="space-y-2.5">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Company</h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Support</h4>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Regulatory Information */}
      <div className="border-t border-primary-foreground/10">
        <div className="container-custom py-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-accent" />
            <span className="font-heading font-semibold">Regulatory Information</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-xs text-primary-foreground/60">
            <div>
              <span className="block text-primary-foreground/40">CIN</span>
              <span>{companyInfo.regulatory.cin}</span>
            </div>
            <div>
              <span className="block text-primary-foreground/40">RBI Licence No.</span>
              <span>{companyInfo.regulatory.rbiLicence}</span>
            </div>
            <div>
              <span className="block text-primary-foreground/40">PAN</span>
              <span>{companyInfo.regulatory.pan}</span>
            </div>
            <div>
              <span className="block text-primary-foreground/40">GST</span>
              <span>{companyInfo.regulatory.gst}</span>
            </div>
            <div>
              <span className="block text-primary-foreground/40">TAN</span>
              <span>{companyInfo.regulatory.tan}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="border-t border-primary-foreground/10 bg-primary-foreground/5">
        <div className="container-custom py-6">
          <p className="text-xs text-primary-foreground/50 leading-relaxed">
            <strong className="text-primary-foreground/70">Disclaimer:</strong> {companyInfo.legalName} is an RBI-licensed Full-Fledged Money Changer (FFMC)
            authorized under Licence No. {companyInfo.regulatory.rbiLicence}. All foreign exchange transactions are governed by FEMA (Foreign Exchange Management Act), 1999
            and RBI Master Directions. Outward remittances are processed under the Liberalised Remittance Scheme (LRS) with an annual limit of USD 2,50,000 per individual
            for permissible purposes. Mandatory KYC verification is required as per RBI and PMLA guidelines. Exchange rates displayed are indicative and subject to change.
            Education loan services are offered in partnership with RBI-regulated banks/NBFCs; {companyInfo.name} acts as a facilitator and not a lender.
            All transactions are subject to AML/CFT screening and reported to FIU-IND as required by law. For grievances, contact: grievance@rbpfinivis.com
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-primary-foreground/60">
              © {new Date().getFullYear()} {companyInfo.legalName}. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-primary-foreground/10 hover:bg-accent/20 hover:text-accent transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
