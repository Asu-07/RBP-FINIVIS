import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock, Shield, Loader2, CheckCircle } from "lucide-react";
import { companyInfo } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Contact = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !email || !subject || !message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("contact_submissions")
        .insert({
          full_name: fullName,
          email: email,
          phone: phone || null,
          subject: subject,
          message: message,
          status: "new",
        });

      if (error) throw error;

      // Send notification email to admin
      await supabase.functions.invoke("send-notification-email", {
        body: {
          type: "contact_submission",
          email: "support@rbpfinivis.com",
          name: "Admin",
          customerName: fullName,
          customerEmail: email,
          customerPhone: phone,
          subject: subject,
          message: message,
        },
      }).catch(console.error);

      setSubmitted(true);
      toast.success("Your message has been sent successfully!");
      
      // Reset form
      setFullName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } catch (error: any) {
      console.error("Error submitting contact form:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <>
        <Helmet>
          <title>Message Sent - RBP FINIVIS</title>
        </Helmet>
        <Layout>
          <section className="py-20">
            <div className="container-custom max-w-lg">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="border-green-500/20 bg-green-500/5">
                  <CardContent className="pt-8 text-center">
                    <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-heading font-bold mb-2">Message Sent!</h2>
                    <p className="text-muted-foreground mb-6">
                      Thank you for contacting us. We'll get back to you within 24 hours on business days.
                    </p>
                    <Button onClick={() => setSubmitted(false)}>
                      Send Another Message
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </section>
        </Layout>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Contact Us - RBP FINIVIS Support</title>
        <meta name="description" content="Get in touch with RBP FINIVIS. We're here to help with your forex, remittance, and payment queries. RBI-licensed FFMC." />
      </Helmet>
      <Layout>
        {/* Hero */}
        <section className="gradient-hero py-20">
          <div className="container-custom text-center text-primary-foreground">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-sm font-medium mb-6">
                We're Here to Help
              </span>
              <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-4">Contact Us</h1>
              <p className="text-primary-foreground/80 max-w-2xl mx-auto">
                Have questions about our services? Our team is ready to assist you with all your forex and remittance needs.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-background">
          <div className="container-custom grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <h2 className="text-2xl font-heading font-bold mb-6">Get in Touch</h2>
              </motion.div>
              
              {[
                { icon: Phone, title: "Phone", value: companyInfo.contact.phone, href: `tel:${companyInfo.contact.phone}` },
                { icon: Mail, title: "Email", value: companyInfo.contact.email, href: `mailto:${companyInfo.contact.email}` },
                { 
                  icon: MapPin, 
                  title: "Registered Office", 
                  value: `${companyInfo.address.line1}, ${companyInfo.address.line2}, ${companyInfo.address.line3}, ${companyInfo.address.state} – ${companyInfo.address.pincode}`,
                  href: null
                },
                { icon: Clock, title: "Business Hours", value: companyInfo.contact.hours, href: null },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="shadow-card">
                    <CardContent className="flex items-start gap-4 pt-6">
                      <div className="p-3 rounded-xl bg-accent/10 shrink-0">
                        <item.icon className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">{item.title}</div>
                        {item.href ? (
                          <a href={item.href} className="font-semibold hover:text-accent transition-colors">
                            {item.value}
                          </a>
                        ) : (
                          <div className="font-semibold">{item.value}</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {/* Regulatory Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Card className="shadow-card bg-primary/5 border-primary/20">
                  <CardContent className="flex items-center gap-4 pt-6">
                    <Shield className="h-10 w-10 text-accent" />
                    <div>
                      <div className="font-semibold">RBI Licensed FFMC</div>
                      <div className="text-sm text-muted-foreground">Licence No: {companyInfo.regulatory.rbiLicence}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-heading font-semibold mb-4">Send us a Message</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Full Name <span className="text-destructive">*</span></Label>
                        <Input 
                          className="mt-2" 
                          placeholder="John Doe" 
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label>Email <span className="text-destructive">*</span></Label>
                        <Input 
                          type="email" 
                          className="mt-2" 
                          placeholder="you@email.com" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Phone Number</Label>
                      <Input 
                        className="mt-2" 
                        placeholder="+91 XXXXX XXXXX" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Subject <span className="text-destructive">*</span></Label>
                      <Input 
                        className="mt-2" 
                        placeholder="How can we help?" 
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Message <span className="text-destructive">*</span></Label>
                      <Textarea 
                        className="mt-2" 
                        rows={4} 
                        placeholder="Tell us more about your query..." 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      />
                    </div>
                    <Button variant="cta" className="w-full" type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Message"
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      We typically respond within 24 hours on business days.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default Contact;
