import { useState } from 'react';
import { Eye, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SampleDocumentLinkProps {
  documentId: string;
  documentLabel: string;
  sampleDocUrl: string | null;
  className?: string;
  variant?: 'link' | 'button';
}

export function SampleDocumentLink({
  documentId,
  documentLabel,
  sampleDocUrl,
  className = '',
  variant = 'link',
}: SampleDocumentLinkProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!sampleDocUrl) {
    return null;
  }

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  if (variant === 'button') {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenModal}
          className={className}
        >
          <Eye className="w-4 h-4 mr-1" />
          Sample
        </Button>
        <SampleDocumentModal
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          documentLabel={documentLabel}
          sampleDocUrl={sampleDocUrl}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleOpenModal}
        className={`text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 transition-colors ${className}`}
      >
        <FileText className="w-4 h-4" />
        View sample document
      </button>
      <SampleDocumentModal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        documentLabel={documentLabel}
        sampleDocUrl={sampleDocUrl}
      />
    </>
  );
}

interface SampleDocumentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  documentLabel: string;
  sampleDocUrl: string;
}

function SampleDocumentModal({
  isOpen,
  onOpenChange,
  documentLabel,
  sampleDocUrl,
}: SampleDocumentModalProps) {
  const isPdf = sampleDocUrl.toLowerCase().endsWith('.pdf');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Sample: {documentLabel}</DialogTitle>
          <DialogDescription>
            This is a sample of the {documentLabel.toLowerCase()} document. Please provide a similar document when uploading.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center gap-4 py-4">
          {isPdf ? (
            <div className="w-full h-[70vh]">
              <embed
                src={sampleDocUrl}
                type="application/pdf"
                width="100%"
                height="100%"
                className="rounded-lg"
              />
            </div>
          ) : (
            <div className="w-full flex items-center justify-center">
              <img
                src={sampleDocUrl}
                alt={`Sample ${documentLabel}`}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          )}

          <div className="flex gap-2 w-full justify-center">
            <a
              href={sampleDocUrl}
              download
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              Download Sample
            </a>
            {isPdf && (
              <a
                href={sampleDocUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                Open in New Tab
              </a>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
