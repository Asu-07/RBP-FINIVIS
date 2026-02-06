import { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SampleDocumentLink } from "./SampleDocumentLink";
import { getSampleDocumentUrl } from "@/config/sampleDocuments";

export interface DocumentType {
  id: string;
  label: string;
  required: boolean;
  description?: string;
}

export interface UploadedDocument {
  documentId: string;
  fileName: string;
  filePath: string;
  uploadedAt: string;
}

// Re-export a PURPOSE_DOCUMENTS map so pages that rely on it (Remittance) still work
export const PURPOSE_DOCUMENTS: Record<string, DocumentType[]> = {
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
  family_maintenance: [
    { id: "passport", label: "Passport", required: true },
    { id: "relationship_proof", label: "Proof of Relationship", required: true },
    { id: "beneficiary_id", label: "Beneficiary ID", required: true },
  ],
  business_travel: [
    { id: "passport", label: "Passport", required: true },
    { id: "visa", label: "Business Visa", required: true },
    { id: "invitation_letter", label: "Invitation Letter", required: true },
  ],
  emigration: [
    { id: "passport", label: "Passport", required: true },
    { id: "visa", label: "Emigration Visa", required: true },
    { id: "settlement_proof", label: "Proof of Settlement", required: true },
  ],
};

interface Props {
  // Either pass a pre-built documents array (currency-exchange) or a purpose string (remittance)
  documents?: DocumentType[];
  purpose?: string;
  userId: string;
  serviceType: "currency_exchange" | "remittance" | "forex_card";
  orderId?: string;
  exceedsCashLimit?: boolean;
  // Callback used by currency-exchange flow (Set of ids)
  onUploadedChange?: (uploadedIds: Set<string>) => void;
  // Callback used by remittance flow (array of uploaded docs)
  onUploadComplete?: (uploadedDocs: UploadedDocument[]) => void;
  // initial uploaded docs (remittance page passes this)
  uploadedDocs?: UploadedDocument[];
}

export const DocumentUpload = ({
  documents,
  purpose,
  userId,
  serviceType,
  orderId,
  exceedsCashLimit,
  onUploadedChange,
  onUploadComplete,
  uploadedDocs: initialUploadedDocs = [],
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadedIds, setUploadedIds] = useState<Set<string>>(new Set());
  const [localUploadedDocs, setLocalUploadedDocs] = useState<UploadedDocument[]>(initialUploadedDocs || []);

  // derive the documents list
  const docs: DocumentType[] = documents ?? (purpose ? PURPOSE_DOCUMENTS[purpose] ?? [] : []);

  // Keep uploadedIds in sync with uploadedDocs array when provided
  useEffect(() => {
    if (initialUploadedDocs && initialUploadedDocs.length > 0) {
      setLocalUploadedDocs(initialUploadedDocs);
      setUploadedIds(new Set(initialUploadedDocs.map(d => d.documentId)));
    }
  }, [initialUploadedDocs]);

  const trigger = (docId: string) => {
    // We don't set uploadingId here because if the user cancels the file picker,
    // onChange won't fire and the button will be stuck in "Uploading..." state.
    if (inputRef.current) {
      // store doc id on the input so we can read it in onChange
      inputRef.current.dataset.docId = docId;
      inputRef.current.click();
    }
  };

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const docId = e.currentTarget.dataset.docId || uploadingId;
    if (!file || !docId) return;

    // Set loading state only after we have a file selected
    setUploadingId(docId);

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max file size is 5MB");
      setUploadingId(null); // Reset since we're returning early
      if (inputRef.current) inputRef.current.value = ""; // Reset input
      return;
    }
    // Optimistic UI update: mark as uploaded locally immediately
    const prevUploadedIds = new Set(uploadedIds);
    const optimisticIds = new Set(prevUploadedIds);
    optimisticIds.add(docId);
    setUploadedIds(optimisticIds);
    onUploadedChange?.(optimisticIds);

    const prevLocal = [...localUploadedDocs];
    const optimisticDoc: UploadedDocument = {
      documentId: docId,
      fileName: file.name,
      filePath: "", // will be filled after upload
      uploadedAt: new Date().toISOString(),
    };
    const optimisticArray = [...prevLocal.filter(d => d.documentId !== docId), optimisticDoc];
    setLocalUploadedDocs(optimisticArray);
    onUploadComplete?.(optimisticArray);

    try {
      // sanitize filename and build path
      const rawExt = (file.name.split(".").pop() || "").replace(/[^a-zA-Z0-9]/g, "");
      const timestamp = Date.now();
      const safeDocId = docId.replace(/[^a-zA-Z0-9_-]/g, "");
      const safeFileName = `${safeDocId}-${timestamp}.${rawExt}`;
      const path = `${userId}/${serviceType}/${safeFileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from("kyc-documents")
        .upload(path, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: dbData, error: dbError } = await supabase.from("kyc_documents").insert({
        user_id: userId,
        order_id: orderId ?? null,
        service_type: serviceType,
        document_type: docId,
        storage_bucket: "kyc-documents",
        storage_path: path,
        status: "pending",
      });

      if (dbError) throw dbError;

      // final uploaded doc
      const finalDoc: UploadedDocument = {
        documentId: docId,
        fileName: file.name,
        filePath: path,
        uploadedAt: new Date().toISOString(),
      };

      const finalIds = new Set(optimisticIds);
      finalIds.add(docId);
      setUploadedIds(finalIds);
      onUploadedChange?.(finalIds);

      const finalArray = [...prevLocal.filter(d => d.documentId !== docId), finalDoc];
      setLocalUploadedDocs(finalArray);
      onUploadComplete?.(finalArray);

      toast.success("Document uploaded");
    } catch (err: any) {
      console.error("Upload error:", err);
      // revert optimistic state
      setUploadedIds(prevUploadedIds);
      setLocalUploadedDocs(prevLocal);
      onUploadedChange?.(prevUploadedIds);
      onUploadComplete?.(prevLocal);
      const msg = err?.message || "Upload failed";
      toast.error(msg);
    } finally {
      setUploadingId(null);
      if (inputRef.current) inputRef.current.value = "";
      if (inputRef.current) delete inputRef.current.dataset.docId;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Documents</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {exceedsCashLimit && (
          <div className="text-sm text-yellow-700">
            Mandatory for transactions above USD 3,000
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          hidden
          onChange={onChange}
        />

        {docs.map((doc) => (
          <div key={doc.id} className={`flex justify-between items-center border p-3 rounded transition-all ${uploadedIds.has(doc.id) ? 'bg-green-50 border-green-300' : ''
            }`}>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{doc.label}</span>
                {doc.required && <Badge variant="outline">Required</Badge>}
              </div>
              <div className="mt-1">
                <SampleDocumentLink
                  documentId={doc.id}
                  documentLabel={doc.label}
                  sampleDocUrl={getSampleDocumentUrl(doc.id)}
                  className="text-xs"
                  variant="link"
                />
              </div>
            </div>

            {uploadedIds.has(doc.id) ? (
              <div className="flex items-center gap-2 text-green-600 ml-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Uploaded</span>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => trigger(doc.id)}
                disabled={uploadingId === doc.id}
                className="ml-2"
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