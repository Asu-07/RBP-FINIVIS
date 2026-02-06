import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Building2, 
  Loader2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useRefundableBalance } from "@/hooks/useRefundableBalance";
import { toast } from "sonner";

interface BankRefundRequestFormProps {
  availableBalance: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const BankRefundRequestForm = ({
  availableBalance,
  onSuccess,
  onCancel,
}: BankRefundRequestFormProps) => {
  const { requestBankRefund } = useRefundableBalance();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: availableBalance.toString(),
    accountName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifsc: "",
    bankName: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const amount = parseFloat(formData.amount);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return false;
    }
    
    if (amount > availableBalance) {
      toast.error("Amount exceeds available balance");
      return false;
    }
    
    if (!formData.accountName.trim()) {
      toast.error("Please enter account holder name");
      return false;
    }
    
    if (!formData.accountNumber.trim()) {
      toast.error("Please enter account number");
      return false;
    }
    
    if (formData.accountNumber !== formData.confirmAccountNumber) {
      toast.error("Account numbers do not match");
      return false;
    }
    
    if (!formData.ifsc.trim() || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc.toUpperCase())) {
      toast.error("Please enter a valid IFSC code");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await requestBankRefund(parseFloat(formData.amount), {
        accountName: formData.accountName,
        accountNumber: formData.accountNumber,
        ifsc: formData.ifsc.toUpperCase(),
        bankName: formData.bankName || undefined,
      });
      
      if (result.success) {
        onSuccess();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Refund Timeline Notice */}
      <div className="flex items-start gap-2 p-3 bg-accent/10 rounded-lg border border-accent/20">
        <Clock className="h-4 w-4 text-accent shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-accent-foreground">Refund Timeline</p>
          <p className="text-muted-foreground">
            Bank refunds are typically processed within 5-7 working days after admin approval.
          </p>
        </div>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Refund Amount (₹)</Label>
        <Input
          id="amount"
          type="number"
          value={formData.amount}
          onChange={(e) => handleChange("amount", e.target.value)}
          max={availableBalance}
          min={1}
          step="0.01"
        />
        <p className="text-xs text-muted-foreground">
          Maximum available: ₹{availableBalance.toLocaleString()}
        </p>
      </div>

      {/* Bank Name */}
      <div className="space-y-2">
        <Label htmlFor="bankName">Bank Name</Label>
        <Input
          id="bankName"
          placeholder="e.g., State Bank of India"
          value={formData.bankName}
          onChange={(e) => handleChange("bankName", e.target.value)}
        />
      </div>

      {/* Account Holder Name */}
      <div className="space-y-2">
        <Label htmlFor="accountName">Account Holder Name *</Label>
        <Input
          id="accountName"
          placeholder="As per bank records"
          value={formData.accountName}
          onChange={(e) => handleChange("accountName", e.target.value)}
          required
        />
      </div>

      {/* Account Number */}
      <div className="space-y-2">
        <Label htmlFor="accountNumber">Account Number *</Label>
        <Input
          id="accountNumber"
          placeholder="Enter account number"
          value={formData.accountNumber}
          onChange={(e) => handleChange("accountNumber", e.target.value)}
          required
        />
      </div>

      {/* Confirm Account Number */}
      <div className="space-y-2">
        <Label htmlFor="confirmAccountNumber">Confirm Account Number *</Label>
        <Input
          id="confirmAccountNumber"
          placeholder="Re-enter account number"
          value={formData.confirmAccountNumber}
          onChange={(e) => handleChange("confirmAccountNumber", e.target.value)}
          required
        />
        {formData.accountNumber && formData.confirmAccountNumber && 
         formData.accountNumber !== formData.confirmAccountNumber && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Account numbers do not match
          </p>
        )}
      </div>

      {/* IFSC Code */}
      <div className="space-y-2">
        <Label htmlFor="ifsc">IFSC Code *</Label>
        <Input
          id="ifsc"
          placeholder="e.g., SBIN0001234"
          value={formData.ifsc}
          onChange={(e) => handleChange("ifsc", e.target.value.toUpperCase())}
          maxLength={11}
          required
        />
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
        <p>
          Please ensure bank details are correct. Refunds to incorrect accounts may result in delays or loss of funds.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Building2 className="h-4 w-4 mr-2" />
              Submit Request
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
