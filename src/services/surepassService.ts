// server/services/surepassService.ts
// SUREPASS DOCUMENT VERIFICATION - BACKEND SERVICE
// DO NOT CALL FROM FRONTEND - BACKEND ONLY!

import axios from 'axios';

const SUREPASS_CONFIG = {
  baseUrl: process.env.SUREPASS_BASE_URL || 'https://kyc-api.surepass.io/api/v1',
  bearerToken: process.env.SUREPASS_BEARER_TOKEN!
};

interface VerificationResult {
  success: boolean;
  verified: boolean;
  data?: any;
  error?: string;
  message?: string;
}

/**
 * Normalize name for comparison
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z\s]/g, '');
}

/**
 * Check if names match with fuzzy logic
 */
function namesMatch(name1: string, name2: string): boolean {
  const n1 = normalizeName(name1);
  const n2 = normalizeName(name2);

  if (n1 === n2) return true;
  if (n1.includes(n2) || n2.includes(n1)) return true;

  const words1 = n1.split(' ');
  const words2 = n2.split(' ');
  const shorter = words1.length <= words2.length ? words1 : words2;
  const longer = words1.length > words2.length ? words1 : words2;

  return shorter.every(word => longer.some(w => w.includes(word) || word.includes(w)));
}

/**
 * Verify PAN Card
 * Endpoint: POST /identity/pan-comprehensive
 */
export async function verifyPAN(
  panNumber: string,
  name: string
): Promise<VerificationResult> {
  try {
    if (import.meta.env.DEV) console.log('🔄 Verifying PAN:', panNumber);

    const response = await axios.post(
      `${SUREPASS_CONFIG.baseUrl}/identity/pan-comprehensive`,
      {
        id_number: panNumber.toUpperCase()
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUREPASS_CONFIG.bearerToken}`
        }
      }
    );

    const result = response.data;

    // Surepass response: { success, status_code, data, message }
    const isValid = result.success === true && result.status_code === 200;

    const apiName = result.data?.full_name || '';
    const nameMatches = apiName ? namesMatch(name, apiName) : false;

    if (import.meta.env.DEV) {
      console.log('✅ PAN verification result:', {
        isValid,
        nameMatches,
        apiName
      });
    }

    return {
      success: true,
      verified: isValid && nameMatches,
      data: {
        panNumber: result.data?.pan_number,
        fullName: result.data?.full_name,
        fatherName: result.data?.father_name,
        dob: result.data?.dob,
        category: result.data?.category,
        status: result.data?.pan_status
      },
      message: isValid && nameMatches
        ? 'PAN verified successfully'
        : isValid
          ? 'PAN is valid but name does not match'
          : result.message || 'PAN verification failed'
    };
  } catch (error: any) {
    console.error('❌ PAN verification error:', error.response?.data || error.message);

    return {
      success: false,
      verified: false,
      error: error.response?.data?.message || error.message || 'PAN verification failed'
    };
  }
}

/**
 * Verify Passport
 * Endpoint: POST /identity/passport-verify
 */
export async function verifyPassport(
  passportNumber: string,
  dob: string,
  fileNumber?: string
): Promise<VerificationResult> {
  try {
    if (import.meta.env.DEV) console.log('🔄 Verifying Passport:', passportNumber);

    const response = await axios.post(
      `${SUREPASS_CONFIG.baseUrl}/identity/passport-verify`,
      {
        file_number: fileNumber || passportNumber,
        dob: dob // Format: YYYY-MM-DD
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUREPASS_CONFIG.bearerToken}`
        }
      }
    );

    const result = response.data;
    const isValid = result.success === true && result.status_code === 200;

    if (import.meta.env.DEV) console.log('✅ Passport verification result:', isValid);

    return {
      success: true,
      verified: isValid,
      data: {
        passportNumber: result.data?.passport_number,
        name: result.data?.name,
        dob: result.data?.dob,
        placeOfBirth: result.data?.place_of_birth,
        placeOfIssue: result.data?.place_of_issue,
        dateOfIssue: result.data?.date_of_issue,
        dateOfExpiry: result.data?.date_of_expiry,
        status: result.data?.status
      },
      message: isValid ? 'Passport verified successfully' : result.message || 'Passport verification failed'
    };
  } catch (error: any) {
    console.error('❌ Passport verification error:', error.response?.data || error.message);

    return {
      success: false,
      verified: false,
      error: error.response?.data?.message || error.message || 'Passport verification failed'
    };
  }
}

/**
 * Verify Aadhaar (if available)
 * Note: Aadhaar has strict privacy laws - may need special approval
 */
export async function verifyAadhaar(
  aadhaarNumber: string
): Promise<VerificationResult> {
  try {
    if (import.meta.env.DEV) console.log('🔄 Verifying Aadhaar');

    // Note: Endpoint may vary - check Surepass docs
    const response = await axios.post(
      `${SUREPASS_CONFIG.baseUrl}/identity/aadhaar-verify`,
      {
        id_number: aadhaarNumber
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUREPASS_CONFIG.bearerToken}`
        }
      }
    );

    const result = response.data;
    const isValid = result.success === true && result.status_code === 200;

    return {
      success: true,
      verified: isValid,
      data: result.data,
      message: isValid ? 'Aadhaar verified successfully' : 'Aadhaar verification failed'
    };
  } catch (error: any) {
    console.error('❌ Aadhaar verification error:', error.response?.data || error.message);

    // Aadhaar verification may require manual review
    return {
      success: true,
      verified: false,
      message: 'Aadhaar verification requires manual review'
    };
  }
}

// Export for use in routes
export const SurepassService = {
  verifyPAN,
  verifyPassport,
  verifyAadhaar
};
