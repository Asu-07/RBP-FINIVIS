import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Transaction {
  id: string;
  reference_number: string | null;
  transaction_type: string;
  source_currency: string;
  source_amount: number;
  destination_currency: string;
  destination_amount: number;
  exchange_rate: number | null;
  fee_amount: number | null;
  status: string;
  created_at: string;
}

interface TransactionExportProps {
  transactions: Transaction[];
}

const currencySymbols: Record<string, string> = {
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
};

export function TransactionExport({ transactions }: TransactionExportProps) {
  const [exporting, setExporting] = useState(false);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportToCSV = () => {
    if (transactions.length === 0) {
      toast.error("No transactions to export");
      return;
    }

    setExporting(true);

    const headers = [
      "Reference Number",
      "Date",
      "Type",
      "Source Amount",
      "Source Currency",
      "Destination Amount",
      "Destination Currency",
      "Exchange Rate",
      "Fee",
      "Status",
    ];

    const rows = transactions.map((tx) => [
      tx.reference_number || tx.id.slice(0, 8),
      formatDate(tx.created_at),
      tx.transaction_type,
      tx.source_amount.toFixed(2),
      tx.source_currency,
      tx.destination_amount.toFixed(2),
      tx.destination_currency,
      tx.exchange_rate?.toFixed(4) || "-",
      tx.fee_amount?.toFixed(2) || "0.00",
      tx.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Transactions exported to CSV");
    setExporting(false);
  };

  const exportToPDF = () => {
    if (transactions.length === 0) {
      toast.error("No transactions to export");
      return;
    }

    setExporting(true);

    // Generate HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Transaction History - RBP FINIVIS</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1a365d; padding-bottom: 20px; }
          .header h1 { color: #1a365d; margin: 0 0 5px 0; }
          .header p { color: #718096; margin: 0; font-size: 14px; }
          .meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; color: #718096; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
          th { background: #1a365d; color: white; padding: 10px 8px; text-align: left; }
          td { padding: 10px 8px; border-bottom: 1px solid #e2e8f0; }
          tr:nth-child(even) { background: #f7fafc; }
          .amount { font-weight: 600; }
          .status { padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; }
          .status-completed { background: #c6f6d5; color: #22543d; }
          .status-pending { background: #fef3c7; color: #92400e; }
          .status-failed { background: #fed7d7; color: #c53030; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #718096; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RBP FINIVIS</h1>
          <p>Transaction History Report</p>
        </div>
        <div class="meta">
          <span>Generated: ${new Date().toLocaleString("en-IN")}</span>
          <span>Total Transactions: ${transactions.length}</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Reference</th>
              <th>Date</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Destination</th>
              <th>Rate</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${transactions
              .map(
                (tx) => `
              <tr>
                <td>${tx.reference_number || tx.id.slice(0, 8)}</td>
                <td>${formatDate(tx.created_at)}</td>
                <td style="text-transform: capitalize;">${tx.transaction_type}</td>
                <td class="amount">${currencySymbols[tx.source_currency] || ""}${tx.source_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td class="amount">${currencySymbols[tx.destination_currency] || ""}${tx.destination_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td>${tx.exchange_rate?.toFixed(4) || "-"}</td>
                <td><span class="status status-${tx.status}">${tx.status}</span></td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <div class="footer">
          <p>RBP FINIVIS Private Limited | RBI Licensed FFMC | CG. FFMC 250/2021</p>
          <p>This is a computer-generated document and does not require a signature.</p>
        </div>
      </body>
      </html>
    `;

    // Open print dialog for PDF
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
      toast.success("PDF export ready - use Print to PDF");
    } else {
      toast.error("Please allow popups for PDF export");
    }

    setExporting(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={exporting || transactions.length === 0}>
          {exporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
