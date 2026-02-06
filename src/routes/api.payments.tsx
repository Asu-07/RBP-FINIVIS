import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";

import { AirtelPgService } from "@/services/server-airtelPgService";
import { supabase } from "@/integrations/supabase/client";

/**
 * POST /api/payments
 * Initiate UPI Collect payment via Airtel PG
 */
export const action: ActionFunction = async ({ request }) => {
  try {
    // Parse request body
    const body = await request.json();
    const {
      amount,
      customerVPA,
      orderId,
      customerMobile,
      description,
    } = body;

    // Basic validation
    if (!amount || !customerVPA || !orderId) {
      return json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Optional: Validate VPA before initiating payment
    const isValidVPA = await AirtelPgService.validateVPA(customerVPA);
    if (!isValidVPA) {
      return json(
        { success: false, error: "Invalid UPI ID" },
        { status: 400 }
      );
    }

    // Initiate payment with Airtel PG
    const result = await AirtelPgService.initiatePayment({
      amount,
      customerVPA,
      orderId,
      customerMobile,
      description,
    });

    if (!result?.success) {
      return json(
        {
          success: false,
          error: result?.message || "Payment initiation failed",
        },
        { status: 400 }
      );
    }

    // Persist payment record (non-blocking for gateway response)

    const { error: dbError } = await supabase
  .from<any, any>("payments")
  .insert([
    {
      order_id: orderId,
      amount,
      currency: "INR",
      payment_method: "upi",
      customer_vpa: customerVPA,
      gateway_transaction_id: result.transactionId,
      status: "pending",
    } as any,
  ]);

    if (dbError) {
      console.error("Supabase insert error:", dbError);
      // Do NOT fail payment just because DB insert failed
    }

    // Final response to frontend
    return json({
      success: true,
      transactionId: result.transactionId,
      message: "Payment initiated. Approve the request in your UPI app.",
    });
  } catch (error: any) {
    console.error("API /api/payments error:", error);

    return json(
      {
        success: false,
        error: "Internal server error while initiating payment",
      },
      { status: 500 }
    );
  }
};