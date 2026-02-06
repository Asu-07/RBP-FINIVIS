export type ProductType =
    | "Education TT"
    | "Maintaince TT"
    | "Gift TT"
    | "Currency Card"
    | "Currency Note";

interface Slab {
    min: number;
    max: number;
    rates: {
        [key in ProductType]: number; // Markup percentage
    };
}

// Slabs based on "Slab wise Rs. Rate" from provided image.
// Interpreted as INR Amounts in Thousands:
// 0-50    -> 0 to 50,000 INR
// 51-100  -> 50,001 to 100,000 INR
// 101-200 -> 100,001 to 200,000 INR
export const PRICING_SLABS: Slab[] = [
    {
        min: 0,
        max: 50000,
        rates: {
            "Education TT": 3.00,
            "Maintaince TT": 4.00,
            "Gift TT": 4.00,
            "Currency Card": 2.00,
            "Currency Note": 2.50,
        },
    },
    {
        min: 50001,
        max: 100000,
        rates: {
            "Education TT": 1.25,
            "Maintaince TT": 1.50,
            "Gift TT": 1.50,
            "Currency Card": 1.25,
            "Currency Note": 1.50,
        },
    },
    {
        min: 100001,
        max: 200000,
        rates: {
            "Education TT": 1.00,
            "Maintaince TT": 1.25,
            "Gift TT": 1.25,
            "Currency Card": 1.00,
            "Currency Note": 1.00,
        },
    },
    // Fallback for > 200,000 INR
    {
        min: 200001,
        max: Infinity,
        rates: {
            "Education TT": 1.00,
            "Maintaince TT": 1.25,
            "Gift TT": 1.25,
            "Currency Card": 1.00,
            "Currency Note": 1.00,
        },
    }
];

/**
 * Calculates the final exchange rate based on slab-wise markup.
 * Formula: Final Rate = IBR * (1 + (Markup / 100))
 * 
 * @param product The product type (e.g., "Education TT")
 * @param amountFCY The amount in foreign currency
 * @param ibrRate The Inter-Bank Rate (Base Rate)
 * @returns The final calculated exchange rate
 */
export const calculateExchangeRate = (
    product: ProductType,
    amountFCY: number,
    ibrRate: number
): number => {
    // Determine Slab based on INR amount
    const amountINR = amountFCY * ibrRate;
    const slab = PRICING_SLABS.find(s => amountINR >= s.min && amountINR <= s.max) || PRICING_SLABS[PRICING_SLABS.length - 1];
    const markupPercent = slab.rates[product];

    // DEBUG: Log slab selection
    console.log('💰 Slab Calculation:', {
        product,
        amountFCY,
        ibrRate,
        amountINR,
        slabRange: `${slab.min}-${slab.max}`,
        markupPercent,
        finalRate: ibrRate * (1 + (markupPercent / 100))
    });

    // Rate = IBR + (IBR * Markup%)
    return ibrRate * (1 + (markupPercent / 100));
};

export const getMarkupPercentage = (
    product: ProductType,
    amountFCY: number
): number => {
    // Use static IBR (e.g. 84) for estimation if strict current rate not available, 
    // or passed in. Here we assume caller might not have IBR, but slabs depend on INR.
    // Ideally we need IBR. For now, assuming standard ~84 if we can't get it, 
    // BUT this function implies we just want the % for a given FCY.
    // To be safe, let's assume a standard rate of 84 for slab lookup if just checking slots.
    const estimatedIBR = 84;
    const amountINR = amountFCY * estimatedIBR;
    const slab = PRICING_SLABS.find(s => amountINR >= s.min && amountINR <= s.max) || PRICING_SLABS[PRICING_SLABS.length - 1];
    return slab.rates[product];
};

/**
 * Breakdown of exchange rate calculation showing base rate and service charges separately.
 */
export interface ExchangeRateBreakdown {
    /** The base currency rate (IBR) without any markup */
    baseRate: number;
    /** The markup percentage applied based on slab */
    markupPercent: number;
    /** The service charge in INR (per unit of FCY) */
    serviceChargePerUnit: number;
    /** The final rate including all charges */
    finalRate: number;
    /** The slab range that was applied (e.g., "0-50000") */
    slabRange: string;
}

/**
 * Calculates the exchange rate with a detailed breakdown showing base rate and service charges separately.
 * This allows UI to display:
 *   Row 1: 1 USD = ₹{baseRate} (currency conversion rate)
 *   Row 2: Service Charges: ₹{serviceChargePerUnit} per unit (or total if multiplied)
 *   Row 3: Total Rate: ₹{finalRate} per unit
 * 
 * @param product The product type (e.g., "Education TT")
 * @param amountFCY The amount in foreign currency
 * @param ibrRate The Inter-Bank Rate (Base Rate)
 * @returns Breakdown object with base rate, service charges, and final rate
 */
export const calculateExchangeRateWithBreakdown = (
    product: ProductType,
    amountFCY: number,
    ibrRate: number
): ExchangeRateBreakdown => {
    // Determine Slab based on INR amount
    const amountINR = amountFCY * ibrRate;
    const slab = PRICING_SLABS.find(s => amountINR >= s.min && amountINR <= s.max) || PRICING_SLABS[PRICING_SLABS.length - 1];
    const markupPercent = slab.rates[product];

    // Calculate the service charge per unit (the markup amount)
    const serviceChargePerUnit = ibrRate * (markupPercent / 100);

    // Final Rate = IBR + Service Charge
    const finalRate = ibrRate + serviceChargePerUnit;

    return {
        baseRate: ibrRate,
        markupPercent,
        serviceChargePerUnit,
        finalRate,
        slabRange: `${slab.min}-${slab.max === Infinity ? '∞' : slab.max}`,
    };
};
