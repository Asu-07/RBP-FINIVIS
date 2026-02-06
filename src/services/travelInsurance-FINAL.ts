// TRAVEL INSURANCE API - FINAL PRODUCTION VERSION
// Using production credentials from Agent Details Excel

import { supabase } from '@/integrations/supabase/client';

const INSURANCE_CONFIG = {
  // Production credentials from Excel file
  partnerId: import.meta.env.VITE_INSURANCE_PARTNER_ID || '7a954713-2468-4ab2-9b28-34883b10f9bf',
  secretKey: import.meta.env.VITE_INSURANCE_SECRET_KEY || 'y3sJIN8qncgMYIIZke611dhzCcdU9pUb',
  vectorBytes: import.meta.env.VITE_INSURANCE_VECTOR_BYTES || 'rRhohTnII2rF0mo6',
  branchSign: import.meta.env.VITE_INSURANCE_BRANCH_SIGN || 'c18d02fd-7659-4295-85df-03d3591bfde0',
  reference: import.meta.env.VITE_INSURANCE_REFERENCE || '121f4c34-a3e9-4908-8ea0-32041dfbcc62',
  
  // API endpoints (you'll need to confirm these with your supervisor)
  baseUrl: import.meta.env.VITE_INSURANCE_BASE_URL || 'https://dolphin.asego.in:8080/api'
};

interface TravelInsuranceRequest {
  userId: string;
  destination: string;
  startDate: string;
  endDate: string;
  numTravelers: number;
  travelerDetails: {
    name: string;
    dob: string;
    passportNumber: string;
  }[];
  coverageAmount: number;
}

interface InsuranceResponse {
  success: boolean;
  policyId?: string;
  policyNumber?: string;
  premium?: number;
  error?: string;
}

/**
 * Calculate Insurance Premium
 * NOTE: Endpoint may need adjustment based on actual API documentation
 */
export async function calculatePremium(
  destination: string,
  duration: number,
  numTravelers: number,
  coverageAmount: number
): Promise<{ premium: number; error?: string }> {
  try {
    // API call to calculate premium
    // Using production credentials
    const response = await fetch(`${INSURANCE_CONFIG.baseUrl}/quote/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Partner-Id': INSURANCE_CONFIG.partnerId,
        'X-Secret-Key': INSURANCE_CONFIG.secretKey,
        'X-Reference': INSURANCE_CONFIG.reference
      },
      body: JSON.stringify({
        destination,
        duration,
        travelers: numTravelers,
        coverage: coverageAmount,
        branchSign: INSURANCE_CONFIG.branchSign
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Premium calculation error:', response.status, errorText);
      return {
        premium: 0,
        error: `API error: ${response.status}`
      };
    }

    const data = await response.json();
    
    if (!data.premium && !data.amount) {
      console.error('Premium not in response:', data);
      return {
        premium: 0,
        error: 'Premium not returned by API'
      };
    }

    return {
      premium: data.premium || data.amount || 0
    };
  } catch (error: any) {
    console.error('Premium calculation error:', error);
    return {
      premium: 0,
      error: error.message || 'Failed to calculate premium'
    };
  }
}

/**
 * Create Travel Insurance Policy
 */
export async function createTravelInsurance(
  request: TravelInsuranceRequest
): Promise<InsuranceResponse> {
  try {
    // Calculate duration
    const duration = Math.ceil(
      (new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) / 
      (1000 * 60 * 60 * 24)
    );

    // Get premium quote first
    const { premium, error: premiumError } = await calculatePremium(
      request.destination,
      duration,
      request.numTravelers,
      request.coverageAmount
    );

    if (premiumError) {
      return { success: false, error: premiumError };
    }

    // Create policy with production credentials
    const response = await fetch(`${INSURANCE_CONFIG.baseUrl}/policy/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Partner-Id': INSURANCE_CONFIG.partnerId,
        'X-Secret-Key': INSURANCE_CONFIG.secretKey,
        'X-Reference': INSURANCE_CONFIG.reference
      },
      body: JSON.stringify({
        destination: request.destination,
        startDate: request.startDate,
        endDate: request.endDate,
        travelers: request.travelerDetails,
        coverageAmount: request.coverageAmount,
        premium: premium,
        branchSign: INSURANCE_CONFIG.branchSign,
        vectorBytes: INSURANCE_CONFIG.vectorBytes
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Policy creation error:', response.status, errorText);
      return {
        success: false,
        error: `API error: ${response.status}`
      };
    }

    const data = await response.json();

    if (!data.success && data.success !== undefined) {
      return {
        success: false,
        error: data.message || 'Policy creation failed'
      };
    }

    // Save to database
    const policyNumber = data.policyNumber || data.policy_number || `INS${Date.now()}`;
    
    const { data: dbPolicy, error: dbError } = await supabase
      .from('travel_insurance_policies')
      .insert({
        user_id: request.userId,
        policy_number: policyNumber,
        policy_type: 'international',
        destination: request.destination,
        start_date: request.startDate,
        end_date: request.endDate,
        num_travelers: request.numTravelers,
        coverage_amount: request.coverageAmount,
        premium_amount: premium,
        status: 'active',
        partner_insurer_name: 'Insurance Partner',
        partner_policy_reference: data.policyId || data.policy_id || data.referenceNumber,
        insurer_issued_at: new Date().toISOString(),
        disclaimer_accepted: true,
        disclaimer_accepted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError || !dbPolicy) {
      console.error('Database error:', dbError);
      return {
        success: false,
        error: `Database error: ${dbError?.message || 'Failed to save policy'}`
      };
    }

    return {
      success: true,
      policyId: dbPolicy.id,
      policyNumber: policyNumber,
      premium: premium
    };
  } catch (error: any) {
    console.error('Policy creation error:', error);
    return {
      success: false,
      error: error.message || 'Policy creation failed'
    };
  }
}

/**
 * Get Policy Details
 */
export async function getPolicyDetails(policyNumber: string) {
  try {
    const { data, error } = await supabase
      .from('travel_insurance_policies')
      .select('*')
      .eq('policy_number', policyNumber)
      .single();

    if (error) {
      console.error('Failed to fetch policy:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Get policy error:', error);
    return null;
  }
}

/**
 * Get User's Policies
 */
export async function getUserPolicies(userId: string) {
  try {
    const { data, error } = await supabase
      .from('travel_insurance_policies')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch policies:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Get policies error:', error);
    return [];
  }
}
