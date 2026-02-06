import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  ArrowRight, 
  User,
  Loader2,
} from "lucide-react";
import type { ExchangeOrderData } from "@/pages/CurrencyExchange";

interface PayeeDetailsProps {
  orderData: ExchangeOrderData;
  onUpdateData: (data: Partial<ExchangeOrderData>) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const PayeeDetails = ({ 
  orderData, 
  onUpdateData, 
  onBack, 
  onContinue 
}: PayeeDetailsProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    payeeName: orderData.payeeName || "",
    payeeAddress: orderData.payeeAddress || "",
    payeePhone: orderData.payeePhone || "",
    deliveryAddress: orderData.deliveryAddress || "",
  });

  const isValid = formData.payeeName.trim() && formData.payeeAddress.trim() && 
                  formData.payeePhone.trim() && formData.deliveryAddress.trim();

  const handleSubmit = async () => {
    if (!isValid || !orderData.orderId) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("currency_exchange_orders")
        .update({
          payee_name: formData.payeeName,
          payee_address: formData.payeeAddress,
          payee_phone: formData.payeePhone,
          delivery_address: formData.deliveryAddress,
        })
        .eq("id", orderData.orderId);

      if (error) throw error;

      onUpdateData({
        payeeName: formData.payeeName,
        payeeAddress: formData.payeeAddress,
        payeePhone: formData.payeePhone,
        deliveryAddress: formData.deliveryAddress,
      });

      onContinue();
    } catch (error: any) {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save payee details",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Payee Details</CardTitle>
            <CardDescription>
              Enter the details of the person who will receive the currency
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payeeName">Full Name *</Label>
            <Input
              id="payeeName"
              placeholder="Enter full name as per ID"
              value={formData.payeeName}
              onChange={(e) => setFormData(prev => ({ ...prev, payeeName: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payeePhone">Contact Number *</Label>
            <Input
              id="payeePhone"
              type="tel"
              placeholder="+91 XXXXX XXXXX"
              value={formData.payeePhone}
              onChange={(e) => setFormData(prev => ({ ...prev, payeePhone: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payeeAddress">Payee Address *</Label>
            <Textarea
              id="payeeAddress"
              placeholder="Enter complete address"
              value={formData.payeeAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, payeeAddress: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryAddress">Delivery Address *</Label>
            <Textarea
              id="deliveryAddress"
              placeholder="Enter delivery address (can be same as payee address)"
              value={formData.deliveryAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, deliveryAddress: e.target.value }))}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This is where the currency will be delivered
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} disabled={isProcessing} className="flex-1">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isProcessing} className="flex-1">
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
