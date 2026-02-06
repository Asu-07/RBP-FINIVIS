import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForexRates, ForexRate } from "@/hooks/useForexRates";
import { TrendingUp, TrendingDown, Search, RefreshCw, Bell, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const ForexRates = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { rates, isLoading, lastUpdated, refetch } = useForexRates();

  const filteredRates = rates.filter(
    (rate) =>
      rate.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rate.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = async () => {
    toast.info("Refreshing rates...");
    await refetch();
    toast.success("Rates updated!");
  };

  const majorCurrencies = ["USD", "EUR", "GBP", "JPY"];
  const asiaCurrencies = ["SGD", "JPY", "AUD", "NZD", "THB"];
  const europeCurrencies = ["EUR", "GBP", "CHF"];

  const filterByCategory = (category: string) => {
    switch (category) {
      case "major":
        return filteredRates.filter((r) => majorCurrencies.includes(r.currency));
      case "asia":
        return filteredRates.filter((r) => asiaCurrencies.includes(r.currency));
      case "europe":
        return filteredRates.filter((r) => europeCurrencies.includes(r.currency));
      default:
        return filteredRates;
    }
  };

  const RatesTable = ({ data }: { data: ForexRate[] }) => (
    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Currency</TableHead>
            <TableHead className="font-semibold text-right">Buy Rate (₹)</TableHead>
            <TableHead className="font-semibold text-right">Sell Rate (₹)</TableHead>
            <TableHead className="font-semibold text-right">Change</TableHead>
            <TableHead className="font-semibold text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((rate) => (
            <TableRow key={rate.currency} className="hover:bg-muted/30">
              <TableCell>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{rate.flag}</span>
                  <div>
                    <div className="font-semibold">{rate.currency}</div>
                    <div className="text-sm text-muted-foreground">{rate.name}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right font-mono font-medium">
                ₹{rate.buyRate.toFixed(2)}
              </TableCell>
              <TableCell className="text-right font-mono font-medium">
                ₹{rate.sellRate.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                <div
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    rate.change >= 0
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {rate.change >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(rate.change).toFixed(2)}%
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link to="/auth">
                    <Button variant="outline" size="sm">Buy</Button>
                  </Link>
                  <Link to="/auth">
                    <Button variant="accent" size="sm">Sell</Button>
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Live Forex Rates - Currency Exchange Rates | RBP FINIVIS</title>
        <meta
          name="description"
          content="Get live forex exchange rates for all major currencies. Compare buy and sell rates, track rate changes, and get the best deal on currency exchange with RBP FINIVIS."
        />
      </Helmet>
      <Layout>
        {/* Hero */}
        <section className="gradient-hero py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern opacity-20" />
          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-primary-foreground"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
                Live Forex Rates
              </h1>
              <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
                Real-time exchange rates for major currencies. Updated every minute. RBI-licensed FFMC.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-12 bg-background">
          <div className="container-custom">
            {/* Last Updated */}
            {lastUpdated && (
              <div className="text-sm text-muted-foreground mb-4">
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </div>
            )}
            
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search currency..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Refresh
                </Button>
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Set Alert
                </Button>
              </div>
            </div>

            {/* Rates Table */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="all">All Currencies</TabsTrigger>
                <TabsTrigger value="major">Major Currencies</TabsTrigger>
                <TabsTrigger value="asia">Asia Pacific</TabsTrigger>
                <TabsTrigger value="europe">Europe</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <RatesTable data={filterByCategory("all")} />
              </TabsContent>
              <TabsContent value="major">
                <RatesTable data={filterByCategory("major")} />
              </TabsContent>
              <TabsContent value="asia">
                <RatesTable data={filterByCategory("asia")} />
              </TabsContent>
              <TabsContent value="europe">
                <RatesTable data={filterByCategory("europe")} />
              </TabsContent>
            </Tabs>

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="p-6 bg-card rounded-xl border border-border shadow-card">
                <h3 className="font-heading font-semibold text-lg mb-2">Best Rate Guarantee</h3>
                <p className="text-sm text-muted-foreground">
                  We guarantee competitive exchange rates. Compare and save on every transaction.
                </p>
              </div>
              <div className="p-6 bg-card rounded-xl border border-border shadow-card">
                <h3 className="font-heading font-semibold text-lg mb-2">Rate Lock Feature</h3>
                <p className="text-sm text-muted-foreground">
                  Lock in current rates for up to 48 hours. Protect yourself from market movements.
                </p>
              </div>
              <div className="p-6 bg-card rounded-xl border border-border shadow-card">
                <h3 className="font-heading font-semibold text-lg mb-2">Rate Alerts</h3>
                <p className="text-sm text-muted-foreground">
                  Set up rate alerts and get notified when your target rate is reached.
                </p>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default ForexRates;
