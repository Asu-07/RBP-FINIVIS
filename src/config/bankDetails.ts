// Centralized bank details configuration for wallet-free payment flow
// All payments are service-based, not wallet-based (PPI compliant)

export const rbpBankDetails = {
  bankName: "State Bank of India",
  accountNumber: "50100234567890",
  ifsc: "SBIN0001234",
  accountName: "RBP FINIVIS PVT LTD",
  branch: "Nariman Point, Mumbai",
};

export const currencySymbols: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "د.إ",
  SGD: "S$",
  AUD: "A$",
  CAD: "C$",
  CHF: "CHF",
  JPY: "¥",
  SAR: "﷼",
  NZD: "NZ$",
  THB: "฿",
  CNY: "¥",
  HKD: "HK$",
  MYR: "RM",
  KRW: "₩",
  ZAR: "R",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  PHP: "₱",
  IDR: "Rp",
  BDT: "৳",
  PKR: "₨",
  LKR: "Rs",
  NPR: "रू",
  QAR: "﷼",
  KWD: "د.ك",
  BHD: "د.ب",
  OMR: "ر.ع",
};

// Generate unique reference code for transactions
export const generateReferenceCode = (prefix: string = "RBP") => {
  return `${prefix}${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
};
