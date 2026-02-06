import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DocumentType {
  id: string;
  label: string;
  required: boolean;
  description?: string;
}

interface RemittanceDocumentUploadProps {
  documents: DocumentType[];
  userId: string;
  serviceType: "remittance";
  transactionId?: string;
  onUploadedChange?: (uploadedIds: Set<string>) => void;
}

// Document requirements by purpose
const PURPOSE_DOCUMENT_REQUIREMENTS: Record<string, DocumentRequirement[]> = {
  education: [
    { id: "passport", label: "Passport", description: "Valid passport with 6+ months validity", required: true },
    { id: "admission_letter", label: "Admission Letter", description: "University offer/admission letter", required: true },
    { id: "i20_cas", label: "I-20 / CAS / CoE", description: "Student visa document (I-20 for US, CAS for UK, CoE for Australia)", required: true },
    { id: "fee_invoice", label: "Fee Invoice", description: "University fee receipt or invoice", required: false },
  ],
  medical: [
    { id: "passport", label: "Passport", description: "Valid passport", required: true },
    { id: "medical_visa", label: "Medical Visa", description: "Valid medical visa", required: true },
    { id: "hospital_letter", label: "Hospital Letter", description: "Treatment appointment confirmation", required: true },
    { id: "cost_estimate", label: "Cost Estimate", description: "Medical treatment cost estimate", required: false },
  ],
  travel: [
    { id: "passport", label: "Passport", description: "Valid passport with 6+ months validity", required: true },
    { id: "visa", label: "Visa", description: "Valid visa for destination (if applicable)", required: false },
    { id: "tickets", label: "Travel Tickets", description: "Confirmed flight/travel bookings", required: false },
  ],
  family_maintenance: [
    { id: "passport", label: "Passport", description: "Your valid passport", required: true },
    { id: "relationship_proof", label: "Relationship Proof", description: "Document proving family relationship", required: true },
    { id: "beneficiary_id", label: "Beneficiary ID", description: "ID proof of the beneficiary", required: true },
  ],
  employment: [
    { id: "passport", label: "Passport", description: "Valid passport", required: true },
    { id: "work_visa", label: "Employment Visa", description: "Valid work/employment visa", required: true },
    { id: "offer_letter", label: "Offer Letter", description: "Employment offer/contract letter", required: true },
  ],
  business_travel: [
    { id: "passport", label: "Passport", description: "Valid passport", required: true },
    { id: "business_visa", label: "Business Visa", description: "Valid business visa (if applicable)", required: false },
    { id: "invitation", label: "Invitation Letter", description: "Business invitation or conference registration", required: true },
  ],
  emigration: [
    { id: "passport", label: "Passport", description: "Valid passport", required: true },
    { id: "pr_visa", label: "PR / Emigration Visa", description: "Permanent residency or emigration documentation", required: true },
  ],
};

export const RemittanceDocumentUpload = ({
  documents,
  userId,
  serviceType,
  transactionId,
  onUploadedChange,
}: RemittanceDocumentUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadedIds, setUploadedIds] = useState<Set<string>>(new Set());

  const trigger = (docId: string) => {
    setUploadingId(docId);
    inputRef.current?.click();
  };

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const docId = uploadingId;
    if (!file || !docId) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max file size is 5MB");
      return;
    }

    try {
      const ext = file.name.split(".").pop();
      const path = `${userId}/${serviceType}/${docId}-${Date.now()}.${ext}`;

      await supabase.storage
        .from("kyc-documents")
        .upload(path, file, { upsert: false });

      await supabase.from("kyc_documents").insert({
        user_id: userId,
        order_id: transactionId ?? null,
        service_type: serviceType,
        document_type: docId,
        storage_bucket: "kyc-documents",
        storage_path: path,
        status: "pending",
      });

      const newUploaded = new Set([...uploadedIds, docId]);
      setUploadedIds(newUploaded);
      onUploadedChange?.(newUploaded);
      toast.success("Document uploaded");
    } catch (err: any) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setUploadingId(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleFileSelect = async (docId: string, file: File) => {
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a JPG, PNG, or PDF file");
      return;
    }

    setUploading(docId);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${docId}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/remittance/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("kyc-documents")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        // Handle demo mode or bucket not found
        if (uploadError.message.includes("not found")) {
          const newDoc: UploadedDoc = {
            documentId: docId,
            fileName: file.name,
            filePath: `demo/${filePath}`,
            uploadedAt: new Date().toISOString(),
          };
          
          const updatedDocs = [...uploadedDocs.filter(d => d.documentId !== docId), newDoc];
          setUploadedDocs(updatedDocs);
          toast.success(`${file.name} uploaded successfully`);
          setUploading(null);
          return;
        } else {
          throw uploadError;
        }
      }

      // Insert into kyc_documents table
      await supabase.from("kyc_documents").upsert(
        {
          user_id: userId,
          order_id: transactionId || null,
          service_type: "remittance",
          document_type: docId,
          storage_bucket: "kyc-documents",
          storage_path: filePath,
          status: "pending",
        },
        { onConflict: "storage_path", ignoreDuplicates: true }
      );

      const newDoc: UploadedDoc = {
        documentId: docId,
        fileName: file.name,
        filePath,
        uploadedAt: new Date().toISOString(),
      };
      
      const updatedDocs = [...uploadedDocs.filter(d => d.documentId !== docId), newDoc];
      setUploadedDocs(updatedDocs);
      toast.success(`${file.name} uploaded successfully`);
    } catch (error: unknown) {
      console.error("Upload error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload document";
      toast.error(errorMessage);
    } finally {
      setUploading(null);
    }
  };

  const handleRemoveDocument = (docId: string) => {
    const updatedDocs = uploadedDocs.filter(d => d.documentId !== docId);
    setUploadedDocs(updatedDocs);
    toast.success("Document removed");
  };

  const triggerFileInput = (docId: string) => {
    setCurrentDocId(docId);
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".jpg,.jpeg,.png,.pdf";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileSelect(docId, file);
      }
    };
    input.click();
  };

  const getUploadedDoc = (docId: string) => uploadedDocs.find(d => d.documentId === docId);

  const getFileIcon = (fileName: string) => {
    if (fileName.toLowerCase().endsWith(".pdf")) {
      return <FileText className="h-4 w-4 text-red-500" />;
    }
    return <ImageIcon className="h-4 w-4 text-blue-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Documents</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          hidden
          onChange={onChange}
        />

        {documents.map((doc) => (
          <div key={doc.id} className="flex justify-between items-center border p-3 rounded">
            <div>
              <div className="font-medium">{doc.label}</div>
              {doc.required && <Badge variant="outline">Required</Badge>}
            </div>

            {uploadedIds.has(doc.id) ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Uploaded</span>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => trigger(doc.id)}
                disabled={uploadingId === doc.id}
              >
                {uploadingId === doc.id ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Uploading
                  </>
                ) : (
                  <>
                    <Upload className="h-3 w-3 mr-1" />
                    Upload
                  </>
                )}
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
};
