import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import { ServiceIntentProvider } from "@/hooks/useServiceIntent";
import { ScrollToTop } from "@/components/ScrollToTop";
import { CookieConsent } from "@/components/CookieConsent";
import WhatsAppButton from "@/components/WhatsAppButton";
import Index from "./pages/Index";
import SendMoney from "./pages/SendMoney";
import ForexRates from "./pages/ForexRates";
import ForexCards from "./pages/ForexCards";

import Gallery from "./pages/Gallery";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Partner from "./pages/Partner";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Compliance from "./pages/Compliance";
import Refund from "./pages/Refund";

import CookiePolicy from "./pages/CookiePolicy";
import AcceptableUse from "./pages/AcceptableUse";
import LegalDisclaimer from "./pages/LegalDisclaimer";
import ComplaintsHandling from "./pages/ComplaintsHandling";
import AmlKycPolicy from "./pages/AmlKycPolicy";
import CurrencyExchange from "./pages/CurrencyExchange";
import Remittance from "./pages/Remittance";
import EducationLoan from "./pages/EducationLoan";
import ForexCardApply from "./pages/ForexCardApply";
import EducationLoanApply from "./pages/EducationLoanApply";
import TravelInsurance from "./pages/TravelInsurance";
import TravelInsuranceApply from "./pages/TravelInsuranceApply";
import NotFound from "./pages/NotFound";
import AdminDocuments from "./pages/AdminDocuments";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <ServiceIntentProvider>
            <Toaster />
            <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/send-money" element={<SendMoney />} />
              
              <Route path="/forex-rates" element={<ForexRates />} />
              <Route path="/forex-cards" element={<ForexCards />} />
              
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/partner" element={<Partner />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/compliance" element={<Compliance />} />
              <Route path="/refund" element={<Refund />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route path="/acceptable-use" element={<AcceptableUse />} />
              <Route path="/legal-disclaimer" element={<LegalDisclaimer />} />
              <Route path="/complaints" element={<ComplaintsHandling />} />
              <Route path="/aml-kyc-policy" element={<AmlKycPolicy />} />
              <Route path="/currency-exchange" element={<CurrencyExchange />} />
              <Route path="/remittance" element={<Remittance />} />
              <Route path="/education-loan" element={<EducationLoan />} />
              <Route path="/forex-card-apply" element={<ForexCardApply />} />
              <Route path="/education-loan-apply" element={<EducationLoanApply />} />
              <Route path="/travel-insurance" element={<TravelInsurance />} />
              <Route path="/travel-insurance-apply" element={<TravelInsuranceApply />} />
              <Route path="*" element={<NotFound />} />
              <Route path="/admin/documents" element={<AdminDocuments />} />
            </Routes>
              <CookieConsent />
              <WhatsAppButton />
            </BrowserRouter>
          </ServiceIntentProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
