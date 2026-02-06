# Sample Documents Feature - User Guide

## Quick Start

The sample documents feature allows users to view example documents before uploading their own. This helps ensure they understand what kind of document is needed.

## Where to Find Sample Documents

Sample documents appear in two main locations:

### 1. **Currency Exchange Flows**
- Path: CurrencyExchange → Select Purpose → Upload Documents
- Available in: Step3EligibilityCheck and PurposeSelection components

### 2. **Remittance Flows**
- Path: Remittance → Upload Documents section
- Available in: RemittanceDocumentUpload and DocumentUploadCard components

### 3. **Forex Cards**
- Path: Forex Cards → Apply → Upload Documents

### 4. **Education Loans**
- Path: Education Loan → Apply → Upload Documents

## How to Use

### Viewing a Sample Document

1. **Look for the "View sample document" link**
   - Appears below each required document name
   - In blue text with a file icon

2. **Click the link**
   - A modal dialog will open showing the sample

3. **View the document**
   - For PDFs: See the embedded PDF viewer
   - For Images: See the image displayed
   - Scroll through multi-page PDFs as needed

4. **Additional options**
   - **Download Sample**: Save the sample to your device
   - **Open in New Tab**: View in full browser window (PDF only)
   - Click outside or close button to return to upload form

### Uploading Your Document

After viewing the sample:

1. **Note the document requirements** shown in the sample
2. **Prepare your document** to match the sample format
3. **Click "Upload" button** next to the document name
4. **Select your file** (PDF, JPG, PNG)
5. **Submit** for verification

## Sample Documents Available

| Document Type | Sample File | Status |
|---|---|---|
| Passport Front | passport front.pdf | ✅ Available |
| Passport Back | _Passport_ Back Side.pdf | ✅ Available |
| Visa | Visa-1.pdf | ✅ Available |
| Flight Ticket | Air ticket-2.pdf | ✅ Available |
| Return Ticket | Return Ticket.pdf | ✅ Available |
| PAN Card | Pan-2.pdf | ✅ Available |
| Other documents* | - | 📋 To be added |

*Admission letters, medical letters, offer letters, etc. can be added as needed.

## Document ID Mappings

The system automatically maps various document names to the correct sample:

### Travel Documents
- `passport` → Passport sample
- `visa` → Visa sample
- `ticket`, `air_ticket`, `flight_ticket` → Flight ticket sample
- `return_ticket` → Return ticket sample

### PAN & ID Documents
- `pan` → PAN card sample

### Education Documents
- `admission_letter` → (To be added)
- `i20_cas` → (To be added)

### Medical Documents
- `medical_visa` → Visa sample
- `hospital_letter` → (To be added)

### Employment Documents
- `work_visa` → Visa sample
- `offer_letter` → (To be added)

## Technical Details

### Component Structure

```
SampleDocumentLink Component
│
├── Props:
│   ├── documentId: string (e.g., "passport")
│   ├── documentLabel: string (e.g., "Passport")
│   ├── sampleDocUrl: string | null
│   ├── variant: "link" | "button" (default: "link")
│   └── className?: string
│
├── Functionality:
│   ├── Renders clickable link/button if sample available
│   └── Opens modal with document viewer on click
│
└── Modal Dialog:
    ├── Displays document (PDF or image)
    ├── Download button
    ├── Open in new tab button (PDFs only)
    └── Close button
```

### Usage in Components

**DocumentUpload Component:**
```tsx
<SampleDocumentLink
  documentId={doc.id}
  documentLabel={doc.label}
  sampleDocUrl={getSampleDocumentUrl(doc.id)}
  variant="link"
/>
```

**DocumentUploadCard Component:**
```tsx
<SampleDocumentLink
  documentId={documentType}
  documentLabel={documentName}
  sampleDocUrl={getSampleDocumentUrl(documentType)}
  variant="link"
/>
```

## Adding New Sample Documents

To add a new sample document:

1. **Add the file to `public/sample-docs/`**
   - File naming: Use clear, descriptive names
   - Format: PDF preferred for documents, but PNG/JPG also supported

2. **Update the mapping in `src/config/sampleDocuments.ts`**
   ```typescript
   export const SAMPLE_DOCUMENTS: Record<string, string> = {
     // ... existing mappings
     new_document_type: "/sample-docs/new-document.pdf",
   };
   ```

3. **Test the integration**
   - Navigate to the upload form
   - Look for the "View sample document" link
   - Click to verify it works

## RBI Compliance Notes

This feature helps comply with RBI KYC guidelines by:

✅ **Clarity**: Provides clear examples of required documents
✅ **Transparency**: Shows users exactly what's needed
✅ **User Support**: Reduces confusion and upload failures
✅ **Documentation**: Maintains audit trail with sample references
✅ **Quality**: Improves first-time document submission success rate

## Troubleshooting

### Sample document link not appearing
- Check if sample file exists in `public/sample-docs/`
- Verify document ID is in the mapping in `sampleDocuments.ts`
- Check browser console for errors

### Sample doesn't display in modal
- For PDFs: Ensure file is valid PDF
- For images: Ensure correct format (JPG, PNG)
- Check file path is correct and accessible

### Download/Open in new tab not working
- Ensure file has correct MIME type
- Check browser's CORS settings if not on same domain
- Try different browser if issue persists

## Browser Support

The sample documents feature works on:
- ✅ Chrome/Chromium (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

Note: PDF embedding requires browser support for `<embed>` tag and PDF.js or native PDF viewer.

## Future Improvements

Planned enhancements:
- 🔄 Multi-language sample descriptions
- 📊 Document quality metrics/feedback
- 🤖 Automatic document validation against sample
- 📱 Mobile-optimized PDF viewer
- 🎥 Video tutorials for each document type
