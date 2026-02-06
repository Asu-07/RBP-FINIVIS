import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  MessageCircle, 
  Phone, 
  MapPin, 
  Clock,
  Shield,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AssistedLRSHandlingProps {
  serviceType: string;
  referenceId?: string;
  amount?: number;
  currency?: string;
  purpose?: string;
  onCallbackRequested?: (phone: string, timeSlot: string) => void;
}

const timeSlots = [
  "10:00 AM - 12:00 PM",
  "12:00 PM - 2:00 PM",
  "2:00 PM - 4:00 PM",
  "4:00 PM - 6:00 PM",
];

const WHATSAPP_NUMBER = "919876543210"; // Replace with actual WhatsApp business number

export const AssistedLRSHandling = ({
  serviceType,
  referenceId,
  amount,
  currency = "USD",
  purpose,
  onCallbackRequested,
}: AssistedLRSHandlingProps) => {
  const [showCallbackForm, setShowCallbackForm] = useState(false);
  const [phone, setPhone] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [callbackSubmitted, setCallbackSubmitted] = useState(false);

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Hi, I need assistance with an LRS transaction above the annual limit.\n\n` +
      `Service: ${serviceType}\n` +
      `${referenceId ? `Reference ID: ${referenceId}\n` : ""}` +
      `${amount ? `Amount: ${currency} ${amount.toLocaleString()}\n` : ""}` +
      `${purpose ? `Purpose: ${purpose}\n` : ""}` +
      `\nPlease help me complete this transaction.`
    );
    
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  const handleCallbackRequest = () => {
    if (!phone || phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    if (!timeSlot) {
      toast.error("Please select a preferred time slot");
      return;
    }

    setCallbackSubmitted(true);
    toast.success("Callback request submitted! Our team will call you shortly.");
    
    if (onCallbackRequested) {
      onCallbackRequested(phone, timeSlot);
    }
  };

  if (callbackSubmitted) {
    return (
      <Card className="border-green-500/20 bg-green-500/5">
        <CardContent className="pt-6 text-center">
          <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Callback Scheduled</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Our team will call you at <span className="font-medium">{phone}</span> during <span className="font-medium">{timeSlot}</span>.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>Your transaction will be processed with personalized assistance</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Assisted Processing Required</CardTitle>
            <p className="text-sm text-muted-foreground">
              This transaction requires assisted processing as per RBI guidelines
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Informational Message */}
        <div className="bg-muted/50 rounded-lg p-4 text-sm">
          <p className="text-muted-foreground">
            Transactions exceeding the annual LRS limit of USD 250,000 require special handling. 
            Our team will assist you in completing this transaction smoothly with all necessary documentation.
          </p>
        </div>

        {/* Primary CTA - WhatsApp */}
        <Button
          className="w-full h-12 bg-green-600 hover:bg-green-700"
          onClick={handleWhatsAppClick}
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          Continue on WhatsApp
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>

        {/* Secondary CTA - Callback */}
        {!showCallbackForm ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowCallbackForm(true)}
          >
            <Phone className="h-4 w-4 mr-2" />
            Request a Callback
          </Button>
        ) : (
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
            <h4 className="font-medium flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Request a Callback
            </h4>
            
            <div className="space-y-2">
              <Label htmlFor="callback-phone">Phone Number</Label>
              <Input
                id="callback-phone"
                type="tel"
                placeholder="Enter your mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={10}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Preferred Time Slot
              </Label>
              <Select value={timeSlot} onValueChange={setTimeSlot}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCallbackForm(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleCallbackRequest}
                disabled={!phone || !timeSlot}
              >
                Submit Request
              </Button>
            </div>
          </div>
        )}

        {/* Physical Branch Option */}
        <div className="p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Visit Our Office</p>
              <p className="text-xs text-muted-foreground mt-1">
                You may also visit our office for in-person assistance:
              </p>
              <p className="text-sm mt-2">
                Office No. 1, Agro Mall<br />
                Sector 20, Panchkula
              </p>
              <Badge variant="secondary" className="mt-2 text-xs">
                Mon–Sat: 10:00 AM – 6:00 PM
              </Badge>
            </div>
          </div>
        </div>

        {/* Trust Signal */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
          <Shield className="h-3 w-3" />
          <span>All transactions processed via authorized partners as per RBI guidelines</span>
        </div>
      </CardContent>
    </Card>
  );
};
