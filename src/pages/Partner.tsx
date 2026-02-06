import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { partnerBenefits } from "@/data/mockData";
import { CheckCircle, ArrowRight, Users, TrendingUp, Shield, Headphones } from "lucide-react";

const Partner = () => (
  <>
    <Helmet>
      <title>Partner With Us - Become an RBP FINIVIS Agent</title>
      <meta name="description" content="Join RBP FINIVIS partner network. Become a forex agent and earn attractive commissions. RBI-licensed FFMC partner program." />
    </Helmet>
    <Layout>
      {/* Hero */}
      <section className="gradient-hero py-20">
        <div className="container-custom text-center text-primary-foreground">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-sm font-medium mb-6">
              Partner Program
            </span>
            <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-4">Partner With RBP FINIVIS</h1>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto">
              Join our growing network of forex agents and earn attractive commissions while helping customers with their forex needs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Users, value: "500+", label: "Active Partners" },
              { icon: TrendingUp, value: "₹50Cr+", label: "Monthly Volume" },
              { icon: Shield, value: "RBI", label: "Licensed FFMC" },
              { icon: Headphones, value: "24/7", label: "Partner Support" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <Card className="shadow-card">
                  <CardContent className="pt-6">
                    <stat.icon className="h-8 w-8 mx-auto mb-2 text-accent" />
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits & Form */}
      <section className="py-16 bg-muted/30">
        <div className="container-custom grid lg:grid-cols-2 gap-12">
          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-heading font-bold mb-6">Why Partner With RBP FINIVIS?</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {partnerBenefits.map((b, i) => (
                <motion.div 
                  key={b.title} 
                  className="flex gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">{b.title}</div>
                    <div className="text-sm text-muted-foreground">{b.description}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h3 className="font-semibold mb-2">Eligibility Criteria</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Registered business entity or individual with valid ID</li>
                <li>• Physical or virtual office space</li>
                <li>• Clean background with no financial defaults</li>
                <li>• Commitment to compliance and customer service</li>
              </ul>
            </div>
          </motion.div>

          {/* Registration Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-heading">Register as Partner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Business Name</Label>
                    <Input className="mt-2" placeholder="Your Company Name" />
                  </div>
                  <div>
                    <Label>Contact Person</Label>
                    <Input className="mt-2" placeholder="Full Name" />
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" className="mt-2" placeholder="you@business.com" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input className="mt-2" placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>City</Label>
                    <Input className="mt-2" placeholder="Your City" />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input className="mt-2" placeholder="Your State" />
                  </div>
                </div>
                <div>
                  <Label>Tell us about your business</Label>
                  <Textarea className="mt-2" rows={3} placeholder="Brief description of your business and why you want to partner..." />
                </div>
                <Button variant="cta" className="w-full">
                  Submit Application <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Our team will review your application and contact you within 2-3 business days.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </Layout>
  </>
);

export default Partner;
