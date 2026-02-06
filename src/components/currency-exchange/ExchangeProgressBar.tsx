import { CheckCircle } from "lucide-react";
import type { ExchangeStep } from "@/pages/CurrencyExchange";

const steps: { key: ExchangeStep; label: string }[] = [
  { key: "order_details", label: "Order Details" },
  { key: "customer_details", label: "Customer Details" },
  { key: "eligibility", label: "Eligibility Check" },
  { key: "processing", label: "Order Processing" },
  { key: "confirmation", label: "Review & Confirm" },
];

interface ExchangeProgressBarProps {
  currentStep: ExchangeStep;
}

export const ExchangeProgressBar = ({ currentStep }: ExchangeProgressBarProps) => {
  const currentIndex = steps.findIndex(s => s.key === currentStep);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                    transition-colors duration-200
                    ${isCompleted 
                      ? "bg-green-500 text-white" 
                      : isCurrent 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground"
                    }
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`
                  text-xs mt-2 text-center hidden sm:block max-w-[80px]
                  ${isCurrent ? "text-primary font-medium" : "text-muted-foreground"}
                `}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div 
                  className={`
                    h-0.5 flex-1 mx-2
                    ${index < currentIndex ? "bg-green-500" : "bg-muted"}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
