import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { InsuranceProgressBar } from "@/components/travel-insurance/InsuranceProgressBar";
import { TripDetailsStep, type TripDetailsData } from "@/components/travel-insurance/TripDetailsStep";
import { PlanSelectionStep, type PlanData } from "@/components/travel-insurance/PlanSelectionStep";
import { TravellerDetailsStep, type TravellersFormData } from "@/components/travel-insurance/TravellerDetailsStep";
import { ReviewConfirmStep } from "@/components/travel-insurance/ReviewConfirmStep";
import { PaymentStep, type PaymentData } from "@/components/travel-insurance/PaymentStep";
import { PolicyIssuedStep } from "@/components/travel-insurance/PolicyIssuedStep";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { toast } from "@/hooks/use-toast";
import { format, differenceInDays } from "date-fns";
import { createPolicy, validatePolicy, type ExternalPolicy } from "@/services/asegoInsuranceService";

type Step = "trip" | "plan" | "traveller" | "review" | "payment" | "issued";

const TravelInsuranceApply = () => {
  const { user } = useAuth();
  const { scrollToTop } = useAutoScroll();
  const [currentStep, setCurrentStep] = useState<Step>("trip");
  const [tripDetails, setTripDetails] = useState<TripDetailsData | null>(null);
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [travellersData, setTravellersData] = useState<TravellersFormData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [policyNumber, setPolicyNumber] = useState("");

  const handleStepChange = (step: Step) => {
    setCurrentStep(step);
    scrollToTop();
  };

  const stepNumber = {
    trip: 1,
    plan: 2,
    traveller: 3,
    review: 4,
    payment: 5,
    issued: 6,
  };

  const handleTripDetailsNext = (data: TripDetailsData) => {
    setTripDetails(data);
    handleStepChange("plan");
  };

  const handlePlanNext = (data: PlanData) => {
    setPlanData(data);
    handleStepChange("traveller");
  };

  const handleTravellerNext = (data: TravellersFormData) => {
    setTravellersData(data);
    handleStepChange("review");
  };

  const handleReviewNext = async () => {
    // Validate policy before payment
    if (!tripDetails || !planData || !travellersData) return;

    setIsProcessing(true);
    try {
      // Construct payload for validation
      const policies = buildPolicyPayload(tripDetails, planData, travellersData);

      // Call validation API
      await validatePolicy(policies);

      // If validation success, proceed to payment
      handleStepChange("payment");
    } catch (error: any) {
      console.error("Validation failed:", error);
      toast({
        title: "Policy Validation Failed",
        description: error.message || "Please check your details and try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const buildPolicyPayload = (
    trip: TripDetailsData,
    plan: PlanData,
    travellers: TravellersFormData
  ): ExternalPolicy[] => {
    // Generate a unique order ID for the group
    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return travellers.travellers.map((t, index) => {
      // Calculate individual premium (simplified)
      // Ideally we should get this from the plan selection step per traveler
      const individualPremium = Math.round(plan.premium / travellers.travellers.length);

      // Find age premium for this traveler
      const agePremium = plan.selectedPlanObject?.agePremiums?.find(ap => ap.age === trip.travellerAges[index]);

      return {
        identity: {
          // Wait, if we send array, maybe they need unique orderId each?
          // Let's safe-guard by appending index
          orderId: `${orderId}-${index + 1}`,
          partnerId: import.meta.env.VITE_ASEGO_PARTNER_ID || '7a954713-2468-4ab2-9b28-34883b10f9bf',
          sign: import.meta.env.VITE_ASEGO_SIGN || 'f13aeea7-2ec2-4abe-8cb8-598e91a99335',
          branchSign: import.meta.env.VITE_ASEGO_BRANCH_SIGN,
          reference: import.meta.env.VITE_ASEGO_REFERENCE || '121f4c34-a3e9-4908-8ea0-32041dfbcc62',
        },
        quotation: {
          travelCategory: trip.destinationCategoryId,
          startDate: format(trip.travelStartDate, 'yyyy-MM-dd'),
          duration: differenceInDays(trip.travelEndDate, trip.travelStartDate) + 1,
          endDate: format(trip.travelEndDate, 'yyyy-MM-dd'),
          destination: trip.destinationCountry
        },
        traveler: {
          name: t.fullName,
          passport: t.passportNumber,
          dob: t.dateOfBirth,
          address: t.address,
          city: t.city,
          district: t.district,
          state: t.state,
          country: 'India', // Assuming source is India
          pincode: t.pincode, // Need to collect pincode? Yes added to TravellerDetails
          mobileNo: t.mobile,
          email: t.email,
          age: trip.travellerAges[index],
          gender: t.gender,
          nominee: t.nominee,
          relation: t.relation,
          finalPremium: agePremium?.premium || individualPremium, // Use exact premium if available
          emergencyContactPerson: t.emergencyContact?.name,
          emergencyContactNumber: t.emergencyContact?.number,
          emergencyEmailId: t.emergencyContact?.email
        },
        selectedPlan: {
          insurerId: plan.insurerId || "",
          totalPremium: agePremium?.premium || individualPremium,
          plan: {
            // Wait, selectedPlanObject is AsegoPlan?
            // The API returns AsegoPlanRoot -> plans: AsegoPlan[]
            // We need the specific plan ID.
            // In PlanSelectionStep we selected a plan.id.
            sellingPlanId: plan.selectedPlanObject?.id || plan.selectedPlan,
            agePremiums: {
              age: trip.travellerAges[index],
              premium: agePremium?.premium || individualPremium
            }
          }
        },
        otherDetails: {}
      } as ExternalPolicy;
    });
  };

  const handlePaymentNext = async (paymentData: PaymentData) => {
    if (!tripDetails || !planData || !travellersData) return;

    setIsProcessing(true);

    try {
      const tripDuration = differenceInDays(tripDetails.travelEndDate, tripDetails.travelStartDate) + 1;

      // 1. Create Policy via API
      const policiesPayload = buildPolicyPayload(tripDetails, planData, travellersData);
      const apiResponse = await createPolicy(policiesPayload);

      console.log("Policy Creation Response:", apiResponse);

      // Extract policy numbers and paths
      // Response is array of { policyNumber, policyFilePath, ... }
      const policyNumbers = Array.isArray(apiResponse)
        ? apiResponse.map((p: any) => p.policyNumber).join(", ")
        : apiResponse?.policyNumber || "PENDING";

      const mainPolicyFilePath = Array.isArray(apiResponse) && apiResponse.length > 0
        ? apiResponse[0].policyFilePath
        : "";

      // 2. Insert into Supabase
      const { data: policy, error } = await supabase
        .from('travel_insurance_policies' as any)
        .insert({
          user_id: user?.id,
          destination_country: tripDetails.destinationCountry,
          travel_start_date: format(tripDetails.travelStartDate, 'yyyy-MM-dd'),
          travel_end_date: format(tripDetails.travelEndDate, 'yyyy-MM-dd'),
          trip_duration: tripDuration,
          plan_type: planData.planType,
          selected_plan: planData.selectedPlan, // ID
          add_ons: planData.addOns,
          premium_amount: planData.premium,
          travellers: travellersData.travellers, // JSON
          number_of_travellers: tripDetails.numberOfTravellers,
          payment_status: 'completed',
          payment_method: paymentData.paymentMethod,
          payment_transaction_id: paymentData.transactionId,
          paid_at: new Date().toISOString(),
          policy_status: 'active', // or 'issued'
          issued_at: new Date().toISOString(),
          policy_number: policyNumbers,
          policy_file_path: mainPolicyFilePath, // Store one for now, or JSON
          api_response: apiResponse // Store full response for debugging/records
        } as any)
        .select('policy_number')
        .single();

      if (error) throw error;

      setPolicyNumber(policyNumbers);
      handleStepChange("issued");

      toast({
        title: "Policy Issued Successfully!",
        description: `Your policy number(s): ${policyNumbers}`,
      });
    } catch (error: any) {
      console.error("Error creating policy:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create policy. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Apply for Travel Insurance | RBP FINIVIS</title>
        <meta
          name="description"
          content="Get instant travel insurance with comprehensive coverage. Apply online in minutes."
        />
      </Helmet>
      <Layout>
        <section className="py-8 bg-muted/30 min-h-[calc(100vh-200px)]">
          <div className="container-custom max-w-4xl">
            {/* Progress Bar */}
            <InsuranceProgressBar currentStep={stepNumber[currentStep]} />

            {/* Step Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === "trip" && (
                  <TripDetailsStep
                    initialData={tripDetails || undefined}
                    onNext={handleTripDetailsNext}
                  />
                )}

                {currentStep === "plan" && tripDetails && (
                  <PlanSelectionStep
                    tripDetails={tripDetails}
                    initialData={planData || undefined}
                    onNext={handlePlanNext}
                    onBack={() => handleStepChange("trip")}
                  />
                )}

                {currentStep === "traveller" && tripDetails && (
                  <TravellerDetailsStep
                    tripDetails={tripDetails}
                    initialData={travellersData || undefined}
                    onNext={handleTravellerNext}
                    onBack={() => handleStepChange("plan")}
                  />
                )}

                {currentStep === "review" && tripDetails && planData && travellersData && (
                  <ReviewConfirmStep
                    tripDetails={tripDetails}
                    planData={planData}
                    travellersData={travellersData}
                    onNext={handleReviewNext}
                    onBack={() => handleStepChange("traveller")}
                  />
                )}

                {currentStep === "payment" && planData && (
                  <PaymentStep
                    planData={planData}
                    onNext={handlePaymentNext}
                    onBack={() => handleStepChange("review")}
                    isProcessing={isProcessing}
                  />
                )}

                {currentStep === "issued" && tripDetails && planData && travellersData && (
                  <PolicyIssuedStep
                    tripDetails={tripDetails}
                    planData={planData}
                    travellersData={travellersData}
                    policyNumber={policyNumber}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default TravelInsuranceApply;
