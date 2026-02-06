import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { faqs } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageCircle, ArrowRight } from "lucide-react";

const FAQ = () => (
  <>
    <Helmet>
      <title>FAQ - Frequently Asked Questions | RBP FINIVIS</title>
      <meta name="description" content="Find answers to common questions about RBP FINIVIS forex services, international remittances, currency exchange, forex cards, and KYC requirements." />
    </Helmet>
    <Layout>
      {/* Hero */}
      <section className="gradient-hero py-20">
        <div className="container-custom text-center text-primary-foreground">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-sm font-medium mb-6">
              Help Center
            </span>
            <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto">
              Find quick answers to common questions about our forex and remittance services.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-background">
        <div className="container-custom max-w-4xl">
          {faqs.map((category, categoryIndex) => (
            <motion.div 
              key={category.category} 
              className="mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: categoryIndex * 0.1 }}
            >
              <h2 className="text-xl font-heading font-semibold mb-4 text-accent flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-sm">
                  {categoryIndex + 1}
                </span>
                {category.category}
              </h2>
              <Accordion type="single" collapsible className="space-y-3">
                {category.questions.map((item, i) => (
                  <AccordionItem 
                    key={i} 
                    value={`${category.category}-${i}`} 
                    className="bg-card rounded-lg border px-4 shadow-sm"
                  >
                    <AccordionTrigger className="text-left font-medium hover:text-accent">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container-custom">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-accent" />
            <h2 className="text-2xl font-heading font-bold mb-4">Still Have Questions?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Can't find what you're looking for? Our support team is here to help you 24/7.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact">
                <Button variant="cta">
                  Contact Support <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Button variant="outline">
                Chat with AI Assistant
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  </>
);

export default FAQ;
