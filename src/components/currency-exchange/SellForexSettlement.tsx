import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Wallet,
  CheckCircle,
  Info,
} from "lucide-react";

export interface SettlementDetails {
  method: "cash_pickup" | "bank_transfer";
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  ifscCode?: string;
}

interface SellForexSettlementProps {
  value: SettlementDetails | null;
  onChange: (details: SettlementDetails) => void;
}

export const SellForexSettlement = ({
  value,
  onChange,
}: SellForexSettlementProps) => {
  const [method, setMethod] = useState<"cash_pickup" | "bank_transfer">(value?.method || "cash_pickup");
  const [bankName, setBankName] = useState(value?.bankName || "");
  const [accountName, setAccountName] = useState(value?.accountName || "");
  const [accountNumber, setAccountNumber] = useState(value?.accountNumber || "");
  const [ifscCode, setIfscCode] = useState(value?.ifscCode || "");

  const handleMethodChange = (newMethod: "cash_pickup" | "bank_transfer") => {
    setMethod(newMethod);
    if (newMethod === "cash_pickup") {
      onChange({ method: newMethod });
    } else {
      onChange({
        method: newMethod,
        bankName,
        accountName,
        accountNumber,
        ifscCode,
      });
    }
  };

  const handleBankDetailsChange = () => {
    onChange({
      method: "bank_transfer",
      bankName,
      accountName,
      accountNumber,
      ifscCode,
    });
  };

  const isValidIFSC = /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.toUpperCase());
  const isBankDetailsComplete = bankName && accountName && accountNumber && isValidIFSC;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Settlement Preference</CardTitle>
            <CardDescription>
              How would you like to receive your INR?
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Settlement Method Selection */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleMethodChange("cash_pickup")}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              method === "cash_pickup"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                method === "cash_pickup" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}>
                <Wallet className="h-5 w-5" />
              </div>
              <span className="font-semibold">Cash Pickup</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Receive INR cash at our branch after note verification
            </p>
          </button>
          
          <button
            onClick={() => handleMethodChange("bank_transfer")}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              method === "bank_transfer"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                method === "bank_transfer" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}>
                <Building2 className="h-5 w-5" />
              </div>
              <span className="font-semibold">Bank Transfer</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Receive INR directly in your bank account
            </p>
          </button>
        </div>

        {/* Cash Pickup Info */}
        {method === "cash_pickup" && (
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Cash Pickup Process</p>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  <li>• Bring your foreign currency notes to our branch</li>
                  <li>• Notes will be verified for authenticity</li>
                  <li>• Receive INR cash immediately after verification</li>
                  <li>• Valid ID proof required</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Bank Transfer Details */}
        {method === "bank_transfer" && (
          <div className="space-y-4 bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <Label className="font-semibold">Bank Account Details</Label>
              <Badge variant="outline" className="text-xs">For INR Settlement</Badge>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name <span className="text-destructive">*</span></Label>
                <Input
                  id="bankName"
                  value={bankName}
                  onChange={(e) => {
                    setBankName(e.target.value);
                    handleBankDetailsChange();
                  }}
                  placeholder="e.g., State Bank of India"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountName">Account Holder Name <span className="text-destructive">*</span></Label>
                <Input
                  id="accountName"
                  value={accountName}
                  onChange={(e) => {
                    setAccountName(e.target.value.toUpperCase());
                    handleBankDetailsChange();
                  }}
                  placeholder="As per bank records"
                  className="h-11 uppercase"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number <span className="text-destructive">*</span></Label>
                <Input
                  id="accountNumber"
                  value={accountNumber}
                  onChange={(e) => {
                    setAccountNumber(e.target.value.replace(/\D/g, ''));
                    handleBankDetailsChange();
                  }}
                  placeholder="Enter account number"
                  className="h-11 font-mono"
                  maxLength={18}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ifscCode">IFSC Code <span className="text-destructive">*</span></Label>
                <Input
                  id="ifscCode"
                  value={ifscCode}
                  onChange={(e) => {
                    setIfscCode(e.target.value.toUpperCase().slice(0, 11));
                    handleBankDetailsChange();
                  }}
                  placeholder="e.g., SBIN0001234"
                  className="h-11 font-mono uppercase"
                  maxLength={11}
                />
                {ifscCode && !isValidIFSC && (
                  <p className="text-xs text-destructive">Please enter a valid IFSC code (e.g., SBIN0001234)</p>
                )}
                {isValidIFSC && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Valid IFSC format
                  </p>
                )}
              </div>
            </div>

            {isBankDetailsComplete && (
              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Bank details complete</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settlement Note */}
        <div className="text-xs text-muted-foreground text-center p-3 bg-muted/30 rounded-lg">
          <p>
            Balance payable on delivery / pickup / settlement will be processed after physical 
            verification of your currency notes at our branch.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
