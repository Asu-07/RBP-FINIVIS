import { useRef, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion, useInView, useSpring, useMotionValue, useTransform } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import {
  ShieldCheck, Globe, Building2, Ticket, CreditCard, Plane,
  CheckCircle2, Cpu, Heart, Eye, Lock, Zap, GraduationCap
} from "lucide-react";

// --- Utility Components ---
const Reveal = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const CountUp = ({ value, label }: { value: string, label: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  // Check for special formats like "24/7" that shouldn't be animated
  const isSpecialFormat = /^\d+\/\d+$/.test(value);
  const numValue = isSpecialFormat ? 0 : (parseInt(value.replace(/[^0-9]/g, '')) || 0);
  const suffix = isSpecialFormat ? '' : value.replace(/[0-9]/g, '');

  // Use a spring for smooth counting
  const count = useSpring(0, { duration: 2000 });
  const rounded = useTransform(count, latest => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      count.set(numValue);
    }
  }, [isInView, numValue, count]);

  useEffect(() => {
    const unsubscribe = rounded.on("change", v => setDisplayValue(v));
    return () => unsubscribe();
  }, [rounded]);

  return (
    <div ref={ref} className="text-center group cursor-default">
      <motion.div
        className="text-4xl md:text-5xl font-bold text-[#1a365d] mb-2 group-hover:text-blue-600 transition-colors duration-300"
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {numValue > 0 ? displayValue : value}{suffix}
      </motion.div>
      <div className="text-sm md:text-base text-slate-500 font-bold tracking-widest uppercase group-hover:text-slate-800 transition-colors duration-300">{label}</div>
    </div>
  );
}

const About = () => {
  const stats = [
    { value: "2019", label: "ESTABLISHED" },
    { value: "10000+", label: "HAPPY CUSTOMERS" },
    { value: "100+", label: "COUNTRIES SERVED" },
    { value: "24/7", label: "SUPPORT" },
  ];

  const ecosystem = [
    { title: "Remittances", icon: BanknoteIcon, delay: 0 },
    { title: "Currency Exchange", icon: BriefcaseIcon, delay: 0.1 },
    { title: "Forex Cards", icon: CreditCard, delay: 0.2 },
    { title: "Travel Insurance", icon: Plane, delay: 0.3 },
    { title: "Education Loan", icon: GraduationCap, delay: 0.4 },
  ];

  const whyChoose = [
    {
      title: "Technology-Driven",
      desc: "Our platform automates onboarding, verification, and transaction flows to reduce manual delays.",
      icon: Cpu
    },
    {
      title: "Compliance-First",
      desc: "Every transaction is processed in accordance with RBI and FEMA regulations for maximum security.",
      icon: ShieldCheck
    },
    {
      title: "Customer-Centric",
      desc: "We focus on simplicity, speed, and trust, keeping you informed at every step.",
      icon: Heart
    },
    {
      title: "Global Reach",
      desc: "Facilitating compliant cross-border services between India and key global corridors.",
      icon: Globe
    }
  ];

  const coreValues = [
    {
      title: "Trust & Compliance",
      desc: "We operate within RBI and FEMA guidelines. Compliance is the foundation of everything we build.",
      icon: Lock
    },
    {
      title: "Customer First",
      desc: "Every product decision starts with the customer experience. Simple, transparent, and reliable.",
      icon: UsersIcon
    },
    {
      title: "Technology-Driven Innovation",
      desc: "Automation unlocks scale. We build systems to reduce friction and accelerate processing.",
      icon: Zap
    },
    {
      title: "Transparency",
      desc: "No hidden processes, no unclear pricing. You always know what stage your transaction is in.",
      icon: Eye
    },
    {
      title: "Global Mindset",
      desc: "Building bridges between India and the world through strategic partnerships.",
      icon: Globe
    },
    {
      title: "Responsibility",
      desc: "Security, data protection, and ethical operations guide every interaction.",
      icon: ShieldCheck
    }
  ];

  return (
    <>
      <Helmet><title>About Us | RBP FINIVIS</title></Helmet>
      <Layout>

        {/* --- Hero Section --- */}
        <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 bg-[#0B1E3F] text-white overflow-hidden">
          {/* Background Gradient/Mesh typically seen in modern dark UIs */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#0f254a] to-[#0B1E3F] z-0" />

          {/* Subtle animated background blobs */}
          <motion.div
            animate={{ x: [0, 50, 0], y: [0, -30, 0], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-30 pointer-events-none"
          />
          <motion.div
            animate={{ x: [0, -30, 0], y: [0, 50, 0], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[-100px] left-[-100px] w-80 h-80 bg-indigo-500 rounded-full mix-blend-screen filter blur-[80px] opacity-20 pointer-events-none"
          />

          <div className="container-custom relative z-10 text-center">
            <Reveal>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 text-sm font-medium mb-6 cursor-default transition-colors hover:bg-white/20 hover:text-white"
              >
                RBI Licensed FFMC
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 font-heading tracking-tight">
                <span className="block mb-2">About RBP FINIVIS</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed opacity-90">
                Simplifying foreign exchange and cross-border payments through <span className="font-bold text-white relative inline-block group hover:text-blue-300 transition-colors cursor-default">technology<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-300 transition-all duration-300 group-hover:w-full"></span></span>, <span className="font-bold text-white relative inline-block group hover:text-blue-300 transition-colors cursor-default">compliance<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-300 transition-all duration-300 group-hover:w-full"></span></span>, and <span className="font-bold text-white relative inline-block group hover:text-blue-300 transition-colors cursor-default">automation<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-300 transition-all duration-300 group-hover:w-full"></span></span>.
              </p>
            </Reveal>
          </div>
        </section>

        {/* --- Stats Section --- */}
        <section className="py-12 bg-white border-b border-slate-100">
          <div className="container-custom">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((s, i) => (
                <div key={i}>
                  <CountUp value={s.value} label={s.label} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Not Just Another Forex Company --- */}
        <section className="py-24 bg-slate-50">
          <div className="container-custom text-center">
            <Reveal>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 font-heading">
                Not Just Another Forex Company
              </h2>
              <div className="max-w-4xl mx-auto space-y-4 text-slate-600 leading-relaxed text-lg">
                <p>
                  <strong>RBP FINIVIS</strong> is a next-generation financial services platform. We are an RBI-licensed Full-Fledged Money Changer (FFMC), redefining how individuals and businesses move money globally.
                </p>
                <p>
                  We combine licensed financial infrastructure with modern automation to remove friction from traditionally complex processes like buying currency, sending money abroad, and managing forex cards.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* --- Ecosystem Section --- */}
        <section className="py-20 bg-[#F8FAFC]">
          <div className="container-custom">
            <Reveal>
              <h2 className="text-center text-3xl font-bold text-slate-900 mb-12 font-heading">Our Ecosystem</h2>
            </Reveal>
            <div className="flex flex-wrap justify-center gap-6">
              {ecosystem.map((item, i) => (
                <Reveal key={i} delay={item.delay}>
                  <motion.div
                    whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                    className="bg-white p-8 rounded-3xl shadow-sm transition-all duration-300 flex flex-col items-center text-center aspect-square justify-center border border-slate-100 group cursor-pointer w-[180px] md:w-[220px]"
                  >
                    <motion.div
                      whileHover={{ rotate: 360, backgroundColor: "#eff6ff", color: "#2563eb" }}
                      transition={{ duration: 0.5 }}
                      className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 transition-colors text-slate-600"
                    >
                      <item.icon className="w-8 h-8 transition-colors" />
                    </motion.div>
                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* --- Mission & Vision --- */}
        <section className="py-20 bg-white">
          <div className="container-custom">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Mission */}
              <Reveal>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-10 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden h-full group"
                >
                  <div className="relative z-10">
                    <h3 className="text-3xl font-bold text-[#1a365d] mb-6 group-hover:text-blue-700 transition-colors">Our Mission</h3>
                    <p className="text-slate-600 leading-relaxed mb-4 group-hover:text-slate-800 transition-colors">
                      To simplify global financial access through technology, compliance, and customer-first design. We aim to remove complexity from foreign exchange and cross-border payments.
                    </p>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute right-[-20px] bottom-[-20px] w-48 h-48 bg-blue-50 rounded-full opacity-50 z-0 group-hover:bg-blue-100 transition-colors duration-500"
                  />
                </motion.div>
              </Reveal>

              {/* Vision */}
              <Reveal delay={0.2}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-10 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden h-full group"
                >
                  <div className="relative z-10">
                    <h3 className="text-3xl font-bold text-blue-600 mb-6 group-hover:text-blue-800 transition-colors">Our Vision</h3>
                    <p className="text-slate-600 leading-relaxed group-hover:text-slate-800 transition-colors">
                      To become a trusted global fintech bridge connecting India to the world—powered by automation, built on compliance, and driven by customer experience.
                    </p>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 10, repeat: Infinity, delay: 5 }}
                    className="absolute right-[-20px] bottom-[-20px] w-48 h-48 bg-indigo-50 rounded-full opacity-50 z-0 group-hover:bg-indigo-100 transition-colors duration-500"
                  />
                </motion.div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* --- Why RBP FINIVIS? --- */}
        <section className="py-24 bg-white">
          <div className="container-custom">
            <Reveal>
              <h2 className="text-center text-4xl font-bold text-slate-900 mb-4 font-heading">Why RBP FINIVIS?</h2>
              <p className="text-center text-slate-500 mb-16">The future of forex is digital, compliant, and fast.</p>
            </Reveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {whyChoose.map((item, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <motion.div
                    whileHover={{ y: -8, borderColor: "#3b82f6" }}
                    className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm h-full hover:shadow-lg transition-all duration-300 md:min-h-[280px] flex flex-col"
                  >
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-6 text-slate-800 self-start"
                    >
                      <item.icon className="w-6 h-6" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* --- Compliance Section --- */}
        <section className="py-24 bg-[#F8FAFC]">
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <Reveal>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-sm font-medium mb-6">
                  <ShieldCheck className="w-4 h-4" /> Security First
                </div>
                <h2 className="text-4xl font-bold text-slate-900 mb-6 font-heading">Uncompromising Compliance</h2>
                <p className="text-slate-600 mb-8 text-lg">
                  Trust is our currency. As an <span className="font-bold text-slate-800">RBI-authorized Full-Fledged Money Changer</span>, we don't just follow rules—we champion them.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["KYC Verification", "AML Standards", "CTF Protocols", "FEMA Compliance"].map((item, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="flex items-center gap-2.5 p-4 bg-white rounded-xl border border-slate-200 shadow-sm text-slate-700 font-medium cursor-default"
                    >
                      <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" /> {item}
                    </motion.div>
                  ))}
                </div>
              </Reveal>

              <Reveal delay={0.2}>
                <motion.div
                  whileHover={{ rotate: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-slate-100 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-bl-[100px] -z-0 pointer-events-none group-hover:bg-blue-100/50 transition-colors duration-500" />

                  <div className="flex items-start gap-4 mb-8">
                    <div className="p-3 bg-blue-100 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform duration-300">
                      <Building2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">Company Details</h3>
                      <p className="text-slate-500 text-sm">Official Registry Info</p>
                    </div>
                  </div>

                  <div className="space-y-6 relative z-10">
                    <div className="group/item hover:bg-slate-50 p-2 -mx-2 rounded-lg transition-colors">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Legal Name</div>
                      <div className="text-lg font-bold text-slate-900">RBP FINIVIS Private Limited</div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="group/item hover:bg-slate-50 p-2 -mx-2 rounded-lg transition-colors">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">CIN</div>
                        <div className="text-base font-medium text-slate-700 font-mono">U65990HR2019PTC081650</div>
                      </div>
                      <div className="group/item hover:bg-slate-50 p-2 -mx-2 rounded-lg transition-colors">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">RBI Licence</div>
                        <div className="text-base font-medium text-slate-700 font-mono">CG. FFMC 250/2021</div>
                      </div>
                    </div>
                    <div className="group/item hover:bg-slate-50 p-2 -mx-2 rounded-lg transition-colors">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Registered Address</div>
                      <div className="text-sm text-slate-600 leading-relaxed">
                        Office No – 18, 3rd Floor, Haryana Agro Mall,<br />
                        Sector 20, Panchkula, Haryana - 134117
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* --- Core Values (New Section) --- */}
        <section className="py-24 bg-white">
          <div className="container-custom">
            <Reveal>
              <h2 className="text-center text-4xl font-bold text-slate-900 mb-16 font-heading">Our Core Values</h2>
            </Reveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {coreValues.map((item, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="flex flex-col items-center text-center group"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5, backgroundColor: "#dbeafe", color: "#2563eb" }}
                      className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-6 shadow-sm border border-blue-100 transition-colors"
                    >
                      <item.icon className="w-7 h-7" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">{item.title}</h3>
                    <p className="text-slate-600 leading-relaxed group-hover:text-slate-800 transition-colors">{item.desc}</p>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

      </Layout>
    </>
  );
};

// Simple Icon Wrappers to avoid missing imports if lucide doesn't have them all 
// (or if names are slightly different, but standard ones were used above)
const BanknoteIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="12" x="2" y="6" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M6 12h.01M18 12h.01" /></svg>
)
const BriefcaseIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
)
const UsersIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
)

export default About;
