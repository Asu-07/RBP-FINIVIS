# Sample Documents Feature - Visual Architecture Diagram

## User Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER JOURNEY                             │
└─────────────────────────────────────────────────────────────────┘

START: User visits document upload page
   │
   ▼
┌──────────────────────────────────────┐
│  Document Upload Section Loads       │
│  ├─ Passport (Required)              │
│  ├─ Visa (Optional)                  │
│  ├─ Flight Ticket (Required)         │
│  └─ ...                              │
└──────────────────────────────────────┘
   │
   ▼
┌──────────────────────────────────────┐
│  Sample Links Appear                 │
│  "View sample document" ← CLICK HERE │
│  (appears for each document)         │
└──────────────────────────────────────┘
   │
   ▼
┌──────────────────────────────────────┐
│  Modal Opens with Sample             │
│  ┌────────────────────────────────┐  │
│  │                                │  │
│  │  Sample: Passport              │  │
│  │  ┌──────────────────────────┐  │  │
│  │  │                          │  │  │
│  │  │   [PDF/Image Viewer]     │  │  │
│  │  │   Shows sample document  │  │  │
│  │  │                          │  │  │
│  │  │   Download | Open in Tab │  │  │
│  │  └──────────────────────────┘  │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
   │
   ├─ User Studies Sample
   │
   ├─ User Closes Modal
   │
   ▼
┌──────────────────────────────────────┐
│  Upload Own Document                 │
│  Click "Upload" button               │
│  Select file from device             │
│  ▼                                   │
│ [File Upload Progress]               │
│  ▼                                   │
│ ✓ Uploaded Successfully              │
└──────────────────────────────────────┘
   │
   ▼
COMPLETE: Document submitted for verification
```

## Component Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│              APPLICATION ARCHITECTURE                           │
└─────────────────────────────────────────────────────────────────┘

LAYER 1: PAGE LEVEL
├─ CurrencyExchange.tsx
├─ Remittance.tsx
├─ ForexCardApply.tsx
├─ EducationLoanApply.tsx
└─ ... (other pages)

   │
   ▼ (uses component)

LAYER 2: COMPONENT LEVEL
├─ DocumentUpload.tsx (shared)
│  └─ Used by: Currency Exchange, Remittance, Forex Cards
│
├─ DocumentUploadCard.tsx (remittance)
│  └─ Used by: Remittance (individual cards)
│
└─ ... (other custom upload components)

   │
   ▼ (calls)

LAYER 3: UI COMPONENT
└─ SampleDocumentLink.tsx (reusable)
   ├─ Props: documentId, documentLabel, sampleDocUrl, variant
   ├─ Renders: Link or Button
   ├─ On Click: Opens Modal
   │
   └─ Modal Content
      ├─ For PDF: PDF Viewer (<embed>)
      ├─ For Images: Image Viewer (<img>)
      ├─ Download Button
      ├─ Open in Tab Button (PDF)
      └─ Close Button

   │
   ▼ (references)

LAYER 4: CONFIGURATION
└─ sampleDocuments.ts
   ├─ SAMPLE_DOCUMENTS: Record<string, string>
   │  └─ Mapping: documentId → filePath
   │
   └─ Utility Functions
      ├─ getSampleDocumentUrl(documentId)
      └─ hasSampleDocument(documentId)

   │
   ▼ (loads from)

LAYER 5: ASSETS
└─ public/sample-docs/
   ├─ passport front.pdf
   ├─ _Passport_ Back Side.pdf
   ├─ Visa-1.pdf
   ├─ Air ticket-2.pdf
   ├─ Return Ticket.pdf
   └─ Pan-2.pdf
```

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                  DATA FLOW SEQUENCE                              │
└──────────────────────────────────────────────────────────────────┘

[1] Component Initialization
    ├─ Upload Component mounts
    │  └─ Receives documents array
    │     └─ [{ id: "passport", label: "Passport", required: true }]
    │
    └─ For each document:
       └─ Render: SampleDocumentLink component
          └─ Pass: documentId, documentLabel
             └─ Call: getSampleDocumentUrl(documentId)
                └─ Lookup: SAMPLE_DOCUMENTS[documentId]
                   └─ Return: URL or null
                      └─ If URL: Show link
                         If null: Show nothing


[2] User Clicks Sample Link
    ├─ SampleDocumentLink onClick handler fires
    │  └─ setIsOpen(true)
    │     └─ Modal state updates
    │        └─ Modal renders
    │
    └─ Modal Component
       ├─ Check if PDF
       │  └─ Use <embed src={sampleDocUrl} type="application/pdf" />
       │
       └─ Check if Image
          └─ Use <img src={sampleDocUrl} alt="..." />
             └─ Render in modal dialog


[3] User Downloads Sample
    ├─ Click "Download Sample" button
    │  └─ Browser download initiated
    │     └─ File: /sample-docs/passport front.pdf
    │        └─ Saved to: Downloads folder


[4] User Opens in New Tab (PDF only)
    ├─ Click "Open in New Tab" button
    │  └─ window.open(sampleDocUrl, '_blank')
    │     └─ New tab opens with PDF viewer
    │        └─ Browser's native PDF viewer


[5] User Closes Modal
    ├─ Click X or outside modal
    │  └─ setIsOpen(false)
    │     └─ Modal closes
    │        └─ Back to upload form


[6] User Uploads Document
    ├─ Click "Upload" button
    │  └─ File input triggered
    │     └─ User selects file
    │        └─ File validation
    │           └─ Upload to Supabase
    │              └─ Database record created
    │                 └─ Success message
```

## File Mapping Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│              DOCUMENT ID TO FILE MAPPING                         │
└──────────────────────────────────────────────────────────────────┘

CATEGORY: TRAVEL DOCUMENTS
├─ ID: passport
├─ Aliases: passport_front
└─ File: /sample-docs/passport front.pdf

CATEGORY: PASSPORT (BACK)
├─ ID: passport_back
└─ File: /sample-docs/_Passport_ Back Side.pdf

CATEGORY: VISA DOCUMENTS
├─ IDs: visa, visa_schengen, medical_visa, work_visa, 
│        business_visa, pr_visa
└─ File: /sample-docs/Visa-1.pdf

CATEGORY: TICKETS
├─ Flight Ticket
│  ├─ IDs: ticket, air_ticket, flight_ticket, travel_tickets
│  └─ File: /sample-docs/Air ticket-2.pdf
│
└─ Return Ticket
   ├─ IDs: return_ticket
   └─ File: /sample-docs/Return Ticket.pdf

CATEGORY: BANKING/FINANCIAL
├─ ID: pan
└─ File: /sample-docs/Pan-2.pdf

CATEGORY: TO BE ADDED
├─ admission_letter → (awaiting file)
├─ i20_cas → (awaiting file)
├─ fee_invoice → (awaiting file)
├─ medical_letter → (awaiting file)
├─ hospital_letter → (awaiting file)
├─ offer_letter → (awaiting file)
├─ relationship_proof → (awaiting file)
├─ beneficiary_id → (awaiting file)
└─ ... (and more)
```

## Integration Points Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│          WHERE SAMPLE DOCUMENTS APPEAR                           │
└──────────────────────────────────────────────────────────────────┘

APPLICATION FLOWS:

┌─────────────────────────────┐
│  CURRENCY EXCHANGE          │
├─────────────────────────────┤
│  ├─ PurposeSelection         │──┐
│  │  ├─ DocumentUpload        │  │
│  │  │  └─ SampleDocumentLink │  │ ✅ Integrated
│  │                            │  │
│  └─ Step3EligibilityCheck    │  │
│     ├─ DocumentUpload        │──┤
│     └─ SampleDocumentLink    │  │
└─────────────────────────────┘  │
                                  │
┌─────────────────────────────┐  │
│  REMITTANCE                 │  │
├─────────────────────────────┤  │
│  ├─ RemittancePurposeSelect │  │
│  │                            │  │
│  ├─ RemittanceDocumentUpload │──┤
│  │  ├─ DocumentUpload        │  │ ✅ Integrated
│  │  │  └─ SampleDocumentLink │  │
│  │                            │  │
│  └─ DocumentUploadCard       │  │
│     └─ SampleDocumentLink    │──┤
│                               │  │
└─────────────────────────────┘  │
                                  │
┌─────────────────────────────┐  │
│  FOREX CARDS                │  │
├─────────────────────────────┤  │
│  ├─ ForexCardApply          │  │
│  │  └─ DocumentUpload       │  │ ✅ Integrated
│  │     └─ SampleDocumentLink│──┤
│  │                            │  │
│  └─ ForexCards              │  │
│     └─ DocumentUpload       │──┤
│        └─ SampleDocumentLink│  │
│                               │  │
└─────────────────────────────┘  │
                                  │
┌─────────────────────────────┐  │
│  EDUCATION LOANS            │  │
├─────────────────────────────┤  │
│  ├─ EducationLoanApply      │  │
│  │  └─ [Custom Upload]      │──┤ ⚠️ May need integration
│  │     └─ SampleDocumentLink│  │
│  │                            │  │
│  └─ DocumentUpload          │──┘
│     └─ SampleDocumentLink    │ ✅ Integrated
│                               │
└─────────────────────────────┘

OTHER AREAS:
├─ Travel Insurance          ✅ Can use if integrated
├─ Loan Applications         ✅ Can use if integrated
├─ Admin Verification        ✅ Can use if integrated
└─ Any Custom Upload Needs   ✅ Available for integration
```

## Component Relationship Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│          COMPONENT DEPENDENCY GRAPH                              │
└──────────────────────────────────────────────────────────────────┘

                    SampleDocumentLink.tsx
                            │
                ┌───────────┬┴─────────┬──────────┐
                ▼           ▼           ▼          ▼
              Dialog     Button      lucide    (useState)
            (shadcn/ui) (shadcn/ui)  icons     (React)


                    DocumentUpload.tsx
                            │
              ┌─────────────┼──────────────┐
              ▼             ▼              ▼
        Card Component  SampleDocumentLink  supabase
        (shadcn/ui)         ▲           (storage)
                            │
                  getSampleDocumentUrl()
                            │
                            ▼
                   sampleDocuments.ts
                   (Configuration)


              DocumentUploadCard.tsx (Remittance)
                            │
              ┌─────────────┼──────────────┐
              ▼             ▼              ▼
           FileText    SampleDocumentLink supabase
          (lucide)         ▲           (storage)
                           │
                 getSampleDocumentUrl()
                           │
                           ▼
                  sampleDocuments.ts
                  (Configuration)


                   sampleDocuments.ts
                   (Central Config)
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
        SAMPLE_DOCUMENTS          Utility Functions
         (Mapping Object)    (getSampleDocumentUrl, etc)
                │
                ▼
        File Paths in /sample-docs/
```

## State Management Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│          COMPONENT STATE FLOW                                    │
└──────────────────────────────────────────────────────────────────┘

SampleDocumentLink Component State:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Initial State:
  isOpen = false  (Modal closed)

User Interaction:
  │
  ├─ Click Link
  │  └─ setIsOpen(true)
  │     ▼
  │  isOpen = true  (Modal opens)
  │  ├─ Render Modal Dialog
  │  ├─ Load PDF/Image
  │  │
  │  └─ User can:
  │     ├─ View document
  │     ├─ Download file
  │     ├─ Open in new tab
  │     │
  │     └─ Close modal
  │        ├─ setIsOpen(false)
  │        │  ▼
  │        │  isOpen = false  (Back to initial)
  │        │
  │        └─ Event: onClick, onEscape
  │
  └─ Component Unmounts
     └─ State cleaned up


DocumentUpload Component State:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

uploadingId = null  (No upload in progress)
uploadedIds = Set   (Set of uploaded document IDs)

User Clicks Upload:
  │
  ├─ setUploadingId(docId)
  │  ▼
  │  uploadingId = docId  (Show loading)
  │
  ├─ File upload starts
  │  ├─ Validation
  │  ├─ Upload to Supabase
  │  ├─ Database record created
  │  │
  │  └─ Success
  │     ├─ setUploadedIds(prev => new Set([...prev, docId]))
  │     │  ▼
  │     │  uploadedIds = Set{..., docId}
  │     │
  │     ├─ setUploadingId(null)
  │     │  ▼
  │     │  uploadingId = null
  │     │
  │     └─ UI shows: ✓ Uploaded
```

## Error Handling Flow

```
┌──────────────────────────────────────────────────────────────────┐
│          ERROR HANDLING SCENARIOS                                │
└──────────────────────────────────────────────────────────────────┘

SCENARIO 1: No Sample Document Available
  ├─ getSampleDocumentUrl(unknownDoc) called
  │  └─ Lookup SAMPLE_DOCUMENTS[unknownDoc]
  │     └─ Not found → returns null
  │
  └─ SampleDocumentLink receives sampleDocUrl=null
     └─ Returns null (shows nothing)
        ✓ Graceful degradation


SCENARIO 2: PDF File Missing
  ├─ User clicks link
  │  └─ Modal opens
  │     └─ <embed> tag fails to load
  │
  └─ PDF viewer shows error
     ✓ Browser handles gracefully


SCENARIO 3: File Path Incorrect
  ├─ SAMPLE_DOCUMENTS has wrong path
  │  └─ File doesn't exist at that location
  │
  └─ Browser 404 error
     ✓ Modal still opens but shows error
        User can still close and upload


SCENARIO 4: Modal Not Supported
  ├─ Old browser without Dialog support
  │  └─ Falls back to default browser behavior
  │
  └─ User still can access link
     ✓ Graceful fallback


SCENARIO 5: Network Issue
  ├─ File loading slow or times out
  │  └─ Modal shows loading state
  │
  └─ User can close and continue
     ✓ Non-blocking, doesn't affect upload
```

---

This comprehensive visual architecture makes it easy to understand:
- Where sample documents appear
- How components communicate
- What happens when user interacts
- How data flows through the system
- Error scenarios and recovery
