import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Upload, Info, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { SampleDocumentLink } from "@/components/shared/SampleDocumentLink";
import { getSampleDocumentUrl } from "@/config/sampleDocuments";

/* ----------------------------------
   LRS PURPOSE DEFINITIONS
----------------------------------- */

export const LRS_PURPOSES = [
  {
    value: "education",
    label: "Education Abroad",
    description: "Tuition fees, living expenses, books",
    documents: ["Admission letter", "Fee receipt", "I-20/CAS"],
    limit: "No sub-limit under LRS",
  },
  {
    value: "medical",
    label: "Medical Treatment Abroad",
    description: "Hospital fees, treatment costs",
    documents: ["Hospital estimate", "Doctor's recommendation", "Visa"],
    limit: "No sub-limit under LRS",
  },
  {
    value: "travel",
    label: "Private Travel / Tourism",
    description: "Personal travel for leisure",
    documents: ["Passport", "Visa", "Air tickets"],
    limit: "USD 2,50,000 per FY",
  },
  {
    value: "family_maintenance",
    label: "Maintenance of Close Relatives",
    description: "Support to relatives abroad",
    documents: ["Relationship declaration", "Beneficiary ID"],
    limit: "USD 2,50,000 per FY",
  },
  {
    value: "employment",
    label: "Employment Abroad",
    description: "Emigration, job-related expenses",
    documents: ["Employment contract", "Work visa"],
    limit: "USD 2,50,000 per FY",
  },
  {
    value: "business_travel",
    label: "Business Travel",
    description: "Individual business trips",
    documents: ["Business visa", "Invitation letter"],
    limit: "USD 2,50,000 per FY",
  },
  {
    value: "emigration",
    label: "Emigration",
    description: "Permanent relocation abroad",
    documents: ["Emigration visa", "Proof of settlement"],
    limit: "USD 2,50,000 per FY",
  },
] as const;

/* ----------------------------------
   PROHIBITED PURPOSES
----------------------------------- */

export const PROHIBITED_PURPOSES = [
  "Margin trading / speculation",
  "Crypto / virtual assets",
  "Lottery tickets",
  "Real estate (some restrictions)",
  "Capital account transactions beyond LRS",
];

/* ----------------------------------
   COMPONENT PROPS
----------------------------------- */

interface RemittancePurposeSelectProps {
  value: string;
  onChange: (value: string) => void;
  showDocumentRequirements?: boolean;
  error?: string;
  onUploaded?: (doc: { documentId: string; fileName: string; filePath: string; uploadedAt: string }) => void;
}

/* ----------------------------------
   COMPONENT
----------------------------------- */

export function RemittancePurposeSelect({
  value,
  onChange,
  showDocumentRequirements = true,
  error,
  onUploaded,
}: RemittancePurposeSelectProps) {
  const selectedPurpose = LRS_PURPOSES.find((p) => p.value === value);
  const { user } = useAuth();
  const [uploadedSet, setUploadedSet] = useState<Set<string>>(new Set());
  const [uploadingName, setUploadingName] = useState<string | null>(null);

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "_");

  const handleDocumentUpload = async (
    purposeVal: string,
    documentName: string,
    file: File | null
  ) => {
    if (!file) return;
    if (!user) {
      toast.error("Please sign in to upload documents");
      return;
    }

    // validations
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only PDF, JPG, and PNG files are allowed");
      return;
    }

    const docId = slugify(documentName);

    // optimistic UI
    setUploadingName(documentName);
    setUploadedSet(prev => new Set([...prev, documentName]));

    try {
      const ext = (file.name.split(".").pop() || "").replace(/[^a-zA-Z0-9]/g, "");
      const safeName = `${docId}-${Date.now()}.${ext}`;
      const path = `${user.id}/remittance/${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("kyc-documents")
        .upload(path, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from("kyc_documents").insert({
        user_id: user.id,
        order_id: null,
        service_type: "remittance",
        document_type: docId,
        storage_bucket: "kyc-documents",
        storage_path: path,
        status: "pending",
      });

      if (dbError) throw dbError;

      const finalDoc = {
        documentId: docId,
        fileName: file.name,
        filePath: path,
        uploadedAt: new Date().toISOString(),
      };

      onUploaded?.(finalDoc);

      toast.success(`${documentName} uploaded`);
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadedSet(prev => {
        const s = new Set(prev);
        s.delete(documentName);
        return s;
      });
      const msg = err?.message || "Upload failed";
      toast.error(msg);
    } finally {
      setUploadingName(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* PURPOSE SELECT */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          Purpose of Remittance
          <Badge variant="outline" className="text-xs">
            RBI Mandatory
          </Badge>
        </Label>

        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className={error ? "border-destructive" : ""}>
            <SelectValue placeholder="Select purpose (required)" />
          </SelectTrigger>
          <SelectContent>
            {LRS_PURPOSES.map((purpose) => (
              <SelectItem key={purpose.value} value={purpose.value}>
                <div className="flex flex-col items-start">
                  <span>{purpose.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {purpose.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      {/* DOCUMENT REQUIREMENTS */}
      {showDocumentRequirements && selectedPurpose && (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-primary" />
              Required Documents for {selectedPurpose.label}
            </div>

            <div className="space-y-2">
              {selectedPurpose.documents.map((doc) => (
                <div key={doc} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-background/50 hover:bg-background transition">
                  <label className="cursor-pointer flex-1">
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) =>
                        handleDocumentUpload(
                          selectedPurpose.value,
                          doc,
                          e.target.files?.[0] || null
                        )
                      }
                    />
                    <Badge
                      variant={uploadedSet.has(doc) ? "outline" : "secondary"}
                      className="text-xs flex items-center gap-1 hover:bg-primary/10 transition w-fit"
                    >
                      {uploadingName === doc ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : uploadedSet.has(doc) ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <Upload className="h-3 w-3" />
                      )}
                      {doc}
                    </Badge>
                  </label>
                  <SampleDocumentLink
                    documentId={doc.toLowerCase().replace(/\s+/g, "_")}
                    documentLabel={doc}
                    sampleDocUrl={getSampleDocumentUrl(doc.toLowerCase().replace(/\s+/g, "_"))}
                    className="text-xs"
                    variant="link"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5" />
              <span>Limit: {selectedPurpose.limit}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PROHIBITED NOTICE */}
      <div className="text-xs text-muted-foreground">
        <p className="font-medium mb-1">Not Permitted under LRS:</p>
        <p className="text-destructive/80">
          {PROHIBITED_PURPOSES.slice(0, 3).join(" • ")}
        </p>
      </div>
    </div>
  );
}