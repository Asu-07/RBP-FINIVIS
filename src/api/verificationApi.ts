// src/api/verificationApi.ts
// FRONTEND API WRAPPER — DOCUMENT VERIFICATION

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* =======================
   TYPES
======================= */

type VerifyPanInput = {
  panNumber: string;
  name: string;
  documentId?: string;
  userId?: string;
};

type VerifyPassportInput = {
  passportNumber: string;
  dob: string;
  fileNumber?: string;
  documentId?: string;
  userId?: string;
};

type VerifyAadhaarInput = {
  aadhaarNumber: string;
  documentId?: string;
  userId?: string;
};

/* =======================
   HELPERS
======================= */

async function post<T>(body: any): Promise<T> {
  const res = await fetch(`${API_BASE_URL}/verification`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    throw new Error("Verification request failed");
  }

  return res.json();
}

/* =======================
   API FUNCTIONS
======================= */

export async function verifyPAN(input: VerifyPanInput) {
  return post({
    type: "pan",
    ...input
  });
}

export async function verifyPassport(input: VerifyPassportInput) {
  return post({
    type: "passport",
    ...input
  });
}

export async function verifyAadhaar(input: VerifyAadhaarInput) {
  return post({
    type: "aadhaar",
    ...input
  });
}

export async function getVerificationStatus(userId: string) {
  const res = await fetch(
    `${API_BASE_URL}/verification?userId=${userId}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch verification status");
  }

  return res.json();
}