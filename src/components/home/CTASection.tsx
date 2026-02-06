import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-20 gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-pattern opacity-20" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-primary-foreground"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-6">
            Ready to Send Money?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join over 1 million customers who trust Mego Forex for fast, secure,
            and affordable international transfers.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/send-money">
              <Button variant="hero" size="xl">
                Send Money Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="hero-outline" size="xl">
                Create Free Account
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
