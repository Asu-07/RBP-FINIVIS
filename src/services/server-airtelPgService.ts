// src/services/server-airtelPgService.ts
// AIRTEL PAYMENT GATEWAY – BACKEND ONLY (PRODUCTION READY)

import axios from "axios";

/* ------------------------------------------------------------------ */
/* CONFIG */
/* ------------------------------------------------------------------ */

const AIRTEL_CONFIG = {
  baseUrl:
    process.env.AIRTEL_BASE_URL ||
    "https://api.pg.stackintel.in/airtel-product-service/api/v1",
  username: process.env.AIRTEL_USERNAME!,
  password: process.env.AIRTEL_PASSWORD!,
};

// Token cache (Bearer token for admin APIs)
let tokenCache: { token: string; expiresAt: number } | null = null;

// Merchant credentials (used for payment APIs)
const merchantCreds = {
  key: process.env.AIRTEL_MERCHANT_KEY!,
  secret: process.env.AIRTEL_MERCHANT_SECRET!,
};

if (!merchantCreds.key || !merchantCreds.secret) {
  console.warn(
    "⚠️ AIRTEL_MERCHANT_KEY / AIRTEL_MERCHANT_SECRET not set in env"
  );
}

/* ------------------------------------------------------------------ */
/* TOKEN GENERATION (ADMIN AUTH) */
/* ------------------------------------------------------------------ */

async function generateToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token;
  }

  try {
    const authConfig = {
      auth: {
        username: AIRTEL_CONFIG.username,
        password: AIRTEL_CONFIG.password,
      },
    };

    let response;

    // Airtel UAT/PROD inconsistency: GET or POST
    try {
      response = await axios.get(
        `${AIRTEL_CONFIG.baseUrl}/program/generate-token`,
        authConfig
      );
    } catch {
      response = await axios.post(
        `${AIRTEL_CONFIG.baseUrl}/program/generate-token`,
        {},
        authConfig
      );
    }

    const authHeader = response.headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("Bearer token not returned by Airtel");
    }

    const token = authHeader.replace("Bearer ", "");

    tokenCache = {
      token,
      expiresAt: Date.now() + 55 * 60 * 1000, // 55 min cache
    };

    return token;
  } catch (err) {
    console.error("❌ Airtel token generation failed:", err);
    throw err;
  }
}

/* ------------------------------------------------------------------ */
/* ONE-TIME ADMIN / ONBOARDING APIS */
/* ------------------------------------------------------------------ */

export async function saveMerchant(data: Record<string, any>): Promise<any> {
  const token = await generateToken();
  const FormData = require("form-data");
  const form = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    form.append(key, value);
  });

  const response = await axios.post(
    `${AIRTEL_CONFIG.baseUrl}/Merchant/Save`,
    form,
    {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function createKeySecret(): Promise<{
  merchantKey: string;
  merchantSecret: string;
}> {
  const token = await generateToken();

  const response = await axios.post(
    `${AIRTEL_CONFIG.baseUrl}/merchant/create-key-secret`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return {
    merchantKey: response.data.merchantKey,
    merchantSecret: response.data.merchantSecret,
  };
}

export async function addVPA(vpa: string): Promise<void> {
  const token = await generateToken();

  await axios.put(
    `${AIRTEL_CONFIG.baseUrl}/merchant/addVPA`,
    { vpa },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

/* ------------------------------------------------------------------ */
/* PAYMENT FLOW */
/* ------------------------------------------------------------------ */

export async function initiatePayment(data: {
  amount: number;
  customerVPA: string;
  orderId: string;
  customerMobile: string;
  description: string;
}): Promise<{ success: boolean; transactionId: string; message: string }> {
  try {
    const response = await axios.post(
      `${AIRTEL_CONFIG.baseUrl}/merchant-gateway/initiateCollectRequest`,
      {
        amount: data.amount,
        customerVpa: data.customerVPA,
        merchantTransactionId: data.orderId,
        customerMobile: data.customerMobile,
        description: data.description,
      },
      {
        headers: {
          "X-Merchant-Key": merchantCreds.key,
          "X-Merchant-Secret": merchantCreds.secret,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      transactionId: response.data.transactionId,
      message: "Payment initiated",
    };
  } catch (error: any) {
    return {
      success: false,
      transactionId: "",
      message:
        error?.response?.data?.message ||
        "Payment initiation failed with Airtel",
    };
  }
}

export async function processPayment(
  transactionId: string
): Promise<{ success: boolean; status: string }> {
  try {
    const response = await axios.post(
      `${AIRTEL_CONFIG.baseUrl}/merchant-pg/processCollectMoney`,
      { transactionId },
      {
        headers: {
          "X-Merchant-Key": merchantCreds.key,
          "X-Merchant-Secret": merchantCreds.secret,
        },
      }
    );

    const status = response.data.status;

    return {
      success: status === "SUCCESS",
      status,
    };
  } catch {
    return {
      success: false,
      status: "FAILED",
    };
  }
}

export async function validateVPA(vpa: string): Promise<boolean> {
  try {
    const response = await axios.post(
      `${AIRTEL_CONFIG.baseUrl}/merchant-pg/validateCustomerVpa`,
      { vpa },
      {
        headers: {
          "X-Merchant-Key": merchantCreds.key,
          "X-Merchant-Secret": merchantCreds.secret,
        },
      }
    );

    return response.data.valid === true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* ADMIN */
/* ------------------------------------------------------------------ */

export async function getTransactions(filters?: Record<string, any>) {
  const token = await generateToken();

  const response = await axios.get(
    `${AIRTEL_CONFIG.baseUrl}/admin/transactionList`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: filters,
    }
  );

  return response.data?.transactions ?? [];
}

/* ------------------------------------------------------------------ */

export const AirtelPgService = {
  saveMerchant,
  createKeySecret,
  addVPA,
  initiatePayment,
  processPayment,
  validateVPA,
  getTransactions,
};