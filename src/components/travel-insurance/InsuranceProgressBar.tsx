import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface InsuranceProgressBarProps {
  currentStep: number;
}

const steps = [
  { number: 1, label: "Trip Details" },
  { number: 2, label: "Plan Selection" },
  { number: 3, label: "Traveller Details" },
  { number: 4, label: "Review" },
  { number: 5, label: "Payment" },
  { number: 6, label: "Policy" },
];

export const InsuranceProgressBar = ({ currentStep }: InsuranceProgressBarProps) => {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.number} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                    backgroundColor: isCompleted || isCurrent 
                      ? "hsl(var(--accent))" 
                      : "hsl(var(--muted))",
                  }}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                    isCompleted || isCurrent
                      ? "text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step.number
                  )}
                </motion.div>
                <span
                  className={cn(
                    "text-xs mt-2 text-center hidden sm:block",
                    isCurrent ? "text-accent font-semibold" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div className="flex-1 h-1 mx-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{
                      width: isCompleted ? "100%" : "0%",
                    }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-accent"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
