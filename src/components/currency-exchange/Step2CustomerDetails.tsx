import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  ArrowRight,
  User,
  Phone,
  Mail,
  CreditCard,
  Globe,
  Calendar,
  AlertTriangle,
  Shield,
} from "lucide-react";
import type { ExchangeOrderData } from "@/pages/CurrencyExchange";

const countries = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Singapore", "UAE", "Japan", "South Korea", "Thailand",
  "Malaysia", "Indonesia", "New Zealand", "Switzerland", "Netherlands",
  "Belgium", "Italy", "Spain", "Ireland", "Other"
];

interface Step2CustomerDetailsProps {
  orderData: ExchangeOrderData;
  onUpdateData: (data: Partial<ExchangeOrderData>) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const Step2CustomerDetails = ({
  orderData,
  onUpdateData,
  onBack,
  onContinue,
}: Step2CustomerDetailsProps) => {
  const [fullName, setFullName] = useState(orderData.payeeName || "");
  const [mobile, setMobile] = useState(orderData.payeePhone || "");
  const [email, setEmail] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [destinationCountry, setDestinationCountry] = useState("");
  const [travelStartDate, setTravelStartDate] = useState(orderData.travelDate || "");
  const [travelEndDate, setTravelEndDate] = useState("");
  const [returnNotFinalized, setReturnNotFinalized] = useState(false);

  // Validation
  const isValidPan = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.toUpperCase());
  const isValidMobile = /^[6-9]\d{9}$/.test(mobile);
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const canContinue = 
    fullName.trim() && 
    isValidMobile && 
    isValidEmail && 
    isValidPan && 
    destinationCountry && 
    travelStartDate &&
    (returnNotFinalized || travelEndDate);

  const handleContinue = () => {
    onUpdateData({
      payeeName: fullName,
      payeePhone: mobile,
      travelDate: travelStartDate,
    });
    onContinue();
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Step 2: Customer Details</CardTitle>
            <CardDescription>
              Traveller information as per passport
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* RBI Notice */}
        <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-warning">RBI Compliance Notice</p>
              <p className="text-xs text-muted-foreground mt-1">
                As per RBI guidelines, the buyer, traveller, and payer must be the same person for forex transactions. 
                Name should match exactly as per passport.
              </p>
            </div>
          </div>
        </div>

        {/* Full Name */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Traveller's Full Name (as per Passport) <span className="text-destructive">*</span>
          </Label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value.toUpperCase())}
            placeholder="JOHN DOE"
            className="h-12 uppercase"
          />
        </div>

        {/* Mobile & Email */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              Mobile Number <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">+91</span>
              <Input
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="9876543210"
                className="h-12 pl-12"
              />
            </div>
            {mobile && !isValidMobile && (
              <p className="text-xs text-destructive">Please enter a valid 10-digit mobile number</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="h-12"
            />
            {email && !isValidEmail && (
              <p className="text-xs text-destructive">Please enter a valid email address</p>
            )}
          </div>
        </div>

        {/* PAN Number */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            PAN Number <span className="text-destructive">*</span>
            <Badge variant="outline" className="text-xs">Mandatory for RBI Compliance</Badge>
          </Label>
          <Input
            value={panNumber}
            onChange={(e) => setPanNumber(e.target.value.toUpperCase().slice(0, 10))}
            placeholder="ABCDE1234F"
            className="h-12 uppercase font-mono"
            maxLength={10}
          />
          {panNumber && !isValidPan && (
            <p className="text-xs text-destructive">Please enter a valid PAN number (e.g., ABCDE1234F)</p>
          )}
          {isValidPan && (
            <p className="text-xs text-green-600">✓ Valid PAN format</p>
          )}
        </div>

        {/* Destination Country */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            Destination Country <span className="text-destructive">*</span>
          </Label>
          <Select value={destinationCountry} onValueChange={setDestinationCountry}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select destination country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>{country}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Travel Dates */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Travel Start Date <span className="text-destructive">*</span>
            </Label>
            <Input
              type="date"
              value={travelStartDate}
              onChange={(e) => setTravelStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="h-12"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Travel End Date {!returnNotFinalized && <span className="text-destructive">*</span>}
            </Label>
            <Input
              type="date"
              value={travelEndDate}
              onChange={(e) => setTravelEndDate(e.target.value)}
              min={travelStartDate || new Date().toISOString().split('T')[0]}
              className="h-12"
              disabled={returnNotFinalized}
            />
          </div>
        </div>

        {/* Return Not Finalized */}
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <Checkbox
            id="return-not-finalized"
            checked={returnNotFinalized}
            onCheckedChange={(checked) => {
              setReturnNotFinalized(checked === true);
              if (checked) setTravelEndDate("");
            }}
          />
          <label htmlFor="return-not-finalized" className="text-sm cursor-pointer">
            Return date not finalized
          </label>
        </div>

        {/* Order Summary */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            Order Summary
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Type:</span>
            <span className="font-medium capitalize">{orderData.exchangeType} Forex</span>
            
            <span className="text-muted-foreground">Currency:</span>
            <span className="font-medium">{orderData.exchangeType === "buy" ? orderData.toCurrency : orderData.fromCurrency}</span>
            
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-medium">
              {orderData.exchangeType === "buy" 
                ? `${orderData.toCurrency} ${orderData.amount.toLocaleString()}`
                : `₹${orderData.amount.toLocaleString()}`
              }
            </span>
            
            <span className="text-muted-foreground">City:</span>
            <span className="font-medium">{orderData.city}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            className="flex-1"
            disabled={!canContinue}
            onClick={handleContinue}
          >
            Continue to Eligibility
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
