import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { RatesTicker } from "@/components/home/RatesTicker";
import { CurrencyMarquee } from "@/components/home/CurrencyMarquee";
import { ServicesSection } from "@/components/home/ServicesSection";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CTASection } from "@/components/home/CTASection";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>RBP FINIVIS - Global Payments & Foreign Exchange Platform</title>
        <meta
          name="description"
          content="RBP FINIVIS - Your trusted platform for international remittance, currency exchange, forex cards, and education loans. RBI-licensed Full-Fledged Money Changer (FFMC)."
        />
        <meta
          name="keywords"
          content="forex exchange, international remittance, currency exchange, forex cards, FFMC, RBI licensed, foreign exchange India, send money abroad"
        />
        <link rel="canonical" href="https://rbpfinivis.com" />
      </Helmet>
      <Layout>
        <HeroSection />
        <RatesTicker />
        <CurrencyMarquee />
        <ServicesSection />
        <WhyChooseUs />
        <TestimonialsSection />
        <CTASection />
      </Layout>
    </>
  );
};

export default Index;
