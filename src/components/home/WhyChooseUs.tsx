import { motion } from "framer-motion";
import { Shield, Clock, Award, Users, HeadphonesIcon, Globe } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Bank-Level Security",
    description: "256-bit SSL encryption and PCI-DSS compliance for all transactions",
  },
  {
    icon: Clock,
    title: "Fast Transfers",
    description: "Same-day transfers to most destinations, express options available",
  },
  {
    icon: Award,
    title: "Best Rates",
    description: "Competitive exchange rates with zero hidden fees or markups",
  },
  {
    icon: Users,
    title: "1M+ Customers",
    description: "Trusted by over a million customers for their forex needs",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Support",
    description: "Round-the-clock customer support via phone, email, and chat",
  },
  {
    icon: Globe,
    title: "100+ Countries",
    description: "Send money to over 100 countries across 6 continents",
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              Why Mego Forex
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-6">
              Your Trusted Partner for
              <br />
              <span className="text-accent">International Transfers</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              We combine cutting-edge technology with exceptional service to deliver
              the best forex experience. Whether you're sending money home or
              preparing for international travel, we've got you covered.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-card rounded-xl border border-border">
                <div className="text-3xl font-heading font-bold text-accent mb-1">
                  ₹500Cr+
                </div>
                <div className="text-sm text-muted-foreground">
                  Processed annually
                </div>
              </div>
              <div className="p-4 bg-card rounded-xl border border-border">
                <div className="text-3xl font-heading font-bold text-accent mb-1">
                  4.8/5
                </div>
                <div className="text-sm text-muted-foreground">
                  Customer rating
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-5 bg-card rounded-xl border border-border shadow-card"
              >
                <div className="inline-flex p-2.5 rounded-lg bg-accent/10 mb-3">
                  <feature.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
