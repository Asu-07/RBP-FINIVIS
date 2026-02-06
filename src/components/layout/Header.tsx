import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Phone, User, LogIn, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAccess } from "@/hooks/useAdminAccess";


const navigation = [
  {
    name: "Products",
    href: "#",
    children: [
      { name: "Send Money Abroad", href: "/send-money", description: "International outward remittance to 100+ countries" },
      { name: "Currency Exchange", href: "/currency-exchange", description: "Buy & sell foreign currencies" },
      { name: "Forex Cards", href: "/forex-cards", description: "Multi-currency travel card for global use" },
      { name: "Travel Insurance", href: "/travel-insurance", description: "Comprehensive travel protection plans" },
      { name: "Education Loan", href: "/education-loan", description: "Study abroad financing options" },
    ],
  },
  { name: "Live Rates", href: "/forex-rates" },
  { name: "Gallery", href: "/gallery" },
  { name: "Partners", href: "/partner" },
  { name: "Help & FAQ", href: "/faq" },
];

export function Header() {
  const { user } = useAuth();
  const { isAdmin } = useAdminAccess();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    // Initial check
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProductsOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        // Always visible with background - fix for visibility issue
        "bg-card/98 backdrop-blur-lg shadow-sm border-b border-border/50",
        scrolled && "shadow-card"
      )}
    >
      <nav className="container-custom">
        <div className="flex h-20 lg:h-24 items-center justify-between">
          {/* Logo - Increased size for premium look */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img
              src="/header.png"
              alt="RBP FINIVIS - Global Payments Platform"
              className="h-16 sm:h-20 lg:h-24 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-1">
            {navigation.map((item) =>
              item.children ? (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => setProductsOpen(true)}
                  onMouseLeave={() => setProductsOpen(false)}
                >
                  <button
                    className={cn(
                      "flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                      "text-foreground hover:text-accent hover:bg-accent/5"
                    )}
                  >
                    {item.name}
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        productsOpen && "rotate-180"
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {productsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 top-full pt-2"
                      >
                        <div className="w-80 rounded-xl bg-card shadow-xl border border-border p-2">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              to={child.href}
                              className="block rounded-lg px-4 py-3 hover:bg-accent/10 transition-colors group"
                            >
                              <span className="block text-sm font-semibold text-foreground group-hover:text-accent">
                                {child.name}
                              </span>
                              <span className="block text-xs text-muted-foreground mt-0.5">
                                {child.description}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
                    location.pathname === item.href
                      ? "text-accent bg-accent/10"
                      : "text-foreground hover:text-accent hover:bg-accent/5"
                  )}
                >
                  {item.name}
                </Link>
              )
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="tel:+917717309363"
              className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors whitespace-nowrap"
            >
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium">+91 7717309363</span>
            </a>

            {user ? (
              <Link to="/dashboard" className="hidden sm:block">
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/auth" className="hidden sm:block">
                <Button variant="outline" size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              </Link>
            )}

            {/* Admin Dashboard Button - Only visible to admins */}
            {isAdmin && (
              <Link to="/admin" className="hidden sm:block">
                <Button variant="default" size="sm" className="gap-2 bg-amber-600 hover:bg-amber-700 text-white">
                  <Shield className="h-4 w-4" />
                  Admin
                </Button>
              </Link>
            )}

            <Link to="/send-money" className="hidden sm:block">
              <Button variant="accent" size="sm">
                Send Money
              </Button>
            </Link>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-accent/10 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden bg-card rounded-b-xl"
            >
              <div className="py-4 space-y-1 border-t border-border">
                {navigation.map((item) =>
                  item.children ? (
                    <div key={item.name}>
                      <button
                        onClick={() => setProductsOpen(!productsOpen)}
                        className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-lg hover:bg-accent/10"
                      >
                        {item.name}
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            productsOpen && "rotate-180"
                          )}
                        />
                      </button>
                      <AnimatePresence>
                        {productsOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="ml-4 space-y-1 bg-muted/50 rounded-lg py-2"
                          >
                            {item.children.map((child) => (
                              <Link
                                key={child.name}
                                to={child.href}
                                className="block px-4 py-2.5"
                              >
                                <span className="block text-sm font-medium text-foreground">
                                  {child.name}
                                </span>
                                <span className="block text-xs text-muted-foreground">
                                  {child.description}
                                </span>
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "block px-4 py-3 text-sm font-medium rounded-lg",
                        location.pathname === item.href
                          ? "text-accent bg-accent/10"
                          : "hover:bg-accent/10"
                      )}
                    >
                      {item.name}
                    </Link>
                  )
                )}
                <div className="pt-4 px-4 space-y-2 border-t border-border mt-4">
                  {user ? (
                    <Link to="/dashboard" className="block">
                      <Button variant="outline" className="w-full gap-2">
                        <User className="h-4 w-4" />
                        Go to Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/auth" className="block">
                      <Button variant="outline" className="w-full gap-2">
                        <LogIn className="h-4 w-4" />
                        Login / Register
                      </Button>
                    </Link>
                  )}
                  {/* Admin Dashboard Button - Mobile */}
                  {isAdmin && (
                    <Link to="/admin" className="block">
                      <Button variant="default" className="w-full gap-2 bg-amber-600 hover:bg-amber-700 text-white">
                        <Shield className="h-4 w-4" />
                        Admin Dashboard
                      </Button>
                    </Link>
                  )}
                  <Link to="/send-money" className="block">
                    <Button variant="accent" className="w-full">
                      Send Money Now
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
