import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
  Shield,
  Plane,
  GraduationCap,
  Stethoscope,
  Briefcase,
  Building2,
  Globe,
} from "lucide-react";

import type { ExchangeOrderData } from "@/pages/CurrencyExchange";
import { DocumentUpload, DocumentType } from "@/components/shared/DocumentUpload";
import { useAuth } from "@/hooks/useAuth";
import { LRSDeclarationCheckbox } from "@/components/compliance/LRSDeclarationCheckbox";

const PURPOSE_DOCS: Record<string, DocumentType[]> = {
  travel: [
    { id: "passport", label: "Passport", required: true },
    { id: "visa", label: "Visa", required: false },
    { id: "ticket", label: "Flight Ticket", required: false },
  ],
  education: [
    { id: "passport", label: "Passport", required: true },
    { id: "admission_letter", label: "Admission Letter", required: true },
  ],
  medical: [
    { id: "passport", label: "Passport", required: true },
    { id: "medical_letter", label: "Medical Letter", required: true },
  ],
  employment: [
    { id: "passport", label: "Passport", required: true },
    { id: "offer_letter", label: "Offer Letter", required: true },
  ],
  business: [
    { id: "passport", label: "Passport", required: true },
    { id: "invitation_letter", label: "Invitation Letter", required: false },
  ],
};

interface Props {
  orderData: ExchangeOrderData;
  onUpdateData: (data: Partial<ExchangeOrderData>) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const Step3EligibilityCheck = ({
  orderData,
  onUpdateData,
  onBack,
  onContinue,
}: Props) => {
  const { user } = useAuth();
  const [purpose, setPurpose] = useState(orderData.purpose || "");
  const [nationality, setNationality] = useState("Indian");
  const [lrsDeclaration, setLrsDeclaration] = useState<any>(null);
  const [uploadedDocIds, setUploadedDocIds] = useState<Set<string>>(new Set());

  const documents = purpose ? PURPOSE_DOCS[purpose] ?? [] : [];

  const handleContinue = () => {
    onUpdateData({ purpose });
    onContinue();
  };

  const requiredDocs = documents.filter(doc => doc.required);
  const allRequiredUploaded = requiredDocs.length > 0 && requiredDocs.every(doc => uploadedDocIds.has(doc.id));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 3: Eligibility Check</CardTitle>
        <CardDescription>
          Purpose, nationality & document verification
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <Label>Purpose of Exchange *</Label>
          <Select value={purpose} onValueChange={setPurpose}>
            <SelectTrigger>
              <SelectValue placeholder="Select purpose" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="travel">Overseas Travel</SelectItem>
              <SelectItem value="education">Education Abroad</SelectItem>
              <SelectItem value="medical">Medical Treatment</SelectItem>
              <SelectItem value="employment">Employment Abroad</SelectItem>
              <SelectItem value="business">Business Travel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="flex gap-2 items-center">
            <Globe className="h-4 w-4" />
            Nationality *
          </Label>
          <Select value={nationality} onValueChange={setNationality}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Indian">Indian</SelectItem>
              <SelectItem value="NRI">NRI</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {purpose && user && (
          <DocumentUpload
            documents={documents}
            userId={user.id}
            serviceType="currency_exchange"
            orderId={orderData.orderId}
            exceedsCashLimit={(orderData.usdEquivalent ?? 0) > 3000}
            onUploadedChange={setUploadedDocIds}
          />
        )}

        <LRSDeclarationCheckbox
          selected={lrsDeclaration}
          onSelect={setLrsDeclaration}
          usdAmount={orderData.usdEquivalent}
          serviceType="Currency Exchange"
        />

        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleContinue} disabled={!purpose || !allRequiredUploaded}>
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          <Shield className="h-3 w-3 inline mr-1" />
          Documents verified as per RBI guidelines
        </div>
      </CardContent>
    </Card>
  );
};