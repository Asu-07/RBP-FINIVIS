import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, UserPlus, FileCheck, Wallet, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create Account",
    description: "Instant signup with email or phone + OTP verification",
  },
  {
    icon: FileCheck,
    step: "02",
    title: "Complete KYC",
    description: "One-time KYC for individual or business accounts",
  },
  {
    icon: Wallet,
    step: "03",
    title: "Add Funds",
    description: "Add funds via bank transfer or UPI payment",
  },
  {
    icon: Send,
    step: "04",
    title: "Exchange & Send",
    description: "Convert currency and send to beneficiaries worldwide",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">
            Simple. Secure. Swift.
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get started in minutes with our streamlined onboarding process. 
            Quick KYC, competitive rates, and seamless international transfers.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="bg-card rounded-2xl p-6 border border-border shadow-card h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-accent/10">
                    <item.icon className="h-6 w-6 text-accent" />
                  </div>
                  <span className="text-3xl font-heading font-bold text-accent/20">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                  <ArrowRight className="h-6 w-6 text-accent/30" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link to="/how-it-works">
            <Button variant="accent" size="lg">
              Learn More
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
