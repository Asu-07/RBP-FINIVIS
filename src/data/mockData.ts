// Mock forex rates data for RBP FINIVIS
export const forexRates = [
  { currency: "USD", name: "US Dollar", flag: "🇺🇸", buyRate: 83.25, sellRate: 83.75, change: 0.15 },
  { currency: "EUR", name: "Euro", flag: "🇪🇺", buyRate: 90.50, sellRate: 91.10, change: -0.22 },
  { currency: "GBP", name: "British Pound", flag: "🇬🇧", buyRate: 105.80, sellRate: 106.50, change: 0.35 },
  { currency: "AED", name: "UAE Dirham", flag: "🇦🇪", buyRate: 22.65, sellRate: 22.85, change: 0.05 },
  { currency: "SGD", name: "Singapore Dollar", flag: "🇸🇬", buyRate: 61.90, sellRate: 62.30, change: -0.12 },
  { currency: "AUD", name: "Australian Dollar", flag: "🇦🇺", buyRate: 54.20, sellRate: 54.70, change: 0.18 },
  { currency: "CAD", name: "Canadian Dollar", flag: "🇨🇦", buyRate: 61.40, sellRate: 61.90, change: 0.08 },
  { currency: "CHF", name: "Swiss Franc", flag: "🇨🇭", buyRate: 94.60, sellRate: 95.20, change: 0.25 },
  { currency: "JPY", name: "Japanese Yen", flag: "🇯🇵", buyRate: 0.56, sellRate: 0.57, change: -0.02 },
  { currency: "SAR", name: "Saudi Riyal", flag: "🇸🇦", buyRate: 22.15, sellRate: 22.35, change: 0.03 },
  { currency: "NZD", name: "New Zealand Dollar", flag: "🇳🇿", buyRate: 50.80, sellRate: 51.30, change: 0.10 },
  { currency: "THB", name: "Thai Baht", flag: "🇹🇭", buyRate: 2.35, sellRate: 2.40, change: -0.01 },
];

export const countries = [
  { code: "US", name: "United States", currency: "USD", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", currency: "GBP", flag: "🇬🇧" },
  { code: "EU", name: "Europe", currency: "EUR", flag: "🇪🇺" },
  { code: "AE", name: "United Arab Emirates", currency: "AED", flag: "🇦🇪" },
  { code: "SG", name: "Singapore", currency: "SGD", flag: "🇸🇬" },
  { code: "AU", name: "Australia", currency: "AUD", flag: "🇦🇺" },
  { code: "CA", name: "Canada", currency: "CAD", flag: "🇨🇦" },
  { code: "CH", name: "Switzerland", currency: "CHF", flag: "🇨🇭" },
  { code: "JP", name: "Japan", currency: "JPY", flag: "🇯🇵" },
  { code: "SA", name: "Saudi Arabia", currency: "SAR", flag: "🇸🇦" },
];

export const transferMethods = [
  { id: "bank", name: "Bank Transfer", fee: 0, time: "1-2 business days" },
  { id: "express", name: "Express Transfer", fee: 199, time: "Same day" },
  { id: "cash", name: "Cash Pickup", fee: 99, time: "Within 4 hours" },
];

export const cardBenefits = [
  {
    title: "Multi-Currency Support",
    description: "Load and spend in 16+ currencies without conversion fees",
  },
  {
    title: "Global Acceptance",
    description: "Accepted at 45+ million merchants worldwide",
  },
  {
    title: "ATM Withdrawals",
    description: "Free ATM withdrawals at select partner banks globally",
  },
  {
    title: "Real-time Alerts",
    description: "Instant SMS and email notifications for every transaction",
  },
  {
    title: "Zero Forex Markup",
    description: "No hidden fees or forex markup on international transactions",
  },
  {
    title: "24/7 Support",
    description: "Round-the-clock customer support for card-related queries",
  },
];

export const testimonials = [
  {
    id: 1,
    name: "Vikram Singh",
    role: "Business Owner",
    location: "Chandigarh",
    image: "",
    rating: 5,
    text: "RBP FINIVIS has transformed how we handle international payments. The rates are competitive and the service is excellent for our import-export business.",
  },
  {
    id: 2,
    name: "Dr. Neha Gupta",
    role: "Parent of Student Abroad",
    location: "Delhi",
    image: "",
    rating: 5,
    text: "Sending money for my daughter's education in the UK has never been easier. The process is seamless and fully compliant with RBI guidelines.",
  },
  {
    id: 3,
    name: "Rajesh Malhotra",
    role: "NRI",
    location: "Dubai",
    image: "",
    rating: 5,
    text: "As an NRI, I trust RBP FINIVIS for all my remittances to India. Their RBI license gives me complete peace of mind.",
  },
];

export const faqs = [
  {
    category: "How It Works",
    questions: [
      {
        q: "How does Remittance (Send Money Abroad) work?",
        a: "Step 1: Register & complete KYC (PAN + Aadhaar). Step 2: Add beneficiary details (bank account, SWIFT/IBAN). Step 3: Enter amount and select purpose. Step 4: Make payment via bank transfer/UPI. Step 5: Track your transfer in real-time until funds are credited.",
      },
      {
        q: "How does Currency Exchange work?",
        a: "Step 1: Register & complete KYC. Step 2: Select the currency you want to buy/sell. Step 3: Check live rates and lock your rate. Step 4: Make payment for the order. Step 5: We procure and dispatch the currency to your doorstep or collect from you.",
      },
      {
        q: "How do Forex Cards work?",
        a: "Step 1: Apply online with basic details. Step 2: Complete KYC verification. Step 3: Receive your card (physical delivery in 5-7 days, virtual card instantly). Step 4: Load currencies at live rates. Step 5: Use globally at 45M+ merchants or ATMs.",
      },
    ],
  },
  {
    category: "Remittance",
    questions: [
      {
        q: "How long does an international transfer take?",
        a: "Standard transfers take 1-2 business days. Express transfers can be completed within the same day, depending on the destination country and banking hours.",
      },
      {
        q: "What documents are required for KYC?",
        a: "You'll need a valid government-issued photo ID (Aadhaar, Passport, or PAN card), proof of address, and in some cases, purpose documentation for larger transfers under LRS.",
      },
      {
        q: "Is there a limit on how much I can send?",
        a: "For individual remittances, you can send up to $250,000 per financial year under the Liberalized Remittance Scheme (LRS). Business accounts have customized limits based on requirements.",
      },
    ],
  },
  {
    category: "Currency Exchange & Forex Cards",
    questions: [
      {
        q: "How often are your exchange rates updated?",
        a: "Our exchange rates are updated in real-time throughout the day based on market conditions. You always get the most current rates when you initiate a transaction.",
      },
      {
        q: "Can I lock in a rate for future transfers?",
        a: "Yes, our rate lock feature allows you to lock in current rates for up to 48 hours, protecting you from unfavorable market movements.",
      },
      {
        q: "How many currencies can I load on the Forex Card?",
        a: "You can load up to 16 currencies on a single card including USD, EUR, GBP, AED, SGD, AUD, CAD, and more. Switch between currencies instantly via the app.",
      },
    ],
  },
  {
    category: "Compliance & Security",
    questions: [
      {
        q: "Is RBP FINIVIS regulated?",
        a: "Yes, RBP FINIVIS Private Limited is an RBI-licensed Full-Fledged Money Changer (FFMC) with Licence No. CG. FFMC 250/2021. We are fully compliant with FEMA and RBI regulations.",
      },
      {
        q: "How secure are my transactions?",
        a: "We use bank-level encryption (256-bit SSL) for all transactions. Our platform is PCI-DSS compliant and we employ multi-factor authentication. All transactions pass through AML and sanctions screening.",
      },
    ],
  },
];

export const partnerBenefits = [
  {
    title: "Attractive Commissions",
    description: "Earn competitive commissions on every successful transaction",
  },
  {
    title: "Marketing Support",
    description: "Get branded marketing materials and promotional support",
  },
  {
    title: "Training & Certification",
    description: "Comprehensive training on forex products and RBI compliance",
  },
  {
    title: "Dedicated Account Manager",
    description: "Personal support from our partner success team",
  },
  {
    title: "Real-time Dashboard",
    description: "Track your earnings and customer transactions in real-time",
  },
  {
    title: "Priority Support",
    description: "Fast-track resolution for all partner-related queries",
  },
];

// Company Information
export const companyInfo = {
  name: "RBP FINIVIS",
  legalName: "RBP FINIVIS Private Limited",
  address: {
    line1: "Office No – 18, 3rd Floor",
    line2: "Haryana Agro Mall",
    line3: "Sector 20, Panchkula",
    city: "Panchkula",
    state: "Haryana",
    pincode: "134117",
    country: "India",
  },
  regulatory: {
    cin: "U65990HR2019PTC081650",
    rbiLicence: "CG. FFMC 250/2021",
    pan: "AAJCR7283G",
    gst: "06AAJCR7283G1Z1",
    tan: "RTKR13130F",
  },
  contact: {
    phone: "+91 7717309363",
    tollFree: "1800-123-FINIVIS",
    email: "support@rbpfinivis.com",
    website: "www.rbpfinivis.com",
    hours: "Mon - Sat: 9:00 AM - 6:00 PM IST",
  },
};
