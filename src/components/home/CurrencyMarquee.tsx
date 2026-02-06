import { motion } from "framer-motion";

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", flag: "🇸🇬" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal", flag: "🇸🇦" },
  { code: "THB", symbol: "฿", name: "Thai Baht", flag: "🇹🇭" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", flag: "🇳🇿" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", flag: "🇭🇰" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona", flag: "🇸🇪" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", flag: "🇲🇾" },
  { code: "QAR", symbol: "﷼", name: "Qatari Riyal", flag: "🇶🇦" },
];

export function CurrencyMarquee() {
  // Double the currencies for seamless loop
  const allCurrencies = [...currencies, ...currencies];

  return (
    <section className="py-12 bg-muted/30 overflow-hidden">
      <div className="container-custom mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Global Coverage
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-2">
            Exchange 30+ Currencies
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Competitive rates for all major world currencies
          </p>
        </motion.div>
      </div>

      {/* First row - left to right */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-muted/30 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-muted/30 to-transparent z-10" />
        
        <motion.div
          className="flex gap-4"
          animate={{
            x: [0, -50 * currencies.length],
          }}
          transition={{
            x: {
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            },
          }}
        >
          {allCurrencies.map((currency, index) => (
            <div
              key={`${currency.code}-${index}`}
              className="flex-shrink-0 flex items-center gap-3 px-6 py-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-accent/30 transition-all duration-300 group"
            >
              <span className="text-3xl">{currency.flag}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-foreground group-hover:text-accent transition-colors">
                    {currency.code}
                  </span>
                  <span className="text-lg text-accent font-semibold">
                    {currency.symbol}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {currency.name}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Second row - right to left */}
      <div className="relative mt-4">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-muted/30 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-muted/30 to-transparent z-10" />
        
        <motion.div
          className="flex gap-4"
          animate={{
            x: [-50 * currencies.length, 0],
          }}
          transition={{
            x: {
              duration: 35,
              repeat: Infinity,
              ease: "linear",
            },
          }}
        >
          {[...allCurrencies].reverse().map((currency, index) => (
            <div
              key={`${currency.code}-rev-${index}`}
              className="flex-shrink-0 flex items-center gap-3 px-6 py-4 bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-accent/30 transition-all duration-300 group"
            >
              <span className="text-3xl">{currency.flag}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-foreground group-hover:text-accent transition-colors">
                    {currency.code}
                  </span>
                  <span className="text-lg text-accent font-semibold">
                    {currency.symbol}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {currency.name}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
