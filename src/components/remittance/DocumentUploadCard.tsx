import { useState } from 'react';
import { Upload, CheckCircle, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SampleDocumentLink } from '@/components/shared/SampleDocumentLink';
import { getSampleDocumentUrl } from '@/config/sampleDocuments';

interface DocumentUploadCardProps {
  documentType: string;
  documentName: string;
  description?: string;
  isRequired: boolean;
  sampleDocUrl?: string;
  onUploadComplete: (documentType: string, file: File, storagePath: string) => void;
  userId: string;
}

export function DocumentUploadCard({
  documentType,
  documentName,
  description,
  isRequired,
  sampleDocUrl,
  onUploadComplete,
  userId
}: DocumentUploadCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Only PDF, JPG, and PNG files are allowed');
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${documentType}_${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('kyc-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
  .from('kyc_documents')
  .insert({
    user_id: userId,
    document_type: documentType,
    storage_path: filePath,
    storage_bucket: 'kyc-documents', // ✅ REQUIRED
    service_type: 'currency_exchange', // ✅ FIXED
    status: 'pending',
  });

      if (dbError) throw dbError;

      setUploaded(true);
      toast.success(`${documentName} uploaded successfully!`);
      
      // Callback to parent
      onUploadComplete(documentType, file, filePath);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setUploaded(false);
  };

  return (
    <div className={`
      relative border-2 rounded-lg p-4 transition-all
      ${uploaded ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200 hover:border-blue-300'}
      ${isRequired ? 'border-l-4 border-l-red-400' : ''}
    `}>
      {isRequired && (
        <span className="absolute top-2 right-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
          Required
        </span>
      )}

      <div className="flex items-start gap-3 mb-3">
        <FileText className="w-5 h-5 text-gray-600 mt-1" />
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{documentName}</h4>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
          <div className="mt-2">
            <SampleDocumentLink
              documentId={documentType}
              documentLabel={documentName}
              sampleDocUrl={getSampleDocumentUrl(documentType)}
              className="text-xs"
              variant="link"
            />
          </div>
        </div>
      </div>

      {/* Sample document link (legacy - can be removed if using SampleDocumentLink above) */}
      {sampleDocUrl && (
        <a
          href={sampleDocUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-3"
        >
          <ExternalLink className="w-4 h-4" />
          View sample document
        </a>
      )}

      {/* Upload area */}
      {!uploaded ? (
        <div>
          {!file ? (
            <label className="block">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PDF, JPG, PNG (max 5MB)
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
              />
            </label>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-700 truncate flex-1">
                  {file.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  type="button"
                >
                  ×
                </Button>
              </div>
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full"
                type="button"
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-sm text-green-700 font-medium">
            Uploaded successfully
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="ml-auto"
            type="button"
          >
            Replace
          </Button>
        </div>
      )}
    </div>
  );
}