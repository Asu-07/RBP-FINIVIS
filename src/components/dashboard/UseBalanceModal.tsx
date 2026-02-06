import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Banknote, 
  Send, 
  CreditCard, 
  Shield,
  ArrowRight,
  Info,
} from "lucide-react";

interface UseBalanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableBalance: number;
}

const services = [
  {
    id: "currency_exchange",
    name: "Currency Exchange",
    description: "Buy or sell foreign currency",
    icon: Banknote,
    route: "/currency-exchange",
  },
  {
    id: "remittance",
    name: "International Remittance",
    description: "Send money abroad",
    icon: Send,
    route: "/send-money",
  },
  {
    id: "forex_card",
    name: "Forex Card",
    description: "Apply for a prepaid forex card",
    icon: CreditCard,
    route: "/forex-cards/apply",
  },
  {
    id: "travel_insurance",
    name: "Travel Insurance",
    description: "Get coverage for your trip",
    icon: Shield,
    route: "/travel-insurance/apply",
  },
];

export const UseBalanceModal = ({
  open,
  onOpenChange,
  availableBalance,
}: UseBalanceModalProps) => {
  const navigate = useNavigate();

  const handleSelectService = (route: string) => {
    // Store the balance usage intent in sessionStorage
    sessionStorage.setItem("useRefundableBalance", "true");
    sessionStorage.setItem("refundableBalanceAmount", availableBalance.toString());
    onOpenChange(false);
    navigate(route);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Use Your Refundable Balance</DialogTitle>
          <DialogDescription>
            Apply your balance of ₹{availableBalance.toLocaleString()} towards any of our services
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => handleSelectService(service.route)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-left group"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <service.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{service.name}</p>
                <p className="text-sm text-muted-foreground">
                  {service.description}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          ))}
        </div>

        {/* Info Note */}
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            Your balance will be automatically applied during checkout. If the order value exceeds your balance, you'll only need to pay the difference.
          </p>
        </div>

        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
};
