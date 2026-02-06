# Sample Documents Implementation - Developer Guide

## Architecture Overview

The sample documents feature is built with a modular, reusable architecture:

```
┌─────────────────────────────────────────────────────────┐
│         Upload Components (multiple locations)          │
│  - DocumentUpload (shared)                              │
│  - DocumentUploadCard (remittance)                       │
│  - Other custom upload components                       │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │ SampleDocumentLink │  (Reusable Component)
        │   Component        │
        └────────┬───────────┘
                 │
                 ├─► Modal Dialog
                 │   - PDF Viewer
                 │   - Image Viewer
                 │   - Download/Open options
                 │
                 └─► Configuration
                     └─ getSampleDocumentUrl()
                        └ SAMPLE_DOCUMENTS mapping
```

## File Structure & Responsibilities

### 1. Configuration Layer
**File:** `src/config/sampleDocuments.ts`

**Responsibilities:**
- Centralized mapping of document IDs to sample file paths
- Export utility functions for accessing sample documents
- Single source of truth for document paths

**Key Functions:**
```typescript
// Get URL for a specific document type
getSampleDocumentUrl(documentId: string): string | null

// Check if sample exists for document type
hasSampleDocument(documentId: string): boolean
```

**Key Data:**
```typescript
// Mapping structure
SAMPLE_DOCUMENTS: Record<string, string> = {
  documentId: "/sample-docs/filename.pdf"
}
```

### 2. UI Component Layer
**File:** `src/components/shared/SampleDocumentLink.tsx`

**Responsibilities:**
- Render clickable link/button for viewing samples
- Manage modal state
- Handle document display (PDF/images)
- Provide download/open functionality

**Key Features:**
- Two variants: link (default) and button
- Auto-detects PDF vs image
- Responsive modal
- Handles missing samples gracefully

**Component Props:**
```typescript
interface SampleDocumentLinkProps {
  documentId: string;           // Unique identifier
  documentLabel: string;        // Display name
  sampleDocUrl: string | null;  // URL from config
  className?: string;           // Optional CSS classes
  variant?: 'link' | 'button';  // Display variant
}
```

### 3. Integration Layer
**Files:** 
- `src/components/shared/DocumentUpload.tsx`
- `src/components/remittance/DocumentUploadCard.tsx`

**Responsibilities:**
- Integrate `SampleDocumentLink` into upload flows
- Fetch sample URLs from config
- Pass document metadata to link component

**Integration Pattern:**
```typescript
import { SampleDocumentLink } from './SampleDocumentLink';
import { getSampleDocumentUrl } from '@/config/sampleDocuments';

// Inside component render
<SampleDocumentLink
  documentId={doc.id}
  documentLabel={doc.label}
  sampleDocUrl={getSampleDocumentUrl(doc.id)}
  variant="link"
/>
```

## Data Flow

### Component Initialization
```
1. Upload component mounts
2. Component receives array of required documents
3. For each document, renders document row with upload button
4. Also renders SampleDocumentLink with document metadata
5. SampleDocumentLink fetches sample URL from config
6. Link appears only if sample URL is available
```

### User Interaction - View Sample
```
1. User clicks "View sample document" link
2. SampleDocumentLink state changes (isOpen = true)
3. Modal dialog renders
4. PDF/Image URL is loaded into viewer
5. Modal displays with document visible
6. User can download or open in new tab
7. User closes modal, returns to upload form
```

### User Interaction - Upload Document
```
1. User clicks "Upload" button next to document
2. File input click event triggered
3. File selection dialog opens
4. User selects file
5. File validation (size, type)
6. File uploaded to Supabase storage
7. Upload status reflected in UI
```

## Key Design Decisions

### 1. Mapping-Based Architecture
**Decision:** Use a configuration object to map document IDs to URLs

**Rationale:**
- Single source of truth
- Easy to add/remove/update samples
- No database queries needed
- Fast access (object lookup)
- Works at build time

**Alternative Considered:**
- Database lookup (rejected: unnecessary complexity)
- Dynamic file scanning (rejected: build time overhead)

### 2. Reusable Component
**Decision:** Create separate `SampleDocumentLink` component

**Rationale:**
- Used in multiple places (DocumentUpload, DocumentUploadCard)
- Encapsulates modal logic
- Consistent UX across application
- Easy to test and maintain

**Alternative Considered:**
- Inline modal code (rejected: code duplication)
- Single prop-based variant (rejected: less flexible)

### 3. Graceful Degradation
**Decision:** Return `null` if no sample available

**Rationale:**
- Doesn't break UI if sample is missing
- Supports gradual addition of samples
- Works with placeholder mappings

**Alternative Considered:**
- Show error message (rejected: confuses users)
- Always render (rejected: bad UX with missing files)

## Extending the Feature

### Adding a New Sample Document

**Step 1: Add the file to `public/sample-docs/`**
```
File name: my-document.pdf
Full path: public/sample-docs/my-document.pdf
```

**Step 2: Update the mapping**
```typescript
// src/config/sampleDocuments.ts
export const SAMPLE_DOCUMENTS: Record<string, string> = {
  // ... existing
  my_document: "/sample-docs/my-document.pdf",
  my_doc_alias: "/sample-docs/my-document.pdf", // aliases
};
```

**Step 3: Use in component**
- Automatic! The upload component will detect and show the link

### Adding Multiple File Formats

The component auto-detects file type:

```typescript
const isPdf = sampleDocUrl.toLowerCase().endsWith('.pdf');

// Renders appropriate viewer based on type
if (isPdf) {
  // Use <embed> for PDFs
} else {
  // Use <img> for images
}
```

To support new formats:

```typescript
// Add to SampleDocumentLink.tsx
const isPdf = url.toLowerCase().endsWith('.pdf');
const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
const isWord = url.toLowerCase().endsWith('.docx');

// Add conditional rendering for new type
if (isWord) {
  return <WordViewer url={url} />;
}
```

### Customizing the Modal

Modify `SampleDocumentModal` component:

```typescript
function SampleDocumentModal({ isOpen, onOpenChange, ... }) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {/* Customize size, styling, buttons, etc. */}
      <DialogContent className="custom-size">
        {/* Custom UI */}
      </DialogContent>
    </Dialog>
  );
}
```

### Adding Analytics

Track when users view samples:

```typescript
// In SampleDocumentLink.tsx
const handleOpenModal = () => {
  // Analytics event
  trackEvent('sample_document_viewed', {
    documentId,
    documentLabel,
  });
  setIsOpen(true);
};
```

## Testing Strategy

### Unit Tests

```typescript
describe('SampleDocumentLink', () => {
  // Test rendering when sample available
  test('renders link when sample available', () => {
    render(
      <SampleDocumentLink
        documentId="passport"
        documentLabel="Passport"
        sampleDocUrl="/sample-docs/passport.pdf"
      />
    );
    expect(screen.getByText('View sample document')).toBeInTheDocument();
  });

  // Test rendering when sample unavailable
  test('returns null when no sample', () => {
    const { container } = render(
      <SampleDocumentLink
        documentId="unknown"
        documentLabel="Unknown"
        sampleDocUrl={null}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  // Test modal opens on click
  test('opens modal on click', async () => {
    render(
      <SampleDocumentLink
        documentId="passport"
        documentLabel="Passport"
        sampleDocUrl="/sample-docs/passport.pdf"
      />
    );
    fireEvent.click(screen.getByText('View sample document'));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
describe('DocumentUpload with Samples', () => {
  test('shows sample link for mapped documents', () => {
    render(
      <DocumentUpload
        documents={[
          { id: 'passport', label: 'Passport', required: true }
        ]}
        userId="123"
        serviceType="currency_exchange"
      />
    );
    expect(screen.getByText('View sample document')).toBeInTheDocument();
  });

  test('sample link missing for unmapped documents', () => {
    render(
      <DocumentUpload
        documents={[
          { id: 'unknown_doc', label: 'Unknown', required: false }
        ]}
        userId="123"
        serviceType="currency_exchange"
      />
    );
    expect(screen.queryByText('View sample document')).not.toBeInTheDocument();
  });
});
```

## Performance Considerations

### 1. Lazy Loading
- Modal content only loaded when opened
- PDF viewer embedded on-demand
- Reduces initial page load impact

### 2. File Size
- Keep sample files small (< 500KB)
- Compress PDFs using tools like: `gs -sDEVICE=pdfwrite -dNOPAUSE -dBATCH -dSAFER -r150 -sOutputFile=output.pdf input.pdf`
- Use optimized image formats (WEBP preferred)

### 3. Caching
- Browser caches sample files
- URLs are static (no parameters)
- PDF.js viewer caches rendered pages

## Browser Compatibility

### PDF Viewing
- ✅ Native PDF support: Chrome, Firefox, Edge, Safari (latest)
- ⚠️ Older browsers: May need pdf.js library
- 📱 Mobile: Works but may need full-screen for PDFs

### Image Display
- ✅ All browsers support standard image formats
- 📱 Mobile optimized with responsive sizing

### Modal Dialog
- Uses shadcn/ui Dialog component
- Fully supported across modern browsers
- Falls back gracefully on older browsers

## Security Considerations

### 1. File Access
- Sample files are in `public/` directory
- Already accessible to anyone visiting site
- No sensitive data in samples
- No special permissions needed

### 2. URL Validation
- URLs are statically defined in code
- No user input in file paths
- Safe from path traversal attacks

### 3. Download Security
- Files downloaded directly from server
- Browser's built-in download security applies
- No scripts executed

## Monitoring & Debugging

### Debug Mode

```typescript
// In SampleDocumentLink.tsx
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('SampleDocumentLink:', { documentId, sampleDocUrl });
}
```

### Error Handling

```typescript
// Add error boundary in modal
try {
  // Load PDF
} catch (error) {
  console.error('Failed to load sample:', error);
  return <ErrorMessage error={error} />;
}
```

### Logging

```typescript
// Track document views
if (DEBUG) {
  console.log(`Sample opened: ${documentLabel} (${documentId})`);
}
```

## Migration Guide

If migrating from a different sample document system:

1. **Identify all document types in use**
2. **Create mapping in `sampleDocuments.ts`**
3. **Replace old sample links with new component**
4. **Update import statements**
5. **Test all upload flows**
6. **Deploy and monitor**

## Maintenance Checklist

- [ ] Review sample document mappings quarterly
- [ ] Update samples when requirements change
- [ ] Monitor file sizes and optimize if needed
- [ ] Test on multiple browsers/devices
- [ ] Check links are working (no 404s)
- [ ] Gather user feedback on usability
- [ ] Update documentation as features evolve

## References

- Component: `SampleDocumentLink.tsx`
- Configuration: `sampleDocuments.ts`
- Integration points: `DocumentUpload.tsx`, `DocumentUploadCard.tsx`
- Sample files location: `public/sample-docs/`
- UI framework: shadcn/ui
- Dialog component: shadcn/ui Dialog
