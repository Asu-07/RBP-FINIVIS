import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

export type ServiceType = 
  | "currency_exchange" 
  | "send_money" 
  | "forex_card" 
  | "education_loan"
  | "remittance";

export interface ServiceIntent {
  id: string;
  user_id: string;
  service_type: ServiceType;
  status: string;
  created_at: string;
  last_activity_at: string | null;
}

export interface ServiceApplication {
  id: string;
  user_id: string;
  service_type: ServiceType;
  application_status: string;
  application_data: Record<string, unknown>;
  submitted_at: string | null;
  reviewed_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  action_required: string | null;
  created_at: string;
}

interface ServiceIntentContextType {
  intents: ServiceIntent[];
  applications: ServiceApplication[];
  activeServices: ServiceType[];
  sessionIntent: ServiceType | null;
  loading: boolean;
  captureIntent: (serviceType: ServiceType) => Promise<void>;
  setSessionIntent: (serviceType: ServiceType | null) => void;
  hasService: (serviceType: ServiceType) => boolean;
  getApplication: (serviceType: ServiceType) => ServiceApplication | undefined;
  refreshIntents: () => Promise<void>;
}

const ServiceIntentContext = createContext<ServiceIntentContextType | null>(null);

const SESSION_INTENT_KEY = "rbp_service_intent";

export const ServiceIntentProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [intents, setIntents] = useState<ServiceIntent[]>([]);
  const [applications, setApplications] = useState<ServiceApplication[]>([]);
  const [sessionIntent, setSessionIntentState] = useState<ServiceType | null>(() => {
    // Initialize from session storage
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem(SESSION_INTENT_KEY);
      return stored as ServiceType | null;
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  const activeServices = intents
    .filter((i) => i.status === "active")
    .map((i) => i.service_type);

  const fetchIntents = async () => {
    if (!user) {
      setIntents([]);
      setApplications([]);
      setLoading(false);
      return;
    }

    try {
      const [intentsRes, appsRes] = await Promise.all([
        supabase
          .from("user_service_intents")
          .select("*")
          .eq("user_id", user.id)
          .order("last_activity_at", { ascending: false }),
        supabase
          .from("service_applications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (intentsRes.data) {
        setIntents(intentsRes.data as ServiceIntent[]);
      }
      if (appsRes.data) {
        setApplications(appsRes.data as ServiceApplication[]);
      }
    } catch (error) {
      console.error("Error fetching service intents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntents();
  }, [user]);

  // Migrate session intent to database when user logs in
  useEffect(() => {
    if (user && sessionIntent) {
      captureIntent(sessionIntent);
    }
  }, [user, sessionIntent]);

  const setSessionIntent = (serviceType: ServiceType | null) => {
    setSessionIntentState(serviceType);
    if (serviceType) {
      sessionStorage.setItem(SESSION_INTENT_KEY, serviceType);
    } else {
      sessionStorage.removeItem(SESSION_INTENT_KEY);
    }
  };

  const captureIntent = async (serviceType: ServiceType) => {
    // Always store in session for guests
    setSessionIntent(serviceType);

    if (!user) return;

    try {
      // Upsert the intent
      const { error } = await supabase.from("user_service_intents").upsert(
        {
          user_id: user.id,
          service_type: serviceType,
          status: "active",
          last_activity_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,service_type",
        }
      );

      if (error) {
        console.error("Error capturing intent:", error);
        return;
      }

      // Refresh intents
      await fetchIntents();
    } catch (error) {
      console.error("Error capturing intent:", error);
    }
  };

  const hasService = (serviceType: ServiceType) => {
    return activeServices.includes(serviceType);
  };

  const getApplication = (serviceType: ServiceType) => {
    return applications.find((a) => a.service_type === serviceType);
  };

  return (
    <ServiceIntentContext.Provider
      value={{
        intents,
        applications,
        activeServices,
        sessionIntent,
        loading,
        captureIntent,
        setSessionIntent,
        hasService,
        getApplication,
        refreshIntents: fetchIntents,
      }}
    >
      {children}
    </ServiceIntentContext.Provider>
  );
};

export const useServiceIntent = () => {
  const context = useContext(ServiceIntentContext);
  if (!context) {
    throw new Error("useServiceIntent must be used within ServiceIntentProvider");
  }
  return context;
};
