# Sample Documents Integration - Implementation Summary

## Overview
This implementation integrates sample documents from `public/sample-docs` with the document upload components throughout the application. Users can now click on a "View sample document" link next to each required document to see what kind of document they need to upload, complying with RBI guidelines.

## What Was Implemented

### 1. Sample Documents Configuration
**File:** [src/config/sampleDocuments.ts](src/config/sampleDocuments.ts)

- Maps document IDs (passport, visa, ticket, etc.) to their sample file paths in `public/sample-docs`
- Provides utility functions:
  - `getSampleDocumentUrl(documentId)` - Get the sample document URL for a document type
  - `hasSampleDocument(documentId)` - Check if a sample is available
- Currently maps to existing sample documents:
  - Passport (front and back)
  - Visa
  - Air ticket & Return ticket
  - PAN card
  - Placeholders for education, medical, employment documents (can be updated when files are added)

### 2. Sample Document Link Component
**File:** [src/components/shared/SampleDocumentLink.tsx](src/components/shared/SampleDocumentLink.tsx)

A reusable React component that:
- Displays a clickable link/button to view sample documents
- Opens a modal/dialog displaying the sample document
- Handles both PDF and image files
- Provides download and "open in new tab" options
- Supports two variants: `link` (default) and `button`
- Returns null if no sample document is available for that type

Features:
- **Modal Viewer**: Opens a full-screen dialog with the sample document
- **PDF Support**: Uses embedded `<embed>` tag for PDF display
- **Image Support**: Displays images directly
- **Download Option**: Users can download the sample document
- **Responsive**: Works on all screen sizes

### 3. Integration with DocumentUpload Component
**File:** [src/components/shared/DocumentUpload.tsx](src/components/shared/DocumentUpload.tsx)

Updated to:
- Import `SampleDocumentLink` and `getSampleDocumentUrl`
- Display the sample document link below each document label
- Show sample link with document name for context
- Maintains all existing upload functionality

Changes:
- Added sample document link display for each document
- Improved layout to accommodate the new link
- Links only appear if a sample document is available

### 4. Integration with DocumentUploadCard Component
**File:** [src/components/remittance/DocumentUploadCard.tsx](src/components/remittance/DocumentUploadCard.tsx)

Updated to:
- Import `SampleDocumentLink` and `getSampleDocumentUrl`
- Display the sample document link in the document header section
- Maintains backward compatibility with existing `sampleDocUrl` prop
- Works seamlessly with remittance document uploads

## How It Works

### User Flow

1. **User navigates to document upload section** (Currency Exchange, Remittance, Forex Cards, etc.)
2. **Sample document link appears** next to each required document
3. **User clicks "View sample document"** link
4. **Modal opens** showing the sample document
5. **User can**:
   - View the document in the modal
   - Download it to their device
   - Open it in a new tab (for PDFs)
   - Close the modal to proceed with uploading
6. **User uploads their own document** based on what they saw in the sample

### Document Mapping

The mapping in `sampleDocuments.ts` handles multiple aliases for the same document:
- `passport`, `passport_front`, `passport_back`
- `visa`, `visa_schengen`, `medical_visa`, `work_visa`, `business_visa`, `pr_visa`
- `ticket`, `air_ticket`, `flight_ticket`, `return_ticket`, `travel_tickets`
- And more...

This ensures that different parts of the application using different document IDs will still find the correct sample.

## File Structure

```
src/
├── config/
│   └── sampleDocuments.ts           # Configuration mapping document IDs to samples
├── components/
│   ├── shared/
│   │   ├── SampleDocumentLink.tsx   # NEW: Sample document viewer component
│   │   └── DocumentUpload.tsx       # UPDATED: Integrated sample links
│   └── remittance/
│       └── DocumentUploadCard.tsx   # UPDATED: Integrated sample links
└── public/
    └── sample-docs/
        ├── passport front.pdf
        ├── _Passport_ Back Side.pdf
        ├── Visa-1.pdf
        ├── Air ticket-2.pdf
        ├── Return Ticket.pdf
        └── Pan-2.pdf
```

## Future Enhancements

1. **Add more sample documents**: As more sample files are added to `public/sample-docs`, simply add them to the mapping in `sampleDocuments.ts`

2. **Document type validation**: Could be enhanced to validate uploaded documents match the sample format

3. **Multi-language support**: Could add localized sample document descriptions

4. **Document quality feedback**: Could provide user feedback if uploaded document quality doesn't match sample

5. **Automated sample detection**: Could auto-generate the mapping by scanning the `public/sample-docs` directory

## Components Using Sample Documents

These components now have sample document support:

1. ✅ [src/components/shared/DocumentUpload.tsx](src/components/shared/DocumentUpload.tsx) - Main document upload component
   - Used by: Currency Exchange, Remittance, Forex Cards flows

2. ✅ [src/components/remittance/DocumentUploadCard.tsx](src/components/remittance/DocumentUploadCard.tsx) - Remittance document card
   - Used by: Remittance flows with individual document cards

## Testing

To test the implementation:

1. Navigate to any document upload flow (e.g., Currency Exchange > Add Purpose > Upload Documents)
2. Look for "View sample document" links next to required documents
3. Click on any sample link to see the modal with the sample document
4. Try downloading or opening in new tab (for PDFs)
5. Upload your own document based on the sample shown

## RBI Compliance

This implementation helps meet RBI Know Your Customer (KYC) guidelines by:
- Providing clear examples of required documents to users
- Reducing upload failures due to incorrect/unclear document submission
- Improving first-time success rate of document verification
- Making the process more transparent and user-friendly

## Notes

- Sample documents must be added to `public/sample-docs/` directory
- Currently mapped samples are:
  - Passport (front & back)
  - Visa
  - Air tickets & Return tickets
  - PAN card
- Additional samples can be added as needed
- The component gracefully handles missing sample documents (shows nothing)
