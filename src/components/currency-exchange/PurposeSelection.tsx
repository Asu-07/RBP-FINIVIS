import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  Plane, 
  GraduationCap, 
  Stethoscope, 
  Briefcase,
  Building2,
  Shield,
  AlertTriangle,
  FileText,
  Info,
} from "lucide-react";
import type { ExchangeOrderData } from "@/pages/CurrencyExchange";
import { DocumentUpload, PURPOSE_DOCUMENTS, UploadedDocument } from "@/components/shared/DocumentUpload";
import { useAuth } from "@/hooks/useAuth";

const purposes = [
  { 
    id: "travel", 
    label: "Overseas Travel", 
    icon: Plane,
    description: "Personal or leisure travel abroad",
  },
  { 
    id: "education", 
    label: "Education Abroad", 
    icon: GraduationCap,
    description: "Tuition fees, living expenses for studies",
  },
  { 
    id: "medical", 
    label: "Medical Treatment", 
    icon: Stethoscope,
    description: "Medical treatment overseas",
  },
  { 
    id: "employment", 
    label: "Employment Abroad", 
    icon: Briefcase,
    description: "Work-related expenses abroad",
  },
  { 
    id: "business", 
    label: "Business Travel", 
    icon: Building2,
    description: "Business meetings, conferences",
  },
];

interface PurposeSelectionProps {
  orderData: ExchangeOrderData;
  onUpdateData: (data: Partial<ExchangeOrderData>) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const PurposeSelection = ({ 
  orderData, 
  onUpdateData, 
  onBack, 
  onContinue 
}: PurposeSelectionProps) => {
  const { user } = useAuth();
  const [purpose, setPurpose] = useState(orderData.purpose || "");
  const [travelDate, setTravelDate] = useState(orderData.travelDate || "");
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);

  const selectedPurpose = purposes.find(p => p.id === purpose);
  
  // Check if forex amount exceeds USD 3000 equivalent (cash limit)
  const usdEquivalent = orderData.exchangeType === "buy" 
    ? orderData.convertedAmount 
    : orderData.amount;
  const exceedsCashLimit = usdEquivalent > 3000;
  
  // Check if all required documents are uploaded
  const requiredDocs = purpose ? PURPOSE_DOCUMENTS[purpose]?.filter(d => d.required) || [] : [];
  const allRequiredDocsUploaded = requiredDocs.every(
    doc => uploadedDocs.some(uploaded => uploaded.documentId === doc.id)
  );
  
  // For amounts > USD 3000, documents are mandatory
  const documentsValid = !exceedsCashLimit || allRequiredDocsUploaded;
  
  const canContinue = purpose && travelDate && declarationChecked && documentsValid;

  const handleDocumentUploadComplete = (docs: UploadedDocument[]) => {
    setUploadedDocs(docs);
  };

  const handleContinue = () => {
    onUpdateData({
      purpose,
      travelDate,
      declarationAccepted: declarationChecked,
      uploadedDocuments: uploadedDocs.map(d => d.filePath),
    });
    onContinue();
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Purpose & Compliance</CardTitle>
            <CardDescription>
              Select purpose and provide required declarations (RBI mandatory)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Purpose Selection */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1">
            Purpose of Exchange <span className="text-destructive">*</span>
            <Badge variant="outline" className="ml-2 text-xs">RBI Mandatory</Badge>
          </Label>
          <Select value={purpose} onValueChange={setPurpose}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select purpose" />
            </SelectTrigger>
            <SelectContent>
              {purposes.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  <span className="flex items-center gap-2">
                    <p.icon className="h-4 w-4 text-muted-foreground" />
                    <span>{p.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedPurpose && (
            <p className="text-xs text-muted-foreground">{selectedPurpose.description}</p>
          )}
        </div>

        {/* Travel Date */}
        <div className="space-y-2">
          <Label>
            {orderData.exchangeType === "sell" ? "Return Date" : "Travel Date"} <span className="text-destructive">*</span>
          </Label>
          <Input
            type="date"
            value={travelDate}
            onChange={(e) => setTravelDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="h-12"
          />
        </div>

        {/* Documents Required */}
        {selectedPurpose && user && (
          <DocumentUpload
            purpose={purpose}
            userId={user.id}
            serviceType="currency_exchange"
            onUploadComplete={handleDocumentUploadComplete}
            uploadedDocs={uploadedDocs}
            exceedsCashLimit={exceedsCashLimit}
          />
        )}

        {/* Limits Warning */}
        {exceedsCashLimit && (
          <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm mb-1">Cash Limit Exceeded</p>
                <p className="text-xs text-muted-foreground">
                  Your order exceeds the RBI cash forex limit of USD 3,000 equivalent. 
                  Beyond this limit, forex will be provided via Forex Card or Traveler's Cheque.
                  Valid travel documents are mandatory.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* FEMA Declaration */}
        <div className="p-4 bg-muted/50 rounded-lg border border-border space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent" />
            <span className="font-heading font-semibold text-sm">FEMA & RBI Declaration</span>
          </div>
          
          <div className="flex items-start gap-3">
            <Checkbox
              id="declaration"
              checked={declarationChecked}
              onCheckedChange={(checked) => setDeclarationChecked(checked === true)}
              className="mt-1"
            />
            <label htmlFor="declaration" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
              I hereby declare that the foreign exchange being purchased/sold by me is for the purpose 
              mentioned above and is within the limits prescribed under the Liberalised Remittance Scheme (LRS) 
              of RBI. I confirm that I have not exceeded the annual LRS limit of USD 2,50,000 in the current 
              financial year. I understand that forex cannot be used for prohibited purposes under FEMA including 
              FX trading, speculation, or investment in foreign securities. I undertake to provide valid 
              travel documents as required and acknowledge that providing false information is punishable 
              under FEMA and PMLA.
            </label>
          </div>
        </div>

        {/* Info Box */}
        <div className="flex items-start gap-2 p-3 bg-accent/5 rounded-lg">
          <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            {orderData.exchangeType === "sell" 
              ? "Unspent foreign currency must be surrendered/encashed within 180 days of return to India as per RBI regulations."
              : "As per FEMA, all forex transactions require valid purpose documentation. Form A2 will be generated for your transaction."}
          </p>
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
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
