import { Shield, AlertTriangle, Info, Scale, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { companyInfo } from "@/data/mockData";

interface RegulatoryDisclaimerProps {
  serviceType: "remittance" | "currency_exchange" | "forex_card" | "education_loan" | "general";
  variant?: "full" | "compact" | "inline";
}

export function RegulatoryDisclaimer({ serviceType, variant = "full" }: RegulatoryDisclaimerProps) {
  const disclaimers = {
    remittance: {
      title: "RBI Regulatory Compliance",
      items: [
        "This service is offered by RBP FINIVIS Private Limited, an RBI-licensed Full-Fledged Money Changer (FFMC) under Licence No. CG. FFMC 250/2021.",
        "All outward remittances are processed under the Liberalised Remittance Scheme (LRS) as per RBI Master Direction dated January 1, 2016 (updated from time to time).",
        "The annual limit for remittances under LRS is USD 2,50,000 (or equivalent) per financial year per individual for permissible current or capital account transactions.",
        "Mandatory KYC verification (PAN, Aadhaar) is required as per FEMA (Foreign Exchange Management Act), 1999 and PMLA (Prevention of Money Laundering Act), 2002.",
        "Form A2 declaration is required for all outward remittances as per RBI guidelines.",
        "Transactions above USD 25,000 or equivalent may require additional documentation including purpose proof and source of funds.",
        "All transactions are subject to OFAC, UN, and other international sanctions screening.",
      ],
      warning: "Providing false information or using services for prohibited purposes may result in penalties under FEMA/PMLA and criminal prosecution.",
    },
    currency_exchange: {
      title: "RBI Regulatory Compliance",
      items: [
        "RBP FINIVIS Private Limited is an RBI-licensed Full-Fledged Money Changer (FFMC) under Licence No. CG. FFMC 250/2021, authorized to buy and sell foreign currency.",
        "Currency exchange transactions are governed by FEMA (Foreign Exchange Management Act), 1999 and RBI Master Directions on Money Changing Activities.",
        "For purchase of foreign currency: Valid passport, visa (if applicable), and confirmed travel tickets are mandatory for amounts above USD 3,000.",
        "For sale of foreign currency: Declaration of unspent foreign exchange is required within 180 days of return to India as per RBI regulations.",
        "Currency exchange limit for travelers is as per RBI guidelines - up to USD 3,000 or equivalent per trip in cash; beyond that, forex cards/traveler's cheques are recommended.",
        "All transactions are reported to RBI and are subject to AML/CFT (Anti-Money Laundering/Combating Financing of Terrorism) screening.",
        "Encashment certificate will be issued for all sale transactions as required by RBI.",
      ],
      warning: "Unauthorized dealing in foreign exchange is punishable under FEMA with penalties up to three times the sum involved.",
    },
    forex_card: {
      title: "RBI Regulatory Compliance",
      items: [
        "Prepaid forex cards are issued in partnership with RBI-authorized Authorized Dealer (AD) Category-II banks.",
        "RBP FINIVIS Private Limited acts as a distribution partner under its FFMC Licence No. CG. FFMC 250/2021.",
        "Loading limits on forex cards are subject to LRS limits of USD 2,50,000 per financial year for permissible purposes.",
        "Valid travel documents (passport, visa, tickets) are mandatory for card issuance and loading.",
        "Forex cards can only be used for purposes permitted under FEMA such as education, travel, medical treatment, and other current account transactions.",
        "Unspent balance must be surrendered or encashed within 180 days of return to India.",
        "All transactions are subject to KYC verification as per RBI and PMLA guidelines.",
      ],
      warning: "Use of forex cards for prohibited transactions under FEMA may result in forfeiture of card balance and legal action.",
    },
    education_loan: {
      title: "Important Disclaimers",
      items: [
        "RBP FINIVIS Private Limited acts as a facilitator/referral partner for education loans. We are NOT a lending institution (NBFC/Bank).",
        "All loan applications are processed and sanctioned by partner banks/NBFCs as per their credit policies and RBI guidelines.",
        "Interest rates, loan amounts, eligibility, and terms are determined solely by the lending institution.",
        "We do not guarantee loan approval. Loan sanction is subject to the applicant meeting eligibility criteria set by the lender.",
        "Processing fees, documentation charges, and other costs are as per the lending institution's policy.",
        "For any loan-related grievances, borrowers should contact the respective lending institution directly.",
        "Education loans are subject to the regulatory guidelines of RBI and the respective lending institution's policies.",
      ],
      warning: "We do not charge any upfront fee for loan processing. Beware of fraudsters claiming to guarantee loans in exchange for advance payments.",
    },
    general: {
      title: "General Regulatory Information",
      items: [
        "RBP FINIVIS Private Limited is an RBI-licensed Full-Fledged Money Changer (FFMC) under Licence No. CG. FFMC 250/2021.",
        "All foreign exchange transactions are governed by FEMA (Foreign Exchange Management Act), 1999 and RBI Master Directions.",
        "Mandatory KYC verification is required for all transactions as per RBI and PMLA guidelines.",
        "Exchange rates displayed are indicative and subject to change without prior notice.",
        "Service availability is subject to compliance with applicable laws and regulations.",
      ],
      warning: "All transactions are monitored for AML/CFT compliance and reported to FIU-IND as required by law.",
    },
  };

  const disclaimer = disclaimers[serviceType];

  if (variant === "inline") {
    return (
      <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
        <Shield className="h-4 w-4 shrink-0 mt-0.5 text-accent" />
        <p>
          RBI Licensed FFMC (Licence No. {companyInfo.regulatory.rbiLicence}). All transactions comply with FEMA & LRS guidelines.{" "}
          <Link to="/compliance" className="text-accent hover:underline">View full compliance details</Link>
        </p>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="p-4 bg-muted/50 rounded-xl border border-border space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-accent" />
          <h4 className="font-heading font-semibold text-sm">{disclaimer.title}</h4>
        </div>
        <ul className="text-xs text-muted-foreground space-y-1.5">
          {disclaimer.items.slice(0, 3).map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-accent">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <Link to="/compliance" className="text-xs text-accent hover:underline flex items-center gap-1">
          <FileText className="h-3 w-3" />
          View full regulatory disclosure
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Disclaimer Box */}
      <div className="p-6 bg-card rounded-xl border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="font-heading font-semibold">{disclaimer.title}</h3>
            <p className="text-xs text-muted-foreground">
              FFMC Licence: {companyInfo.regulatory.rbiLicence}
            </p>
          </div>
        </div>
        
        <ul className="space-y-2.5 mb-4">
          {disclaimer.items.map((item, index) => (
            <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
              <Info className="h-4 w-4 shrink-0 mt-0.5 text-accent/70" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Warning Box */}
      <div className="p-4 bg-warning/10 rounded-xl border border-warning/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <h4 className="font-heading font-semibold text-sm mb-1">Important Notice</h4>
            <p className="text-sm text-muted-foreground">{disclaimer.warning}</p>
          </div>
        </div>
      </div>

      {/* Grievance & Links */}
      <div className="p-4 bg-muted/50 rounded-xl flex flex-wrap gap-4 text-xs">
        <Link to="/compliance" className="flex items-center gap-1.5 text-accent hover:underline">
          <FileText className="h-3.5 w-3.5" />
          Compliance Details
        </Link>
        <Link to="/aml-kyc-policy" className="flex items-center gap-1.5 text-accent hover:underline">
          <Shield className="h-3.5 w-3.5" />
          AML/KYC Policy
        </Link>
        <Link to="/complaints-handling" className="flex items-center gap-1.5 text-accent hover:underline">
          <Scale className="h-3.5 w-3.5" />
          Grievance Redressal
        </Link>
        <Link to="/terms" className="flex items-center gap-1.5 text-accent hover:underline">
          <FileText className="h-3.5 w-3.5" />
          Terms & Conditions
        </Link>
      </div>

      {/* Company Info */}
      <p className="text-xs text-center text-muted-foreground">
        {companyInfo.legalName} | CIN: {companyInfo.regulatory.cin} | 
        Registered Office: {companyInfo.address.line1}, {companyInfo.address.city}, {companyInfo.address.state} - {companyInfo.address.pincode}
      </p>
    </div>
  );
}
