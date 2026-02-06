import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Plane,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Plus,
  Loader2,
  Calendar,
  MapPin,
  Users,
  Shield,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Traveller {
  fullName: string;
  dateOfBirth: string;
  email: string;
  mobile: string;
  passportNumber: string;
}

interface TravelInsurancePolicy {
  id: string;
  policy_number: string;
  destination_country: string;
  travel_start_date: string;
  travel_end_date: string;
  trip_duration: number;
  number_of_travellers: number;
  plan_type: string;
  selected_plan: string;
  premium_amount: number;
  travellers: Traveller[];
  add_ons: string[] | null;
  policy_status: string;
  payment_status: string;
  issued_at: string | null;
  created_at: string;
}

export const TravelInsurancePolicies = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [policies, setPolicies] = useState<TravelInsurancePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState<TravelInsurancePolicy | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPolicies();
    }
  }, [user]);

  const fetchPolicies = async () => {
    if (!user) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from("travel_insurance_policies")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching policies:", error);
      toast.error("Failed to load policies");
    } else {
      setPolicies((data || []).map(p => ({
        ...p,
        travellers: Array.isArray(p.travellers) ? (p.travellers as unknown as Traveller[]) : [],
        add_ons: p.add_ons as string[] | null,
      })));
    }
    setLoading(false);
  };

  const downloadPolicy = (policy: TravelInsurancePolicy) => {
    // Generate a simple policy document (in a real app, this would generate a PDF)
    const policyContent = `
TRAVEL INSURANCE POLICY
========================

Policy Number: ${policy.policy_number}
Issue Date: ${policy.issued_at ? format(new Date(policy.issued_at), "dd MMM yyyy") : "Pending"}

TRIP DETAILS
------------
Destination: ${policy.destination_country}
Travel Period: ${format(new Date(policy.travel_start_date), "dd MMM yyyy")} to ${format(new Date(policy.travel_end_date), "dd MMM yyyy")}
Duration: ${policy.trip_duration} days

PLAN DETAILS
------------
Plan Type: ${policy.plan_type}
Selected Plan: ${policy.selected_plan}
Premium Paid: ₹${policy.premium_amount.toLocaleString()}

TRAVELLERS (${policy.number_of_travellers})
-----------
${policy.travellers.map((t, i) => `
${i + 1}. ${t.fullName}
   DOB: ${t.dateOfBirth}
   Passport: ${t.passportNumber}
`).join("")}

${policy.add_ons && policy.add_ons.length > 0 ? `
ADD-ONS
-------
${policy.add_ons.join(", ")}
` : ""}

IMPORTANT DISCLAIMERS
---------------------
• Travel insurance is provided by partner insurers and is subject to policy terms.
• Coverage starts only after policy issuance and trip commencement.
• For claims, contact our support team with your policy number.

RBP FINIVIS Private Limited
RBI Licensed FFMC
    `;

    const blob = new Blob([policyContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Policy_${policy.policy_number}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Policy downloaded");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "issued":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Issued</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "cancelled":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Cancelled</Badge>;
      case "expired":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const isActive = (policy: TravelInsurancePolicy) => {
    const endDate = new Date(policy.travel_end_date);
    return policy.policy_status === "issued" && endDate >= new Date();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Travel Insurance
              </CardTitle>
              <CardDescription>Your travel insurance policies</CardDescription>
            </div>
            <Button onClick={() => navigate("/travel-insurance")}>
              <Plus className="h-4 w-4 mr-2" />
              New Policy
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {policies.length === 0 ? (
            <div className="text-center py-12">
              <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No policies yet</h3>
              <p className="text-muted-foreground mb-4">
                Get comprehensive travel insurance for your next trip
              </p>
              <Button onClick={() => navigate("/travel-insurance")}>
                Get Travel Insurance
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {policies.map((policy) => (
                <Card key={policy.id} className={isActive(policy) ? "border-green-500/50 bg-green-500/5" : ""}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Plane className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm font-medium">{policy.policy_number}</span>
                            {getStatusBadge(policy.policy_status)}
                            {isActive(policy) && (
                              <Badge variant="outline" className="text-green-600 border-green-500">
                                Active
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {policy.destination_country}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(policy.travel_start_date), "dd MMM")} - {format(new Date(policy.travel_end_date), "dd MMM yyyy")}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {policy.number_of_travellers} traveller{policy.number_of_travellers > 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="mt-2">
                            <Badge variant="secondary" className="capitalize mr-2">
                              {policy.selected_plan} Plan
                            </Badge>
                            <span className="text-sm font-medium">₹{policy.premium_amount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPolicy(policy);
                            setDetailsOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {policy.policy_status === "issued" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadPolicy(policy)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Policy Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Policy Details
            </DialogTitle>
            <DialogDescription>
              {selectedPolicy?.policy_number}
            </DialogDescription>
          </DialogHeader>

          {selectedPolicy && (
            <div className="space-y-6 mt-4">
              <div className="flex items-center justify-between">
                <span>Status:</span>
                {getStatusBadge(selectedPolicy.policy_status)}
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Trip Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Destination:</span>
                    <p className="font-medium">{selectedPolicy.destination_country}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <p className="font-medium">{selectedPolicy.trip_duration} days</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Travel Start:</span>
                    <p>{format(new Date(selectedPolicy.travel_start_date), "dd MMM yyyy")}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Travel End:</span>
                    <p>{format(new Date(selectedPolicy.travel_end_date), "dd MMM yyyy")}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Plan Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Plan Type:</span>
                    <p className="font-medium">{selectedPolicy.plan_type}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Selected Plan:</span>
                    <p className="font-medium capitalize">{selectedPolicy.selected_plan}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Premium:</span>
                    <p className="font-bold text-green-600">₹{selectedPolicy.premium_amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Issue Date:</span>
                    <p>{selectedPolicy.issued_at ? format(new Date(selectedPolicy.issued_at), "dd MMM yyyy") : "Pending"}</p>
                  </div>
                </CardContent>
              </Card>

              {selectedPolicy.add_ons && selectedPolicy.add_ons.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Add-ons</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedPolicy.add_ons.map((addon, idx) => (
                        <Badge key={idx} variant="secondary">{addon}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Travellers ({selectedPolicy.number_of_travellers})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedPolicy.travellers.map((traveller, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg">
                      <p className="font-medium">{traveller.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        DOB: {traveller.dateOfBirth} | Passport: {traveller.passportNumber}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {selectedPolicy.policy_status === "issued" && (
                <Button className="w-full" onClick={() => downloadPolicy(selectedPolicy)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Policy Document
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
