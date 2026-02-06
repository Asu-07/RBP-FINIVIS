
// ASEGO API (Dolphin) Integration Service
// Based on OpenAPI 3.0.1 Specification

const ASEGO_CONFIG = {
    // .env has /api which causes 401 for these endpoints, so we strip it or use default
    baseUrl: (import.meta.env.VITE_INSURANCE_BASE_URL || 'https://dolphin.asego.in:8080').replace(/\/api$/, ''),
    partnerId: import.meta.env.VITE_INSURANCE_PARTNER_ID || '7a954713-2468-4ab2-9b28-34883b10f9bf',
    secretKey: import.meta.env.VITE_INSURANCE_SECRET_KEY || 'y3sJIN8qncgMYIIZke611dhzCcdU9pUb',
    vectorBytes: import.meta.env.VITE_INSURANCE_VECTOR_BYTES || 'rRhohTnII2rF0mo6',
    branchSign: import.meta.env.VITE_INSURANCE_BRANCH_SIGN || 'c18d02fd-7659-4295-85df-03d3591bfde0',
    reference: import.meta.env.VITE_INSURANCE_REFERENCE || '121f4c34-a3e9-4908-8ea0-32041dfbcc62',
    sign: 'f13aeea7-2ec2-4abe-8cb8-598e91a99335',
};

// Types based on Swagger documentation
export interface AsegoCategory {
    id: string;
    name: string;
    description: string;
}

export interface AsegoCurrency {
    id: string;
    currency: string;
    code: string;
    symbol: string;
}

export interface AgePremium {
    age: number;
    premium: number;
}

export interface AsegoPlan {
    id: string;
    name: string;
    displayName: string;
    shortName: string;
    type: string;
    sumInsured: string;
    productCategory: string;
    agePremiums: AgePremium[];
    coverages: any[];
    riders: any[];
}

export interface AsegoPlanRoot {
    insurerId: string;
    insurerName: string;
    plans: AsegoPlan[];
}

// Request Types
export interface ExternalIdentity {
    orderId: string;
    sign: string;
    branchSign?: string;
    branchName?: string;
    reference: string;
    partnerId: string;
}

export interface ExternalQuotation {
    travelCategory: string;
    startDate: string; // yyyy-MM-dd
    duration: number;
    endDate: string; // yyyy-MM-dd
    destination?: string;
}

export interface ExternalTraveler {
    name: string;
    passport: string;
    dob: string; // yyyy-MM-dd
    address: string;
    mobileNo: string;
    email: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
    country: string;
    age: number;
    gender: string;
    nominee: string;
    relation: string;
    finalPremium: number;
    riderTotalAmt?: number;
    emergencyContactPerson?: string;
    emergencyContactNumber?: string;
    emergencyEmailId?: string;
    preExistingMedicalCondition?: string;
}

export interface ExternalSelectedPlan {
    insurerId: string;
    totalPremium: number;
    plan: {
        sellingPlanId: string;
        agePremiums: AgePremium;
        riders?: any[];
    };
}

export interface ExternalOtherDetails {
    policyComment?: string;
    universityName?: string;
    universityAddress?: string;
}

export interface ExternalPolicy {
    identity: ExternalIdentity;
    selectedPlan: ExternalSelectedPlan;
    quotation: ExternalQuotation;
    traveler: ExternalTraveler;
    otherDetails: ExternalOtherDetails;
}

/**
 * Get Travel Categories
 * GET /ext/b2b/v1/category
 */
export async function getCategories(): Promise<AsegoCategory[]> {
    try {
        const response = await fetch(`${ASEGO_CONFIG.baseUrl}/ext/b2b/v1/category`);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        return [];
    }
}

/**
 * Get Plans
 * GET /ext/b2b/v1/plan/{partnerId}
 */
// Updated return type to include debug info
export async function getPlans(
    duration: number,
    ages: number[],
    categoryId: string
): Promise<{ data: AsegoPlanRoot[], debug: any }> {
    const queryParams = new URLSearchParams();
    queryParams.append('duration', duration.toString());
    ages.forEach(age => queryParams.append('age', age.toString()));
    // The plan API explicitly expects `category` as a required
    // query parameter. Using a different name (e.g. `travelCategory`)
    // causes a 400 error: "Required parameter 'category' is missing".
    // We therefore send `category` here to align with the API.
    queryParams.append('category', categoryId);

    const requestUrl = `${ASEGO_CONFIG.baseUrl}/ext/b2b/v1/plan/${ASEGO_CONFIG.partnerId}?${queryParams.toString()}`;

    try {
        if (import.meta.env.DEV) console.log('Fetching plans from:', requestUrl); // Console log for good measure
        const response = await fetch(requestUrl);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        return {
            data,
            debug: {
                url: requestUrl,
                rawResponse: data,
                status: response.status
            }
        };
    } catch (error) {
        console.error('Failed to fetch plans:', error);
        throw error;
    }
}

/**
 * Encrypt Data using API Endpoint
 * POST /ext/b2b/v1/encryption/encrypt
 */
export async function encryptData(data: any): Promise<string> {
    try {
        const response = await fetch(`${ASEGO_CONFIG.baseUrl}/ext/b2b/v1/encryption/encrypt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                value: JSON.stringify(data),
                key: ASEGO_CONFIG.secretKey,
                initVector: ASEGO_CONFIG.vectorBytes
            })
        });

        if (!response.ok) throw new Error(`Encryption Error: ${response.status}`);
        return await response.text();
    } catch (error) {
        console.error('Encryption failed:', error);
        throw error;
    }
}

/**
 * Validate Policy (Pre-check)
 * POST /ext/b2b/v1/createPolicy/validate/{partnerId}
 */
export async function validatePolicy(policies: ExternalPolicy[]): Promise<any> {
    try {
        const encryptedData = await encryptData(policies);

        // The API documentation says the body should be just the encrypted string in the schema
        // but typically APIs expect JSON objects. Documentation usually implies:
        // Body: "encrypted_string_content" or { content: "..." }
        // Based on "requestBody ... content ... application/json ... schema type: string"
        // it likely expects valid JSON string which is just "encrypted_string" if it's a raw string, 
        // or maybe it accepts raw text?
        // Let's try sending it as a direct string since schema says type: string

        const response = await fetch(
            `${ASEGO_CONFIG.baseUrl}/ext/b2b/v1/createPolicy/validate/${ASEGO_CONFIG.partnerId}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(encryptedData) // Sending as JSON string
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Validation failed response:", errorText);
            try {
                return JSON.parse(errorText);
            } catch (e) {
                throw new Error(`Validation Failed: ${response.status} - ${errorText}`);
            }
        }
        return await response.json();
    } catch (error) {
        console.error('Policy validation failed:', error);
        throw error;
    }
}

/**
 * Create Policy
 * POST /ext/b2b/v1/createPolicy/{partnerId}
 */
export async function createPolicy(policies: ExternalPolicy[]): Promise<any> {
    try {
        const encryptedData = await encryptData(policies);

        const response = await fetch(
            `${ASEGO_CONFIG.baseUrl}/ext/b2b/v1/createPolicy/${ASEGO_CONFIG.partnerId}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'External API/1.0'
                },
                body: JSON.stringify(encryptedData)
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Policy creation failed response:", errorText);
            try {
                return JSON.parse(errorText);
            } catch (e) {
                throw new Error(`Policy Creation Failed: ${response.status} - ${errorText}`);
            }
        }
        return await response.json();
    } catch (error) {
        console.error('Policy creation failed:', error);
        throw error;
    }
}

/**
 * Download Policy PDF
 * GET /ext/b2b/v1/download
 */
export async function downloadPolicy(filePath: string): Promise<Blob | null> {
    try {
        const response = await fetch(
            `${ASEGO_CONFIG.baseUrl}/ext/b2b/v1/download?filePath=${encodeURIComponent(filePath)}`
        );

        if (!response.ok) throw new Error(`Download Error: ${response.status}`);
        return await response.blob();
    } catch (error) {
        console.error('Failed to download policy:', error);
        return null;
    }
}
