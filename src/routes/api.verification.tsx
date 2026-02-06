// src/routes/api.verification.tsx

import { json } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { SurepassService } from "@/services/surepassService";
import { supabase } from "@/integrations/supabase/client";

// disable TS inference issues
const sb = supabase as any;

/* =======================
   POST HANDLER
======================= */
export const action: ActionFunction = async ({ request }) => {
  try {
    const body = await request.json();
    const { type } = body;

    switch (type) {
      case "save_input":
        return saveVerificationInput(body);

      case "pan":
        return handlePAN(body);

      case "passport":
        return handlePassport(body);

      case "aadhaar":
        return handleAadhaar(body);

      default:
        return json(
          { success: false, error: "Invalid verification type" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("❌ Verification API error:", error);
    return json(
      { success: false, error: "Verification failed" },
      { status: 500 }
    );
  }
};

/* =======================
   SAVE USER INPUT (NEW)
======================= */
async function saveVerificationInput(body: any) {
  const { documentId, input } = body;

  if (!documentId || !input) {
    return json(
      { success: false, error: "documentId and input required" },
      { status: 400 }
    );
  }

  const { error } = await sb
    .from("kyc_documents")
    .update({
      verification_input: input,
      status: "input_submitted"
    })
    .eq("id", documentId);

  if (error) {
    console.error("❌ Failed to save verification input:", error);
    return json(
      { success: false, error: "Failed to save input" },
      { status: 500 }
    );
  }

  return json({ success: true });
}

/* =======================
   VERIFICATION HANDLERS
======================= */

async function handlePAN(body: any) {
  const { panNumber, name, documentId, userId } = body;

  if (!panNumber || !name) {
    return json(
      { success: false, error: "PAN number and name required" },
      { status: 400 }
    );
  }

  const result = await SurepassService.verifyPAN(panNumber, name);
  await updateDocumentAndUser(result, documentId, userId);

  return json(result);
}

async function handlePassport(body: any) {
  const { passportNumber, dob, fileNumber, documentId, userId } = body;

  if (!passportNumber || !dob) {
    return json(
      { success: false, error: "Passport number and DOB required" },
      { status: 400 }
    );
  }

  const result = await SurepassService.verifyPassport(
    passportNumber,
    dob,
    fileNumber
  );

  await updateDocumentAndUser(result, documentId, userId);
  return json(result);
}

async function handleAadhaar(body: any) {
  const { aadhaarNumber, documentId, userId } = body;

  if (!aadhaarNumber) {
    return json(
      { success: false, error: "Aadhaar number required" },
      { status: 400 }
    );
  }

  const result = await SurepassService.verifyAadhaar(aadhaarNumber);
  await updateDocumentAndUser(result, documentId, userId, true);

  return json(result);
}

/* =======================
   HELPERS
======================= */

async function updateDocumentAndUser(
  result: any,
  documentId?: string,
  userId?: string,
  aadhaar = false
) {
  if (!documentId) return;

  await sb
    .from("kyc_documents")
    .update({
      status: result.verified
        ? "verified"
        : aadhaar
        ? "pending"
        : "rejected",
      verified_at: result.verified ? new Date().toISOString() : null,
      rejection_reason: result.verified
        ? null
        : result.error || result.message,
      verification_data: result.data
    })
    .eq("id", documentId);

  if (result.verified && userId) {
    await updateUserKYCStatus(userId);
  }
}

async function updateUserKYCStatus(userId: string) {
  const { data } = await sb
    .from("kyc_documents")
    .select("document_type")
    .eq("user_id", userId)
    .eq("status", "verified");

  const verified = new Set((data || []).map((d: any) => d.document_type));
  const hasRequired =
    verified.has("pan_card") && verified.has("passport");

  await sb
    .from("profiles")
    .update({
      kyc_status: hasRequired ? "verified" : "submitted",
      kyc_verified_at: hasRequired
        ? new Date().toISOString()
        : null
    })
    .eq("user_id", userId);
}