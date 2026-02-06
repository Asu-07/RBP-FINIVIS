import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logError, sanitizeError } from "@/lib/errorHandler";
import { forexRates as defaultRates } from "@/data/mockData";
import {
    Save,
    RefreshCw,
    Loader2,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle,
    AlertTriangle,
} from "lucide-react";

interface CurrencyRate {
    currency: string;
    name: string;
    flag: string;
    buyRate: number;
    sellRate: number;
    change: number;
}

export const CurrencyRatesAdmin = () => {
    const [rates, setRates] = useState<CurrencyRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [dbReady, setDbReady] = useState(true);

    useEffect(() => {
        fetchRates();
    }, []);

    const fetchRates = async () => {
        setLoading(true);
        try {
            // Try to fetch from database first
            // Using 'any' cast since currency_rates table may not exist in generated types yet
            const { data, error } = await (supabase as any)
                .from("currency_rates")
                .select("*")
                .order("currency");

            if (error) {
                // Table might not exist - use mock data
                console.warn("Currency rates table not found, using defaults:", error.message);
                setDbReady(false);
                setRates(defaultRates.map(r => ({
                    currency: r.currency,
                    name: r.name,
                    flag: r.flag,
                    buyRate: r.buyRate,
                    sellRate: r.sellRate,
                    change: r.change,
                })));
                setLastUpdated(null);
            } else if (data && data.length > 0) {
                setDbReady(true);
                setRates(data.map(r => ({
                    currency: r.currency,
                    name: r.name,
                    flag: r.flag || "",
                    buyRate: Number(r.buy_rate),
                    sellRate: Number(r.sell_rate),
                    change: Number(r.change) || 0,
                })));
                // Get the most recent update time
                const latestUpdate = data.reduce((latest, r) => {
                    const rDate = new Date(r.updated_at);
                    return rDate > latest ? rDate : latest;
                }, new Date(0));
                setLastUpdated(latestUpdate.toISOString());
            } else {
                // No data in table - seed with defaults
                setDbReady(true);
                setRates(defaultRates.map(r => ({
                    currency: r.currency,
                    name: r.name,
                    flag: r.flag,
                    buyRate: r.buyRate,
                    sellRate: r.sellRate,
                    change: r.change,
                })));
                setLastUpdated(null);
            }
        } catch (err) {
            logError("CurrencyRatesAdmin.fetchRates", err);
            setRates(defaultRates.map(r => ({
                currency: r.currency,
                name: r.name,
                flag: r.flag,
                buyRate: r.buyRate,
                sellRate: r.sellRate,
                change: r.change,
            })));
        } finally {
            setLoading(false);
            setHasChanges(false);
        }
    };

    const handleRateChange = (currency: string, field: "buyRate" | "sellRate", value: string) => {
        const numValue = parseFloat(value) || 0;
        setRates(prev => prev.map(r =>
            r.currency === currency ? { ...r, [field]: numValue } : r
        ));
        setHasChanges(true);
    };

    const saveRates = async () => {
        setSaving(true);
        try {
            const updates = rates.map(r => ({
                currency: r.currency,
                name: r.name,
                flag: r.flag,
                buy_rate: r.buyRate,
                sell_rate: r.sellRate,
                change: r.change,
                updated_at: new Date().toISOString(),
            }));

            // Upsert each rate
            // Using 'any' cast since currency_rates table may not exist in generated types yet
            for (const rate of updates) {
                const { error } = await (supabase as any)
                    .from("currency_rates")
                    .upsert(rate, { onConflict: "currency" });

                if (error) throw error;
            }

            toast.success("Currency rates saved successfully!");
            setHasChanges(false);
            setLastUpdated(new Date().toISOString());
        } catch (err) {
            logError("CurrencyRatesAdmin.saveRates", err);
            toast.error(sanitizeError(err));
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-heading font-bold flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Currency Exchange Rates
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Set buy and sell rates for all supported currencies (relative to INR)
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {lastUpdated && (
                        <Badge variant="outline" className="gap-1">
                            <Clock className="h-3 w-3" />
                            Updated: {formatDate(lastUpdated)}
                        </Badge>
                    )}
                    <Button variant="outline" size="sm" onClick={fetchRates} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                    <Button
                        size="sm"
                        onClick={saveRates}
                        disabled={!hasChanges || saving || !dbReady}
                    >
                        {saving ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Rates
                    </Button>
                </div>
            </div>

            {/* Database Warning */}
            {!dbReady && (
                <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-warning">Database table not found</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            The <code className="bg-muted px-1 rounded">currency_rates</code> table needs to be created in Supabase.
                            Please run the SQL migration provided in the implementation plan.
                            Until then, rates will be read-only from default values.
                        </p>
                    </div>
                </div>
            )}

            {/* Rates Table */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">All Currency Rates</CardTitle>
                    <CardDescription>
                        Buy rate = Rate at which bank buys forex from customer (customer sells).
                        Sell rate = Rate at which bank sells forex to customer (customer buys).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[180px]">Currency</TableHead>
                                    <TableHead>Buy Rate (₹)</TableHead>
                                    <TableHead>Sell Rate (₹)</TableHead>
                                    <TableHead className="w-[100px]">Spread</TableHead>
                                    <TableHead className="w-[80px]">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rates.map((rate) => {
                                    const spread = ((rate.sellRate - rate.buyRate) / rate.buyRate * 100).toFixed(2);
                                    const isValid = rate.buyRate > 0 && rate.sellRate > 0 && rate.sellRate >= rate.buyRate;

                                    return (
                                        <TableRow key={rate.currency}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{rate.flag}</span>
                                                    <div>
                                                        <span className="font-medium">{rate.currency}</span>
                                                        <p className="text-xs text-muted-foreground">{rate.name}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={rate.buyRate}
                                                    onChange={(e) => handleRateChange(rate.currency, "buyRate", e.target.value)}
                                                    className="w-28 h-9"
                                                    disabled={!dbReady}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={rate.sellRate}
                                                    onChange={(e) => handleRateChange(rate.currency, "sellRate", e.target.value)}
                                                    className="w-28 h-9"
                                                    disabled={!dbReady}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-mono">
                                                    {spread}%
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {isValid ? (
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <AlertTriangle className="h-4 w-4 text-destructive" />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Info Box */}
            <div className="p-4 bg-accent/5 rounded-lg border">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    How Rate Changes Work
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Changes take effect immediately across all conversion flows</li>
                    <li>• Affects: Send Money, Currency Exchange, Forex Card Loading</li>
                    <li>• Buy rate should always be lower than sell rate (bank spread)</li>
                    <li>• Rates are stored in INR per unit of foreign currency</li>
                </ul>
            </div>
        </div>
    );
};
