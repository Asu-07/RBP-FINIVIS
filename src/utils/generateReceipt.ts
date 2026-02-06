import jsPDF from "jspdf";

interface ReceiptData {
  referenceNumber: string;
  type: string;
  status: string;
  sourceAmount: number;
  sourceCurrency: string;
  destinationAmount: number;
  destinationCurrency: string;
  exchangeRate?: number;
  feeAmount?: number;
  timestamp: string;
  beneficiaryName?: string;
}

const currencySymbols: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "AED ",
  SGD: "S$",
  AUD: "A$",
  CAD: "C$",
  CHF: "CHF ",
  JPY: "¥",
};

const typeLabels: Record<string, string> = {
  send: "International Remittance",
  exchange: "Currency Exchange",
  deposit: "Wallet Deposit",
  remittance: "International Remittance",
};

export const generateReceipt = (data: ReceiptData): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  const getSymbol = (currency: string) => currencySymbols[currency] || `${currency} `;
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Colors
  const primaryColor = [37, 99, 235]; // Blue
  const textColor = [31, 41, 55]; // Dark gray
  const mutedColor = [107, 114, 128]; // Gray
  const successColor = [22, 163, 74]; // Green

  // Header Background
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 50, "F");

  // Company Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("RBP FINIVIS", 20, 25);

  // Subtitle
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("RBI Licensed Forex & Remittance Services", 20, 35);

  // Receipt Title
  doc.setFontSize(14);
  doc.text("TRANSACTION RECEIPT", pageWidth - 20, 30, { align: "right" });

  // Status Badge
  const statusY = 65;
  doc.setFillColor(successColor[0], successColor[1], successColor[2]);
  doc.roundedRect(pageWidth - 55, statusY - 7, 35, 12, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text("COMPLETED", pageWidth - 37.5, statusY, { align: "center" });

  // Reference Number
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Reference Number", 20, statusY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.text(data.referenceNumber, 20, statusY + 8);

  // Divider
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(20, 85, pageWidth - 20, 85);

  // Transaction Type
  let currentY = 100;
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.setFontSize(10);
  doc.text("Transaction Type", 20, currentY);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(12);
  doc.text(typeLabels[data.type] || data.type, 20, currentY + 7);

  // Date
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.setFontSize(10);
  doc.text("Date & Time", pageWidth / 2, currentY);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(12);
  doc.text(formatDate(data.timestamp), pageWidth / 2, currentY + 7);

  // Amount Section
  currentY = 130;
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(20, currentY - 5, pageWidth - 40, 50, 3, 3, "F");

  // Source Amount
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.setFontSize(10);
  doc.text("Amount Sent", 30, currentY + 8);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`${getSymbol(data.sourceCurrency)}${data.sourceAmount.toLocaleString()}`, 30, currentY + 20);

  // Arrow
  if (data.sourceCurrency !== data.destinationCurrency) {
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    doc.setFontSize(14);
    doc.text("→", pageWidth / 2, currentY + 18, { align: "center" });

    // Destination Amount
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Amount Received", pageWidth - 30, currentY + 8, { align: "right" });
    doc.setTextColor(successColor[0], successColor[1], successColor[2]);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(
      `${getSymbol(data.destinationCurrency)}${data.destinationAmount.toLocaleString()}`,
      pageWidth - 30,
      currentY + 20,
      { align: "right" }
    );
  }

  // Beneficiary (if applicable)
  if (data.beneficiaryName) {
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Beneficiary", 30, currentY + 35);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(11);
    doc.text(data.beneficiaryName, 80, currentY + 35);
  }

  // Transaction Details
  currentY = 195;
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Transaction Details", 20, currentY);

  currentY += 15;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const addDetailRow = (label: string, value: string) => {
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    doc.text(label, 20, currentY);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(value, pageWidth - 20, currentY, { align: "right" });
    currentY += 12;
  };

  addDetailRow("Source Currency", data.sourceCurrency);
  addDetailRow("Destination Currency", data.destinationCurrency);

  if (data.exchangeRate) {
    addDetailRow("Exchange Rate", `1 ${data.sourceCurrency} = ${data.exchangeRate.toFixed(4)} ${data.destinationCurrency}`);
  }

  if (data.feeAmount !== undefined && data.feeAmount > 0) {
    addDetailRow("Transaction Fee", `${getSymbol(data.sourceCurrency)}${data.feeAmount.toLocaleString()}`);
  }

  addDetailRow("Total Amount", `${getSymbol(data.sourceCurrency)}${(data.sourceAmount + (data.feeAmount || 0)).toLocaleString()}`);

  // Divider
  currentY += 5;
  doc.setDrawColor(229, 231, 235);
  doc.line(20, currentY, pageWidth - 20, currentY);

  // Footer
  currentY = 270;
  doc.setFillColor(249, 250, 251);
  doc.rect(0, currentY - 10, pageWidth, 40, "F");

  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.setFontSize(8);
  doc.text("This is an electronically generated receipt and does not require a signature.", pageWidth / 2, currentY, { align: "center" });
  doc.text("For any queries, contact support@rbpfinivis.com | +91 XXXXX XXXXX", pageWidth / 2, currentY + 8, { align: "center" });
  doc.text("RBP FINIVIS PVT LTD | RBI Licensed AD Category-II | FEMA Compliant", pageWidth / 2, currentY + 16, { align: "center" });

  // Save PDF
  doc.save(`RBP-Receipt-${data.referenceNumber}.pdf`);
};
