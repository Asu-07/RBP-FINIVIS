/**
 * Mapping of document IDs to their sample document paths
 * These are used to display sample documents to users
 * to help them understand what documents to upload
 */

export const SAMPLE_DOCUMENTS: Record<string, string> = {
  // Passport documents
  passport: "/sample-docs/passport front.pdf",
  passport_front: "/sample-docs/passport front.pdf",
  passport_back: "/sample-docs/_Passport_ Back Side.pdf",
  
  // Visa documents
  visa: "/sample-docs/Visa-1.pdf",
  visa_schengen: "/sample-docs/Visa-1.pdf",
  
  // Travel documents
  ticket: "/sample-docs/Air ticket-2.pdf",
  air_ticket: "/sample-docs/Air ticket-2.pdf",
  flight_ticket: "/sample-docs/Air ticket-2.pdf",
  return_ticket: "/sample-docs/Return Ticket.pdf",
  
  // PAN document
  pan: "/sample-docs/Pan-2.pdf",
  
  // Travel Insurance related
  travel_tickets: "/sample-docs/Air ticket-2.pdf",
  
  // Admission and education related
  admission_letter: "/sample-docs/admission-letter.pdf", // Placeholder if available
  i20_cas: "/sample-docs/i20-cas.pdf", // Placeholder if available
  fee_invoice: "/sample-docs/fee-invoice.pdf", // Placeholder if available
  
  // Medical documents
  medical_visa: "/sample-docs/Visa-1.pdf",
  medical_letter: "/sample-docs/medical-letter.pdf", // Placeholder if available
  hospital_letter: "/sample-docs/hospital-letter.pdf", // Placeholder if available
  
  // Employment documents
  work_visa: "/sample-docs/Visa-1.pdf",
  offer_letter: "/sample-docs/offer-letter.pdf", // Placeholder if available
  employment_visa: "/sample-docs/Visa-1.pdf",
  
  // Other documents
  business_visa: "/sample-docs/Visa-1.pdf",
  invitation_letter: "/sample-docs/invitation-letter.pdf", // Placeholder if available
  business_invitation: "/sample-docs/invitation-letter.pdf",
  pr_visa: "/sample-docs/Visa-1.pdf",
  
  // Remittance related
  relationship_proof: "/sample-docs/relationship-proof.pdf", // Placeholder if available
  beneficiary_id: "/sample-docs/beneficiary-id.pdf", // Placeholder if available
  id_proof: "/sample-docs/id-proof.pdf", // Placeholder if available
};

/**
 * Get the sample document URL for a given document type
 * @param documentId - The ID of the document type
 * @returns The URL path to the sample document, or null if not available
 */
export function getSampleDocumentUrl(documentId: string): string | null {
  return SAMPLE_DOCUMENTS[documentId] || null;
}

/**
 * Check if a sample document is available for a given document type
 * @param documentId - The ID of the document type
 * @returns true if a sample document is available
 */
export function hasSampleDocument(documentId: string): boolean {
  const url = getSampleDocumentUrl(documentId);
  return url !== null && url !== undefined;
}
