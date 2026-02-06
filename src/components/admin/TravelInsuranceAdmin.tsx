import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { sanitizeError, logError } from "@/lib/errorHandler";
import { format } from "date-fns";
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Download,
  Loader2,
  RefreshCw,
  Plane,
  Users,
  CreditCard,
  AlertTriangle,
} from "lucide-react";

interface Traveller {
  fullName: string;
  dateOfBirth: string;
  email: string;
  mobile: string;
  passportNumber: string;
}

interface TravelInsurancePolicy {
  id: string;
  user_id: string;
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
  coverage_details: unknown;
  policy_status: string;
  payment_status: string;
  payment_method: string | null;
  payment_transaction_id: string | null;
  paid_at: string | null;
  issued_at: string | null;
  has_claim: boolean | null;
  claim_status: string | null;
  claim_details: unknown;
  created_at: string;
  updated_at: string;
  profile?: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
}

export const TravelInsuranceAdmin = () => {
  const [policies, setPolicies] = useState<TravelInsurancePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedPolicy, setSelectedPolicy] = useState<TravelInsurancePolicy | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("travel_insurance_policies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      logError("TravelInsuranceAdmin.fetchPolicies", error);
      toast.error(sanitizeError(error));
    } else {
      // Fetch profiles for each policy
      const policiesWithProfiles = await Promise.all(
        (data || []).map(async (policy) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, email, phone")
            .eq("user_id", policy.user_id)
            .maybeSingle();
          const travellersArray = Array.isArray(policy.travellers) 
            ? (policy.travellers as unknown as Traveller[]) 
            : [];
          return { 
            ...policy, 
            profile: profileData,
            travellers: travellersArray,
            add_ons: policy.add_ons as string[] | null,
          } as TravelInsurancePolicy;
        })
      );
      setPolicies(policiesWithProfiles);
    }
    setLoading(false);
  };

  const updatePolicyStatus = async (policyId: string, status: string) => {
    setUpdating(true);
    const updateData: Record<string, unknown> = { 
      policy_status: status,
      updated_at: new Date().toISOString(),
    };

    if (status === "issued") {
      updateData.issued_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("travel_insurance_policies")
      .update(updateData)
      .eq("id", policyId);

    if (error) {
      toast.error(sanitizeError(error));
    } else {
      toast.success(`Policy ${status}`);
      fetchPolicies();
      
      // Send email notification
      const policy = policies.find(p => p.id === policyId);
      if (policy?.profile?.email) {
        supabase.functions.invoke("send-notification-email", {
          body: {
            type: status === "issued" ? "travel_insurance_issued" : "travel_insurance_cancelled",
            email: policy.profile.email,
            name: policy.profile.full_name || "Customer",
            policyNumber: policy.policy_number,
            destination: policy.destination_country,
            travelDates: `${format(new Date(policy.travel_start_date), "dd MMM yyyy")} - ${format(new Date(policy.travel_end_date), "dd MMM yyyy")}`,
          },
        }).catch((err) => logError("TravelInsuranceAdmin.sendEmail", err));
      }
    }
    setUpdating(false);
    setDetailsOpen(false);
  };

  const updateClaimStatus = async (policyId: string, claimStatus: string) => {
    setUpdating(true);
    const { error } = await supabase
      .from("travel_insurance_policies")
      .update({ 
        claim_status: claimStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", policyId);

    if (error) {
      toast.error(sanitizeError(error));
    } else {
      toast.success(`Claim ${claimStatus}`);
      fetchPolicies();
    }
    setUpdating(false);
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

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getClaimBadge = (status: string | null) => {
    if (!status) return null;
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending Review</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500">In Progress</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredPolicies = policies.filter((policy) => {
    const matchesSearch = 
      policy.policy_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.destination_country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || policy.policy_status === statusFilter;
    const matchesPayment = paymentFilter === "all" || policy.payment_status === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Stats
  const totalPolicies = policies.length;
  const issuedPolicies = policies.filter(p => p.policy_status === "issued").length;
  const pendingPolicies = policies.filter(p => p.policy_status === "pending").length;
  const claimsPending = policies.filter(p => p.has_claim && p.claim_status === "pending").length;
  const totalPremium = policies.filter(p => p.payment_status === "paid").reduce((sum, p) => sum + p.premium_amount, 0);

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
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Policies</p>
                <p className="text-xl font-bold">{totalPolicies}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Issued</p>
                <p className="text-xl font-bold">{issuedPolicies}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-xl font-bold">{pendingPolicies}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={claimsPending > 0 ? "border-orange-500/50 bg-orange-500/5" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Claims Pending</p>
                <p className="text-xl font-bold">{claimsPending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Premium</p>
                <p className="text-xl font-bold">₹{totalPremium.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5" />
                Travel Insurance Policies
              </CardTitle>
              <CardDescription>Manage and review travel insurance policies</CardDescription>
            </div>
            <Button onClick={fetchPolicies} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by policy number, destination, name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Policy #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Travel Dates</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Premium</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPolicies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No policies found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPolicies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell className="font-mono text-sm">{policy.policy_number}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{policy.profile?.full_name || "—"}</p>
                          <p className="text-xs text-muted-foreground">{policy.profile?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{policy.destination_country}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{format(new Date(policy.travel_start_date), "dd MMM yyyy")}</p>
                          <p className="text-muted-foreground">to {format(new Date(policy.travel_end_date), "dd MMM yyyy")}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {policy.selected_plan}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">₹{policy.premium_amount.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(policy.policy_status)}</TableCell>
                      <TableCell>{getPaymentBadge(policy.payment_status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPolicy(policy);
                              setDetailsOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Policy Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Policy Details - {selectedPolicy?.policy_number}
            </DialogTitle>
            <DialogDescription>
              Review policy details, travellers, and manage status
            </DialogDescription>
          </DialogHeader>

          {selectedPolicy && (
            <Tabs defaultValue="details" className="mt-4">
              <TabsList>
                <TabsTrigger value="details">Policy Details</TabsTrigger>
                <TabsTrigger value="travellers">Travellers ({selectedPolicy.number_of_travellers})</TabsTrigger>
                <TabsTrigger value="claims">Claims</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Trip Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Destination:</span>
                        <span className="font-medium">{selectedPolicy.destination_country}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Start Date:</span>
                        <span>{format(new Date(selectedPolicy.travel_start_date), "dd MMM yyyy")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">End Date:</span>
                        <span>{format(new Date(selectedPolicy.travel_end_date), "dd MMM yyyy")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span>{selectedPolicy.trip_duration} days</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Plan & Payment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Plan:</span>
                        <span className="font-medium capitalize">{selectedPolicy.selected_plan}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span>{selectedPolicy.plan_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Premium:</span>
                        <span className="font-bold text-green-600">₹{selectedPolicy.premium_amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment:</span>
                        {getPaymentBadge(selectedPolicy.payment_status)}
                      </div>
                    </CardContent>
                  </Card>
                </div>

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
                    <CardTitle className="text-sm">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span>{selectedPolicy.profile?.full_name || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{selectedPolicy.profile?.email || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span>{selectedPolicy.profile?.phone || "—"}</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="travellers" className="space-y-4">
                {selectedPolicy.travellers.map((traveller, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Traveller {index + 1}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Full Name:</span>
                        <p className="font-medium">{traveller.fullName}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date of Birth:</span>
                        <p>{traveller.dateOfBirth}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <p>{traveller.email}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Mobile:</span>
                        <p>{traveller.mobile}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Passport Number:</span>
                        <p className="font-mono">{traveller.passportNumber}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="claims" className="space-y-4">
                {selectedPolicy.has_claim ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Claim Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4">
                        <span>Current Status:</span>
                        {getClaimBadge(selectedPolicy.claim_status)}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => updateClaimStatus(selectedPolicy.id, "in_progress")}
                          disabled={updating}
                        >
                          Mark In Progress
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => updateClaimStatus(selectedPolicy.id, "approved")}
                          disabled={updating}
                        >
                          Approve Claim
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => updateClaimStatus(selectedPolicy.id, "rejected")}
                          disabled={updating}
                        >
                          Reject Claim
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No claims filed for this policy
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="actions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Policy Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <span>Current Status:</span>
                      {getStatusBadge(selectedPolicy.policy_status)}
                    </div>
                    <div className="flex gap-2">
                      {selectedPolicy.policy_status === "pending" && (
                        <Button
                          onClick={() => updatePolicyStatus(selectedPolicy.id, "issued")}
                          disabled={updating}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                          Issue Policy
                        </Button>
                      )}
                      {selectedPolicy.policy_status !== "cancelled" && (
                        <Button
                          variant="destructive"
                          onClick={() => updatePolicyStatus(selectedPolicy.id, "cancelled")}
                          disabled={updating}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel Policy
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Send Policy Document</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (selectedPolicy.profile?.email) {
                          supabase.functions.invoke("send-notification-email", {
                            body: {
                              type: "travel_insurance_issued",
                              email: selectedPolicy.profile.email,
                              name: selectedPolicy.profile.full_name || "Customer",
                              policyNumber: selectedPolicy.policy_number,
                              destination: selectedPolicy.destination_country,
                              travelDates: `${format(new Date(selectedPolicy.travel_start_date), "dd MMM yyyy")} - ${format(new Date(selectedPolicy.travel_end_date), "dd MMM yyyy")}`,
                            },
                          }).then(() => toast.success("Email sent successfully"))
                            .catch((err) => {
                              logError("TravelInsuranceAdmin.resendEmail", err);
                              toast.error("Failed to send email");
                            });
                        }
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Resend Policy Email
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
