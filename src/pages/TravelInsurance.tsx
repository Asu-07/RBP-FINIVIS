import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  Plane,
  Stethoscope,
  Briefcase,
  FileText,
  Clock,
  ArrowRight,
  CheckCircle,
  Globe,
  Phone,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const TravelInsurance = () => {
  const navigate = useNavigate();

  const coverageHighlights = [
    {
      icon: Stethoscope,
      title: "Medical Emergency",
      description: "Up to $500,000 coverage for medical expenses abroad",
      value: "$500K",
    },
    {
      icon: Briefcase,
      title: "Baggage Protection",
      description: "Coverage for lost, delayed, or damaged baggage",
      value: "$3,000",
    },
    {
      icon: Clock,
      title: "Trip Delay",
      description: "Compensation for flight delays and cancellations",
      value: "$1,500",
    },
    {
      icon: FileText,
      title: "Passport Loss",
      description: "Emergency assistance for lost passport abroad",
      value: "Covered",
    },
  ];

  const additionalBenefits = [
    "24/7 Emergency Assistance Helpline",
    "Cashless Hospitalization at Network Hospitals",
    "Personal Accident Cover",
    "Trip Cancellation Coverage",
    "Emergency Evacuation & Repatriation",
    "Personal Liability Cover",
    "Hijack Distress Allowance",
    "Adventure Sports Coverage (Optional)",
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Enter Trip Details",
      description: "Tell us about your destination and travel dates",
    },
    {
      step: 2,
      title: "Choose Your Plan",
      description: "Select coverage that fits your travel needs",
    },
    {
      step: 3,
      title: "Add Traveller Details",
      description: "Provide information for all travellers",
    },
    {
      step: 4,
      title: "Pay & Get Policy",
      description: "Instant policy issuance with PDF download",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Travel Insurance - Comprehensive Trip Protection | RBP FINIVIS</title>
        <meta
          name="description"
          content="Get comprehensive travel insurance with medical coverage up to $500K, baggage protection, trip delay compensation. Instant policy issuance."
        />
      </Helmet>
      <Layout>
        {/* Hero Section */}
        <section className="gradient-hero py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern opacity-20" />
          <div className="container-custom relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-primary-foreground"
              >
                <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-sm font-medium mb-6">
                  Comprehensive Travel Protection
                </span>
                <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-6">
                  Travel with
                  <br />
                  <span className="text-accent">Complete Peace of Mind</span>
                </h1>
                <p className="text-lg text-primary-foreground/80 mb-8 max-w-lg">
                  Protect your journey with comprehensive travel insurance covering medical emergencies, 
                  trip delays, baggage loss, and more. Get instant policy issuance.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button variant="hero" size="xl" onClick={() => navigate("/travel-insurance-apply")}>
                    Get Quote
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                  <Button variant="hero-outline" size="xl">
                    <Phone className="h-5 w-5 mr-2" />
                    Talk to Expert
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <Card className="bg-card/95 backdrop-blur shadow-2xl">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 rounded-xl bg-accent/10">
                        <Shield className="h-8 w-8 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-lg">Quick Quote</h3>
                        <p className="text-sm text-muted-foreground">Get instant pricing</p>
                      </div>
                    </div>
                    <div className="space-y-4 mb-6">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Medical Coverage</span>
                          <span className="font-semibold text-success">Up to $500,000</span>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Trip Duration</span>
                          <span className="font-semibold">7-365 Days</span>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Starting Premium</span>
                          <span className="font-semibold text-accent">₹299/day</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => navigate("/travel-insurance-apply")}
                    >
                      Get Your Quote
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Coverage Highlights */}
        <section className="py-16 bg-background">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
                Comprehensive Coverage
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our travel insurance covers all major travel risks so you can focus on enjoying your trip.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {coverageHighlights.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full shadow-card hover:shadow-card-hover transition-shadow">
                    <CardContent className="p-6 text-center">
                      <div className="inline-flex p-4 rounded-2xl bg-accent/10 mb-4">
                        <item.icon className="h-8 w-8 text-accent" />
                      </div>
                      <div className="text-2xl font-heading font-bold text-foreground mb-2">
                        {item.value}
                      </div>
                      <h3 className="font-heading font-semibold text-foreground mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Additional Benefits */}
        <section className="py-16 bg-muted/30">
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
                  Everything You Need for Safe Travel
                </h2>
                <p className="text-muted-foreground mb-8">
                  Our comprehensive plans include all essential coverages plus optional add-ons 
                  for adventure sports and trip cancellation.
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {additionalBenefits.map((benefit, index) => (
                    <motion.div
                      key={benefit}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="h-5 w-5 text-success shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card className="shadow-card">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <Globe className="h-10 w-10 text-accent" />
                      <div>
                        <h3 className="font-heading font-bold text-lg">Worldwide Coverage</h3>
                        <p className="text-sm text-muted-foreground">190+ countries covered</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                        <span>Single Trip</span>
                        <span className="font-semibold">From ₹299</span>
                      </div>
                      <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                        <span>Multi-Trip Annual</span>
                        <span className="font-semibold">From ₹4,999</span>
                      </div>
                      <div className="flex justify-between p-3 bg-muted/50 rounded-lg">
                        <span>Student Plan</span>
                        <span className="font-semibold">From ₹12,999</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-background">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
                Get Insured in Minutes
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Simple 4-step process to get your travel insurance policy instantly.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-6">
              {howItWorks.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground font-heading font-bold text-xl flex items-center justify-center mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-heading font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Disclaimers */}
        <section className="py-12 bg-muted/30">
          <div className="container-custom max-w-4xl">
            <Card className="border-warning/30 bg-warning/5">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <AlertTriangle className="h-6 w-6 text-warning shrink-0" />
                  <div className="space-y-2">
                    <h3 className="font-heading font-semibold text-foreground">
                      Important Disclaimers
                    </h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Travel insurance is provided by partner insurers and is subject to policy terms.</li>
                      <li>• Coverage starts only after policy issuance and trip commencement.</li>
                      <li>• Pre-existing medical conditions may have limited or no coverage.</li>
                      <li>• Please read the policy document carefully before purchase.</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center text-primary-foreground"
            >
              <Plane className="h-12 w-12 mx-auto mb-6 text-accent" />
              <h2 className="text-3xl font-heading font-bold mb-4">
                Ready to Travel Safe?
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                Get your travel insurance in just 5 minutes. Instant policy issuance with 
                PDF sent directly to your email.
              </p>
              <Button variant="hero" size="xl" onClick={() => navigate("/travel-insurance-apply")}>
                Get Quote Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </motion.div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default TravelInsurance;
