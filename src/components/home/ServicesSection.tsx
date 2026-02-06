import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Send,
  CreditCard,
  TrendingUp,
  ArrowRight,
  GraduationCap,
  Shield,
  Plane,
} from "lucide-react";
import { companyInfo } from "@/data/mockData";

const services = [
  {
    icon: Send,
    title: "Send Money Abroad",
    subtitle: "International Remittance",
    description:
      "Transfer money to 100+ countries with competitive rates and low fees. Fast, secure transfers compliant with FEMA & LRS guidelines.",
    href: "/send-money",
    color: "from-teal-500 to-teal-600",
    cta: "Start Transfer",
  },
  {
    icon: TrendingUp,
    title: "Currency Exchange",
    subtitle: "Buy & Sell Foreign Currency",
    description:
      "Exchange currencies at competitive rates with doorstep delivery. Real-time market rates with transparent pricing.",
    href: "/currency-exchange",
    color: "from-blue-500 to-blue-600",
    cta: "Exchange Now",
  },
  {
    icon: CreditCard,
    title: "Forex Cards",
    subtitle: "Multi-Currency Travel Cards",
    description:
      "Load 16+ currencies on a single card. Zero forex markup, global acceptance at 45M+ merchants. Perfect for travel.",
    href: "/forex-cards",
    color: "from-orange-500 to-orange-600",
    cta: "Get Card",
  },
  {
    icon: Plane,
    title: "Travel Insurance",
    subtitle: "Comprehensive Travel Protection",
    description:
      "Get comprehensive travel insurance through our partner insurers. Coverage for medical emergencies, trip cancellation, and more.",
    href: "/travel-insurance",
    color: "from-purple-500 to-purple-600",
    cta: "Get Quote",
  },
  {
    icon: GraduationCap,
    title: "Education Loan",
    subtitle: "Study Abroad Financing",
    description:
      "Finance your study abroad dreams with competitive education loans. Easy EMI options, quick approval, and partner banks.",
    href: "/education-loan",
    color: "from-emerald-500 to-emerald-600",
    cta: "Apply Now",
  },
];

export function ServicesSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Our Products
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">
            Complete Foreign Exchange Solutions
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            One account. One KYC. All services unlocked. From personal remittances to 
            corporate forex, we offer comprehensive solutions for all your FX needs.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={service.href}
                className="group block h-full p-6 bg-card rounded-2xl border border-border shadow-card hover:shadow-card-hover transition-all duration-300"
              >
                <div
                  className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${service.color} mb-4`}
                >
                  <service.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="mb-2">
                  <h3 className="text-xl font-heading font-semibold text-foreground group-hover:text-accent transition-colors">
                    {service.title}
                  </h3>
                  <span className="text-xs font-medium text-accent uppercase tracking-wide">
                    {service.subtitle}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  {service.description}
                </p>
                <div className="flex items-center text-accent font-semibold text-sm">
                  {service.cta}
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Regulatory Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 p-4 bg-muted/50 rounded-xl border border-border flex flex-col sm:flex-row items-start sm:items-center gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="font-heading font-semibold text-sm">RBI Licensed FFMC</p>
              <p className="text-xs text-muted-foreground">Licence No. {companyInfo.regulatory.rbiLicence}</p>
            </div>
          </div>
          <div className="flex-1 text-xs text-muted-foreground">
            All forex services are regulated by RBI under FEMA. Remittances processed under LRS guidelines (limit: USD 2,50,000/FY). 
            Mandatory KYC required for all transactions.
          </div>
          <Link to="/compliance" className="text-xs text-accent hover:underline whitespace-nowrap">
            View Compliance →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
