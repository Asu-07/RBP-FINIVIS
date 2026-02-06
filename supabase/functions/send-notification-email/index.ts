import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting - in-memory for basic protection
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // emails per window per user
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(userId: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(userId);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_WINDOW });
    return { allowed: true };
  }
  
  if (record.count >= RATE_LIMIT) {
    return { allowed: false, retryAfter: Math.ceil((record.resetTime - now) / 1000) };
  }
  
  record.count++;
  return { allowed: true };
}

// Valid email types that require different authorization levels
const USER_EMAIL_TYPES = ["transfer", "deposit"] as const;
const ADMIN_EMAIL_TYPES = [
  "kyc_approved", "kyc_rejected", 
  "service_approved", "service_rejected", "service_action_required", "service_under_review",
  "payment_confirmed", "payment_rejected", "order_dispatched", "transaction_completed",
  "exchange_advance_confirmed", "exchange_balance_confirmed", "exchange_out_for_delivery", "exchange_delivered",
  "travel_insurance_issued", "travel_insurance_cancelled"
] as const;

type UserEmailType = typeof USER_EMAIL_TYPES[number];
type AdminEmailType = typeof ADMIN_EMAIL_TYPES[number];
type ValidEmailType = UserEmailType | AdminEmailType;

interface EmailRequest {
  type: ValidEmailType;
  email: string;
  name: string;
  amount?: number;
  currency?: string;
  recipientName?: string;
  recipientCurrency?: string;
  recipientAmount?: number;
  exchangeRate?: number;
  referenceNumber?: string;
  paymentMethod?: string;
  rejectionReason?: string;
  service_type?: string;
  action_required?: string;
  rejection_reason?: string;
  orderNumber?: string | null;
  reason?: string;
}

// Input validation
function validateEmailRequest(data: unknown): { valid: boolean; error?: string; data?: EmailRequest } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: "Invalid request body" };
  }
  
  const req = data as Record<string, unknown>;
  
  // Validate required fields
  if (!req.type || typeof req.type !== 'string') {
    return { valid: false, error: "Missing or invalid email type" };
  }
  
  if (!req.email || typeof req.email !== 'string') {
    return { valid: false, error: "Missing or invalid email address" };
  }
  
  if (!req.name || typeof req.name !== 'string') {
    return { valid: false, error: "Missing or invalid name" };
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(req.email)) {
    return { valid: false, error: "Invalid email format" };
  }
  
  // Validate email length
  if (req.email.length > 255) {
    return { valid: false, error: "Email address too long" };
  }
  
  // Validate name length
  if (req.name.length > 200) {
    return { valid: false, error: "Name too long" };
  }
  
  // Validate email type
  const allValidTypes = [...USER_EMAIL_TYPES, ...ADMIN_EMAIL_TYPES];
  if (!allValidTypes.includes(req.type as ValidEmailType)) {
    return { valid: false, error: "Invalid email type" };
  }
  
  // Validate optional string fields
  const stringFields = ['currency', 'recipientName', 'recipientCurrency', 'referenceNumber', 
    'paymentMethod', 'rejectionReason', 'service_type', 'action_required', 'rejection_reason', 'reason'];
  for (const field of stringFields) {
    if (req[field] !== undefined && req[field] !== null) {
      if (typeof req[field] !== 'string' || (req[field] as string).length > 500) {
        return { valid: false, error: `Invalid ${field}` };
      }
    }
  }
  
  // Validate numeric fields
  const numericFields = ['amount', 'recipientAmount', 'exchangeRate'];
  for (const field of numericFields) {
    if (req[field] !== undefined && req[field] !== null) {
      if (typeof req[field] !== 'number' || isNaN(req[field] as number)) {
        return { valid: false, error: `Invalid ${field}` };
      }
    }
  }
  
  return { valid: true, data: req as unknown as EmailRequest };
}

const formatCurrency = (amount: number, currency: string): string => {
  const symbols: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    AED: "AED ",
    SGD: "S$",
    AUD: "A$",
    CAD: "C$",
  };
  return `${symbols[currency] || currency + " "}${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const getServiceLabel = (serviceType: string): string => {
  const labels: Record<string, string> = {
    forex_card: "Forex Card",
    education_loan: "Education Loan",
    send_money: "Send Money",
    remittance: "International Remittance",
    currency_exchange: "Currency Exchange",
  };
  return labels[serviceType] || serviceType;
};

const generateTransferEmail = (data: EmailRequest): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Transfer Confirmation</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">RBP FINIVIS</h1>
        <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 14px;">International Money Transfer</p>
      </div>
      
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background: #48bb78; color: #ffffff; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 28px;">✓</div>
          <h2 style="color: #2d3748; margin: 15px 0 5px 0;">Transfer Successful!</h2>
          <p style="color: #718096; margin: 0;">Your money is on its way</p>
        </div>

        <p style="margin-bottom: 20px;">Dear ${data.name},</p>
        <p style="margin-bottom: 25px;">Your international transfer has been successfully processed.</p>

        <div style="background: #f7fafc; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #718096;">Reference Number</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 600; color: #2d3748;">${data.referenceNumber || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #718096;">Amount Sent</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 600; color: #2d3748;">${formatCurrency(data.amount || 0, data.currency || "INR")}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #718096;">Recipient Gets</td>
              <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #48bb78;">${formatCurrency(data.recipientAmount || 0, data.recipientCurrency || "USD")}</td>
            </tr>
          </table>
        </div>
      </div>

      <div style="background: #f7fafc; padding: 20px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; text-align: center;">
        <p style="color: #718096; font-size: 12px; margin: 0 0 10px 0;">RBP FINIVIS Private Limited | RBI Licensed FFMC</p>
        <p style="color: #a0aec0; font-size: 11px; margin: 0;">This is an automated email. Please do not reply directly.</p>
      </div>
    </body>
    </html>
  `;
};

const generateDepositEmail = (data: EmailRequest): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Deposit Confirmation</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">RBP FINIVIS</h1>
        <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 14px;">Wallet Services</p>
      </div>
      
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background: #48bb78; color: #ffffff; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 28px;">✓</div>
          <h2 style="color: #2d3748; margin: 15px 0 5px 0;">Deposit Successful!</h2>
          <p style="color: #718096; margin: 0;">Your wallet has been credited</p>
        </div>

        <p style="margin-bottom: 20px;">Dear ${data.name},</p>
        <p style="margin-bottom: 25px;">Your wallet deposit of ${formatCurrency(data.amount || 0, data.currency || "INR")} has been successfully processed.</p>
      </div>

      <div style="background: #f7fafc; padding: 20px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; text-align: center;">
        <p style="color: #718096; font-size: 12px; margin: 0 0 10px 0;">RBP FINIVIS Private Limited | RBI Licensed FFMC</p>
      </div>
    </body>
    </html>
  `;
};

const generateKycApprovedEmail = (data: EmailRequest): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">RBP FINIVIS</h1>
      </div>
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background: #48bb78; color: #ffffff; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 28px;">✓</div>
          <h2 style="color: #2d3748; margin: 15px 0 5px 0;">KYC Verified!</h2>
        </div>
        <p>Dear ${data.name},</p>
        <p>Your KYC verification has been successfully completed. You can now access all RBP FINIVIS services.</p>
      </div>
      <div style="background: #f7fafc; padding: 20px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; text-align: center;">
        <p style="color: #718096; font-size: 12px; margin: 0;">RBP FINIVIS Private Limited</p>
      </div>
    </body>
    </html>
  `;
};

const generateKycRejectedEmail = (data: EmailRequest): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">RBP FINIVIS</h1>
      </div>
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background: #fc8181; color: #ffffff; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 28px;">!</div>
          <h2 style="color: #2d3748; margin: 15px 0 5px 0;">Additional Documents Required</h2>
        </div>
        <p>Dear ${data.name},</p>
        <p>We were unable to verify your identity. Please resubmit your documents from your dashboard.</p>
      </div>
      <div style="background: #f7fafc; padding: 20px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; text-align: center;">
        <p style="color: #718096; font-size: 12px; margin: 0;">RBP FINIVIS Private Limited</p>
      </div>
    </body>
    </html>
  `;
};

const generateServiceApprovedEmail = (data: EmailRequest): string => {
  const serviceLabel = getServiceLabel(data.service_type || "");
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">RBP FINIVIS</h1>
        <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 14px;">${serviceLabel} Application</p>
      </div>
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background: #48bb78; color: #ffffff; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 28px;">✓</div>
          <h2 style="color: #2d3748; margin: 15px 0 5px 0;">Application Approved!</h2>
          <p style="color: #718096; margin: 0;">Your ${serviceLabel} application has been approved</p>
        </div>

        <p style="margin-bottom: 20px;">Dear ${data.name},</p>
        <p style="margin-bottom: 25px;">Great news! Your ${serviceLabel} application has been reviewed and approved. You can now proceed with the next steps from your dashboard.</p>

        <div style="background: #f0fff4; border: 1px solid #68d391; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
          <h3 style="color: #22543d; margin: 0 0 15px 0; font-size: 16px;">What's Next?</h3>
          <p style="color: #2d3748; margin: 0;">Log in to your dashboard to complete any remaining steps and start using your ${serviceLabel} service.</p>
        </div>

        <p style="text-align: center;">
          <a href="https://rbpfinivis.com/dashboard" style="display: inline-block; background: #2c5282; color: #ffffff; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600;">Go to Dashboard</a>
        </p>
      </div>
      <div style="background: #f7fafc; padding: 20px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; text-align: center;">
        <p style="color: #718096; font-size: 12px; margin: 0;">RBP FINIVIS Private Limited | RBI Licensed FFMC</p>
      </div>
    </body>
    </html>
  `;
};

const generateServiceRejectedEmail = (data: EmailRequest): string => {
  const serviceLabel = getServiceLabel(data.service_type || "");
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">RBP FINIVIS</h1>
        <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 14px;">${serviceLabel} Application</p>
      </div>
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background: #fc8181; color: #ffffff; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 28px;">✕</div>
          <h2 style="color: #2d3748; margin: 15px 0 5px 0;">Application Not Approved</h2>
          <p style="color: #718096; margin: 0;">Your ${serviceLabel} application could not be approved</p>
        </div>

        <p style="margin-bottom: 20px;">Dear ${data.name},</p>
        <p style="margin-bottom: 25px;">We regret to inform you that your ${serviceLabel} application could not be approved at this time.</p>

        ${data.rejection_reason ? `
        <div style="background: #fff5f5; border: 1px solid #fc8181; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
          <h3 style="color: #c53030; margin: 0 0 10px 0; font-size: 16px;">Reason:</h3>
          <p style="color: #2d3748; margin: 0;">${data.rejection_reason}</p>
        </div>
        ` : ""}

        <p style="color: #718096; font-size: 14px;">If you believe this was an error or would like to discuss further, please contact our support team.</p>
      </div>
      <div style="background: #f7fafc; padding: 20px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; text-align: center;">
        <p style="color: #718096; font-size: 12px; margin: 0;">RBP FINIVIS Private Limited | RBI Licensed FFMC</p>
      </div>
    </body>
    </html>
  `;
};

const generateServiceActionRequiredEmail = (data: EmailRequest): string => {
  const serviceLabel = getServiceLabel(data.service_type || "");
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">RBP FINIVIS</h1>
        <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 14px;">${serviceLabel} Application</p>
      </div>
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background: #ed8936; color: #ffffff; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 28px;">!</div>
          <h2 style="color: #2d3748; margin: 15px 0 5px 0;">Action Required</h2>
          <p style="color: #718096; margin: 0;">Your ${serviceLabel} application needs attention</p>
        </div>

        <p style="margin-bottom: 20px;">Dear ${data.name},</p>
        <p style="margin-bottom: 25px;">We need some additional information to proceed with your ${serviceLabel} application.</p>

        <div style="background: #fffaf0; border: 1px solid #ed8936; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
          <h3 style="color: #c05621; margin: 0 0 10px 0; font-size: 16px;">Required Action:</h3>
          <p style="color: #2d3748; margin: 0;">${data.action_required || "Please log in to your dashboard for more details."}</p>
        </div>

        <p style="text-align: center;">
          <a href="https://rbpfinivis.com/dashboard" style="display: inline-block; background: #ed8936; color: #ffffff; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600;">Take Action Now</a>
        </p>
      </div>
      <div style="background: #f7fafc; padding: 20px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; text-align: center;">
        <p style="color: #718096; font-size: 12px; margin: 0;">RBP FINIVIS Private Limited | RBI Licensed FFMC</p>
      </div>
    </body>
    </html>
  `;
};

const generateServiceUnderReviewEmail = (data: EmailRequest): string => {
  const serviceLabel = getServiceLabel(data.service_type || "");
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">RBP FINIVIS</h1>
        <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 14px;">${serviceLabel} Application</p>
      </div>
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background: #4299e1; color: #ffffff; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 28px;">⏳</div>
          <h2 style="color: #2d3748; margin: 15px 0 5px 0;">Under Review</h2>
          <p style="color: #718096; margin: 0;">Your ${serviceLabel} application is being processed</p>
        </div>

        <p style="margin-bottom: 20px;">Dear ${data.name},</p>
        <p style="margin-bottom: 25px;">Your ${serviceLabel} application has been received and is currently under review by our team. We'll notify you once the review is complete.</p>

        <div style="background: #ebf8ff; border: 1px solid #4299e1; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
          <p style="color: #2d3748; margin: 0;">Expected review time: 1-2 business days. You'll receive an update via email.</p>
        </div>
      </div>
      <div style="background: #f7fafc; padding: 20px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; text-align: center;">
        <p style="color: #718096; font-size: 12px; margin: 0;">RBP FINIVIS Private Limited | RBI Licensed FFMC</p>
      </div>
    </body>
    </html>
  `;
};

interface StatusEmailData {
  title: string;
  subtitle: string;
  name: string;
  body: string;
}

const generateStatusEmail = (data: StatusEmailData): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">RBP FINIVIS</h1>
        <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 14px;">${data.subtitle}</p>
      </div>
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background: #48bb78; color: #ffffff; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 28px;">✓</div>
          <h2 style="color: #2d3748; margin: 15px 0 5px 0;">${data.title}</h2>
        </div>
        <p style="margin-bottom: 20px;">Dear ${data.name},</p>
        <p style="margin-bottom: 25px;">${data.body}</p>
      </div>
      <div style="background: #f7fafc; padding: 20px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; text-align: center;">
        <p style="color: #718096; font-size: 12px; margin: 0;">RBP FINIVIS Private Limited | RBI Licensed FFMC</p>
      </div>
    </body>
    </html>
  `;
};


const handler = async (req: Request): Promise<Response> => {
  console.log("Received notification email request");

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ========== AUTHENTICATION ==========
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with user's auth token
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the user's authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Authenticated user:", user.id, user.email);

    // ========== RATE LIMITING ==========
    const rateCheck = checkRateLimit(user.id);
    if (!rateCheck.allowed) {
      console.warn("Rate limit exceeded for user:", user.id);
      return new Response(
        JSON.stringify({ 
          error: "Too many email requests. Please try again later.",
          retryAfter: rateCheck.retryAfter 
        }),
        { 
          status: 429, 
          headers: { 
            "Content-Type": "application/json", 
            "Retry-After": String(rateCheck.retryAfter),
            ...corsHeaders 
          } 
        }
      );
    }

    // ========== INPUT VALIDATION ==========
    const rawData = await req.json();
    const validation = validateEmailRequest(rawData);
    
    if (!validation.valid || !validation.data) {
      console.error("Validation failed:", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const data = validation.data;
    console.log("Email request:", { type: data.type, email: data.email, name: data.name });

    // ========== AUTHORIZATION ==========
    // Check if this is an admin-only email type
    const isAdminEmailType = ADMIN_EMAIL_TYPES.includes(data.type as AdminEmailType);
    
    if (isAdminEmailType) {
      // Check if user has admin role
      const { data: hasAdminRole, error: roleError } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      // Also check if user is an admin by email
      const { data: isAdminEmail, error: emailError } = await supabase.rpc('is_admin_email');

      if ((roleError && emailError) || (!hasAdminRole && !isAdminEmail)) {
        console.error("Admin authorization failed for user:", user.id);
        return new Response(
          JSON.stringify({ error: "Admin access required for this email type" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      console.log("Admin access verified for user:", user.id);
    } else {
      // For user email types, verify the email belongs to the authenticated user
      // Get user's profile to verify email
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('user_id', user.id)
        .single();

      const userEmail = user.email || profile?.email;
      
      // Users can only send emails to their own address for non-admin types
      if (data.email !== userEmail) {
        console.error("Email address mismatch:", { requested: data.email, userEmail });
        return new Response(
          JSON.stringify({ error: "You can only send notifications to your own email address" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // ========== API KEY CHECK ==========
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // ========== EMAIL GENERATION ==========
    let html: string;
    let subject: string;

    switch (data.type) {
      case "transfer":
        html = generateTransferEmail(data);
        subject = `Transfer Confirmed - ${data.referenceNumber || "RBP FINIVIS"}`;
        break;
      case "deposit":
        html = generateDepositEmail(data);
        subject = `Deposit Confirmed - ${formatCurrency(data.amount || 0, data.currency || "INR")}`;
        break;
      case "kyc_approved":
        html = generateKycApprovedEmail(data);
        subject = "KYC Verification Approved - RBP FINIVIS";
        break;
      case "kyc_rejected":
        html = generateKycRejectedEmail(data);
        subject = "KYC Update Required - RBP FINIVIS";
        break;
      case "service_approved":
        html = generateServiceApprovedEmail(data);
        subject = `${getServiceLabel(data.service_type || "")} Application Approved - RBP FINIVIS`;
        break;
      case "service_rejected":
        html = generateServiceRejectedEmail(data);
        subject = `${getServiceLabel(data.service_type || "")} Application Update - RBP FINIVIS`;
        break;
      case "service_action_required":
        html = generateServiceActionRequiredEmail(data);
        subject = `Action Required: ${getServiceLabel(data.service_type || "")} Application - RBP FINIVIS`;
        break;
      case "service_under_review":
        html = generateServiceUnderReviewEmail(data);
        subject = `${getServiceLabel(data.service_type || "")} Application Under Review - RBP FINIVIS`;
        break;

      case "payment_confirmed":
        html = generateStatusEmail({
          title: "Payment Confirmed",
          subtitle: "Payment Update",
          name: data.name,
          body: `Your payment has been confirmed. Reference: ${data.referenceNumber || "—"}.`,
        });
        subject = `Payment Confirmed - ${data.referenceNumber || "RBP FINIVIS"}`;
        break;
      case "payment_rejected":
        html = generateStatusEmail({
          title: "Payment Rejected",
          subtitle: "Payment Update",
          name: data.name,
          body: `Your payment could not be confirmed. ${data.reason ? `Reason: ${data.reason}` : "Please contact support for assistance."}`,
        });
        subject = `Payment Update - ${data.referenceNumber || "RBP FINIVIS"}`;
        break;
      case "order_dispatched":
        html = generateStatusEmail({
          title: "Order Dispatched",
          subtitle: "Order Update",
          name: data.name,
          body: `Your order has been dispatched and is in transit. Reference: ${data.referenceNumber || "—"}.`,
        });
        subject = `Order Dispatched - ${data.referenceNumber || "RBP FINIVIS"}`;
        break;
      case "transaction_completed":
        html = generateStatusEmail({
          title: "Order Delivered",
          subtitle: "Order Update",
          name: data.name,
          body: `Your order has been marked as delivered. Reference: ${data.referenceNumber || "—"}.`,
        });
        subject = `Order Delivered - ${data.referenceNumber || "RBP FINIVIS"}`;
        break;

      case "exchange_advance_confirmed":
        html = generateStatusEmail({
          title: "Advance Confirmed",
          subtitle: "Currency Exchange",
          name: data.name,
          body: `Your advance booking has been confirmed for order ${data.orderNumber || "—"}.`,
        });
        subject = `Advance Confirmed - ${data.orderNumber || "Currency Exchange"}`;
        break;
      case "exchange_balance_confirmed":
        html = generateStatusEmail({
          title: "Balance Payment Confirmed",
          subtitle: "Currency Exchange",
          name: data.name,
          body: `Your balance payment has been confirmed for order ${data.orderNumber || "—"}.`,
        });
        subject = `Balance Confirmed - ${data.orderNumber || "Currency Exchange"}`;
        break;
      case "exchange_out_for_delivery":
        html = generateStatusEmail({
          title: "Out for Delivery",
          subtitle: "Currency Exchange",
          name: data.name,
          body: `Your currency exchange order ${data.orderNumber || "—"} is out for delivery.`,
        });
        subject = `Out for Delivery - ${data.orderNumber || "Currency Exchange"}`;
        break;
      case "exchange_delivered":
        html = generateStatusEmail({
          title: "Delivered",
          subtitle: "Currency Exchange",
          name: data.name,
          body: `Your currency exchange order ${data.orderNumber || "—"} has been delivered.`,
        });
        subject = `Delivered - ${data.orderNumber || "Currency Exchange"}`;
        break;

      case "travel_insurance_issued":
        html = generateStatusEmail({
          title: "Policy Issued",
          subtitle: "Travel Insurance",
          name: data.name,
          body: `Your travel insurance policy ${(data as any).policyNumber || "—"} has been issued for ${(data as any).destination || "your trip"}. Travel dates: ${(data as any).travelDates || "—"}. You can download your policy from your dashboard.`,
        });
        subject = `Travel Insurance Policy Issued - ${(data as any).policyNumber || "RBP FINIVIS"}`;
        break;
      case "travel_insurance_cancelled":
        html = generateStatusEmail({
          title: "Policy Cancelled",
          subtitle: "Travel Insurance",
          name: data.name,
          body: `Your travel insurance policy ${(data as any).policyNumber || "—"} has been cancelled. If you have any questions, please contact our support team.`,
        });
        subject = `Travel Insurance Policy Cancelled - ${(data as any).policyNumber || "RBP FINIVIS"}`;
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Invalid email type" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
    }

    // ========== SEND EMAIL ==========
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "RBP FINIVIS <onboarding@resend.dev>",
        to: [data.email],
        subject: subject,
        html: html,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Resend API error:", errorText);
      // Don't expose internal error details to client
      return new Response(
        JSON.stringify({ error: "Failed to send email. Please try again later." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailResponse = await res.json();
    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error sending notification email:", error);
    // Don't expose internal error details
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
