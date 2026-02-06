// Diagnostic Test for Pricing Logic
// Run this in the browser console on the remittance page

import { calculateExchangeRate } from './src/utils/pricing';

// Test Case 1: 50,000 INR for Education TT
const testIBR = 83.75; // USD IBR rate
const testAmount = 50000; // INR
const testFCY = testAmount / testIBR; // ~596.87 USD
const testProduct = "Education TT";

console.log("=== PRICING LOGIC TEST ===");
console.log("Input:", {
    amountINR: testAmount,
    ibrRate: testIBR,
    estimatedFCY: testFCY,
    product: testProduct
});

const calculatedRate = calculateExchangeRate(testProduct, testFCY, testIBR);

console.log("Expected:", {
    slabRange: "0-50,000 INR",
    markupPercent: "3.00%",
    expectedRate: testIBR * 1.03, // 86.2625
});

console.log("Actual Result:", {
    calculatedRate,
    difference: calculatedRate - (testIBR * 1.03)
});

console.log("=== END TEST ===");
