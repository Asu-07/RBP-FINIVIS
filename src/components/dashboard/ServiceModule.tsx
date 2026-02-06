import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LucideIcon, AlertCircle, CheckCircle, Clock, XCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface ServiceModuleProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  status?: "active" | "pending" | "completed" | "action_required" | "rejected";
  statusLabel?: string;
  actionRequired?: string;
  children: ReactNode;
  onAction?: () => void;
  actionLabel?: string;
}

const statusConfig = {
  active: {
    color: "bg-blue-500",
    icon: CheckCircle,
    label: "Active",
  },
  pending: {
    color: "bg-yellow-500",
    icon: Clock,
    label: "Processing",
  },
  completed: {
    color: "bg-green-500",
    icon: CheckCircle,
    label: "Completed",
  },
  action_required: {
    color: "bg-orange-500",
    icon: AlertCircle,
    label: "Action Required",
  },
  rejected: {
    color: "bg-red-500",
    icon: XCircle,
    label: "Rejected",
  },
};

export const ServiceModule = ({
  title,
  description,
  icon: Icon,
  status,
  statusLabel,
  actionRequired,
  children,
  onAction,
  actionLabel,
}: ServiceModuleProps) => {
  const config = status ? statusConfig[status] : null;
  const StatusIcon = config?.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-card hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{title}</CardTitle>
                {description && (
                  <CardDescription className="mt-0.5">{description}</CardDescription>
                )}
              </div>
            </div>
            {status && config && (
              <Badge className={`${config.color} gap-1`}>
                {StatusIcon && <StatusIcon className="h-3 w-3" />}
                {statusLabel || config.label}
              </Badge>
            )}
          </div>
          
          {actionRequired && (
            <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
              <span className="text-sm text-orange-700 dark:text-orange-300">
                {actionRequired}
              </span>
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          {children}
          
          {onAction && actionLabel && (
            <Button 
              onClick={onAction} 
              className="w-full mt-4"
              variant="outline"
            >
              {actionLabel}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
