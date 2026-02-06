import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Image as ImageIcon,
  Download,
  ExternalLink,
  Eye,
  Loader2,
  Calendar,
  FolderOpen,
} from "lucide-react";
import { format } from "date-fns";

interface DocumentFile {
  name: string;
  path: string;
  size?: number;
  created_at?: string;
  type?: string;
  documentType?: string;
  heuristicMatch?: boolean;
}

interface DocumentViewerProps {
  userId: string;
  serviceType?: "kyc" | "currency_exchange" | "remittance" | "forex_card" | "education_loan" | "all";
  orderId?: string;
  orderDate?: string; // For smart fallback matching
  transactionId?: string;
  compact?: boolean;
}

export function DocumentViewer({
  userId,
  serviceType = "all",
  orderId,
  orderDate,
  transactionId,
  compact = false,
}: DocumentViewerProps) {
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewFileName, setPreviewFileName] = useState("");

  // All documents are stored in kyc-documents bucket
  const getBucketName = (): string => {
    return "kyc-documents";
  };

  useEffect(() => {
    fetchDocuments();
  }, [userId, serviceType, orderId, orderDate]);

  const fetchDocuments = async () => {
    setLoading(true);
    const allDocs: DocumentFile[] = [];

    try {
      // STRATEGY:
      // 1. Try to find documents in the database linked to this order/service (Strict Match)
      // 2. If nothing found in DB, try "Smart Fallback" using Time Window matching (Heuristic Match)
      // 3. Last resort: Do NOT show random user files (avoids clutter)

      let dbDocs: any[] = [];
      let dbError = null;

      // Only query DB if we have a userId
      if (userId) {
        let query = (supabase as any)
          .from("kyc_documents")
          .select("*")
          .eq("user_id", userId);

        // Filter by orderId if provided
        if (orderId) {
          query = query.eq("order_id", orderId);
        }

        // Filter by service type if relevant
        if (serviceType !== "all" && serviceType !== "kyc") {
          query = query.eq("service_type", serviceType);
        }

        const result = await query;
        dbDocs = result.data || [];
        dbError = result.error;
      }

      const foundInDb = dbDocs.length > 0;

      if (!dbError && foundInDb) {
        // Found in DB
        for (const doc of dbDocs) {
          // Determine file name from storage path or document type
          const fileName = doc.storage_path?.split("/").pop() || `${doc.document_type}.pdf`;

          allDocs.push({
            name: fileName,
            path: `${doc.storage_bucket}/${doc.storage_path}`,
            created_at: doc.created_at,
            type: doc.service_type ? doc.service_type.replace(/_/g, " ").toUpperCase() : "DOCUMENT",
            documentType: doc.document_type,
          });
        }
      }

      // Smart Fallback: If no strict DB match, checks for Orphaned Files in Storage matching the Order Date
      if (!foundInDb && orderId && orderDate) {
        const bucketName = getBucketName();
        // Pattern: userId/serviceType/filename
        const basePath = (serviceType === "all" || serviceType === "kyc")
          ? userId
          : `${userId}/${serviceType}`;

        const { data: storageFiles, error: storageError } = await supabase.storage
          .from(bucketName)
          .list(basePath);

        if (!storageError && storageFiles && storageFiles.length > 0) {
          const orderTime = new Date(orderDate).getTime();
          // Window: 15 minutes (strict window to catch uploads done immediately during order creation)
          const TIME_WINDOW_MS = 15 * 60 * 1000;

          const validFiles = storageFiles.filter(f => {
            if (f.name === ".emptyFolderPlaceholder" || !f.metadata?.size) return false;

            // Check time proximity
            const fileTime = new Date(f.created_at).getTime();
            const diff = Math.abs(fileTime - orderTime);
            return diff <= TIME_WINDOW_MS;
          });

          for (const file of validFiles) {
            allDocs.push({
              name: file.name,
              path: `${bucketName}/${basePath}/${file.name}`,
              size: file.metadata?.size,
              created_at: file.created_at,
              type: serviceType === "all" ? "LEGACY" : serviceType.toUpperCase(),
              documentType: file.name,
              heuristicMatch: true
            });
          }
        }
      }

      setDocuments(allDocs);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.toLowerCase().split(".").pop();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) {
      return <ImageIcon className="h-4 w-4 text-blue-500" />;
    }
    return <FileText className="h-4 w-4 text-red-500" />;
  };


  const handlePreview = async (doc: DocumentFile) => {
    // For private buckets, we need to use signed URLs
    const [bucket, ...rest] = doc.path.split("/");
    const filePath = rest.join("/");

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) {
      console.error("Error creating signed URL:", error);
      return;
    }

    if (data?.signedUrl) {
      setPreviewUrl(data.signedUrl);
      setPreviewFileName(doc.name);
      setPreviewDialogOpen(true);
    }
  };

  const handleDownload = async (doc: DocumentFile) => {
    const [bucket, ...rest] = doc.path.split("/");
    const filePath = rest.join("/");
    const { data, error } = await supabase.storage.from(bucket).download(filePath);

    if (error) {
      console.error("Error downloading file:", error);
      return;
    }

    if (data) {
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const isImage = (fileName: string) => {
    const ext = fileName.toLowerCase().split(".").pop();
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No documents uploaded for this order</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {documents.map((doc, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {getFileIcon(doc.name)}
              <span className="text-sm truncate">{doc.documentType || doc.name}</span>
              <Badge variant="outline" className="text-xs shrink-0">{doc.type}</Badge>
              {doc.heuristicMatch && (
                <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 shrink-0">
                  Probable
                </Badge>
              )}
            </div>
            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handlePreview(doc)}>
                <Eye className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDownload(doc)}>
                <Download className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}

        <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getFileIcon(previewFileName)}
                {previewFileName}
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center">
              {previewUrl && isImage(previewFileName) ? (
                <img src={previewUrl} alt={previewFileName} className="max-h-[70vh] object-contain" />
              ) : (
                <iframe src={previewUrl || ""} className="w-full h-[70vh]" title={previewFileName} />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FolderOpen className="h-4 w-4" />
          Uploaded Documents ({documents.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {documents.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {getFileIcon(doc.name)}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{doc.documentType || doc.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">{doc.type}</Badge>
                      {doc.heuristicMatch && (
                        <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200">
                          Probable Match
                        </Badge>
                      )}
                      {doc.created_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(doc.created_at), "dd MMM yyyy")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => handlePreview(doc)}>
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDownload(doc)}>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getFileIcon(previewFileName)}
                {previewFileName}
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center">
              {previewUrl && isImage(previewFileName) ? (
                <img src={previewUrl} alt={previewFileName} className="max-h-[70vh] object-contain" />
              ) : (
                <iframe src={previewUrl || ""} className="w-full h-[70vh]" title={previewFileName} />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
