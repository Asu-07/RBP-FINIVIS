import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isAdmin } from "@/utils/isAdmin";
import { ChevronDown, ChevronUp, FileText, Mail, Phone, Calendar } from "lucide-react";

/* =====================
   TYPES (MATCH DB)
===================== */
type UserProfile = {
  user_id: string;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  created_at: string;
};

type KycDocument = {
  id: string;
  user_id: string;
  order_id: string | null;
  service_type: string;
  document_type: string;
  storage_bucket: string;
  storage_path: string;
  status: "pending" | "verified" | "rejected";
  created_at: string;
  verified_at: string | null;
  rejection_reason: string | null;
};

type ServiceRequest = {
  id: string;
  user_id: string;
  service_type: string;
  status: string;
  amount: number | null;
  created_at: string;
};

type UserWithData = {
  profile: UserProfile;
  documents: KycDocument[];
  serviceRequests: ServiceRequest[];
};

/* =====================
   COMPONENT
===================== */
export default function AdminDocuments() {
  const navigate = useNavigate();
  const [usersData, setUsersData] = useState<UserWithData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [totalDocs, setTotalDocs] = useState<number | null>(null);
  const [totalProfiles, setTotalProfiles] = useState<number | null>(null);
  const [rawDocs, setRawDocs] = useState<any[] | null>(null);
  const [rawProfilesData, setRawProfilesData] = useState<any[] | null>(null);
  const [rawTransactions, setRawTransactions] = useState<any[] | null>(null);
  const [lastFetchError, setLastFetchError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const allowed = await isAdmin();
        if (!allowed) {
          navigate("/");
          return;
        }

        // Fetch all documents
        const { data: allDocs, error: docsError } = await supabase
          .from("kyc_documents")
          .select(`*`)
          .order("created_at", { ascending: false }) as {
            data: KycDocument[] | null;
            error: any;
          };

        if (docsError) throw docsError;

        // Get unique user IDs
        const userIds = [...new Set((allDocs ?? []).map(doc => doc.user_id))];

        // If no users found, set empty and return
        if (userIds.length === 0) {
          setUsersData([]);
          return;
        }

        // Fetch user profiles
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("user_id, email, full_name, phone_number, created_at")
          .in("user_id", userIds) as {
            data: UserProfile[] | null;
            error: any;
          };

        if (profilesError) throw profilesError;

        // Fetch service requests from transactions table
        const { data: transactions, error: txError } = await supabase
          .from("transactions")
          .select("id, user_id, transaction_type, status, source_amount, created_at")
          .in("user_id", userIds)
          .order("created_at", { ascending: false }) as {
            data: any[] | null;
            error: any;
          };

        if (txError) throw txError;

        // Transform transactions to ServiceRequest format
        const serviceRequests: ServiceRequest[] = (transactions ?? []).map(tx => ({
          id: tx.id,
          user_id: tx.user_id,
          service_type: tx.transaction_type || "transfer",
          status: tx.status,
          amount: tx.source_amount,
          created_at: tx.created_at,
        }));

        // Group data by user
        const groupedData: UserWithData[] = (profiles ?? []).map(profile => ({
          profile,
          documents: (allDocs ?? []).filter(doc => doc.user_id === profile.user_id),
          serviceRequests: serviceRequests.filter(req => req.user_id === profile.user_id),
        })).sort((a, b) => 
          new Date(b.profile.created_at).getTime() - new Date(a.profile.created_at).getTime()
        );

        setUsersData(groupedData);
        setTotalDocs((allDocs ?? []).length);
        setTotalProfiles((profiles ?? []).length);
        setRawDocs(allDocs ?? []);
        setRawProfilesData(profiles ?? []);
        setRawTransactions(transactions ?? []);
        setLastFetchError(null);
      } catch (error) {
        console.error("Error fetching admin data:", error);
        // If there's an error, ensure we don't leave the spinner running
        setUsersData([]);
        setTotalDocs(0);
        setTotalProfiles(0);
        setRawDocs([]);
        setRawProfilesData([]);
        setRawTransactions([]);
        setLastFetchError(error?.message ? String(error.message) : String(error));
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const getFileUrl = (doc: KycDocument) =>
    supabase.storage
      .from(doc.storage_bucket)
      .getPublicUrl(doc.storage_path).data.publicUrl;

  const statusVariant = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    if (status === "verified" || status === "completed" || status === "success") return "default";
    if (status === "rejected" || status === "failed") return "destructive";
    if (status === "pending") return "secondary";
    return "outline";
  };

  const filteredUsers = usersData.filter(user => 
    user.profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.profile.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading documents…</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Documents</h1>
          <p className="text-gray-600">View user documents and service requests</p>
            {typeof totalDocs === "number" && typeof totalProfiles === "number" && (
              <p className="text-sm text-gray-500 mt-1">
                Fetched <span className="font-medium">{totalDocs}</span> documents across <span className="font-medium">{totalProfiles}</span> profiles
              </p>
            )}

            <div className="mt-3">
              <Button size="sm" variant="ghost" onClick={() => setShowDebug((s) => !s)}>
                {showDebug ? "Hide debug" : "Show debug"}
              </Button>
              {showDebug && (
                <div className="mt-3 p-3 bg-gray-50 border rounded text-xs text-gray-700">
                  <div className="mb-2"><strong>Last fetch error:</strong> {lastFetchError ?? "none"}</div>
                  <div className="mb-2"><strong>Documents (first 5):</strong>
                    <pre className="mt-1 max-h-40 overflow-auto">{JSON.stringify((rawDocs ?? []).slice(0,5), null, 2)}</pre>
                  </div>
                  <div className="mb-2"><strong>Profiles (first 5):</strong>
                    <pre className="mt-1 max-h-40 overflow-auto">{JSON.stringify((rawProfilesData ?? []).slice(0,5), null, 2)}</pre>
                  </div>
                  <div><strong>Transactions (first 5):</strong>
                    <pre className="mt-1 max-h-40 overflow-auto">{JSON.stringify((rawTransactions ?? []).slice(0,5), null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <Input
            placeholder="Search by email, name, or user ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Users Count */}
        <div className="mb-4 text-sm text-gray-600">
          Found <span className="font-semibold">{filteredUsers.length}</span> user{filteredUsers.length !== 1 ? "s" : ""} with documents
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {filteredUsers.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No documents found.</p>
            </div>
          )}

          {filteredUsers.map((user) => (
            <div
              key={user.profile.user_id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* User Header */}
              <div
                onClick={() => setExpandedUser(
                  expandedUser === user.profile.user_id ? null : user.profile.user_id
                )}
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 flex items-center gap-2">
                    {user.profile.full_name || "Unknown User"}
                    <Badge variant="outline" className="text-xs">
                      {user.documents.length} doc{user.documents.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {user.profile.email}
                    </div>
                    {user.profile.phone_number && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {user.profile.phone_number}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Joined {new Date(user.profile.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="ml-4">
                  {expandedUser === user.profile.user_id ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedUser === user.profile.user_id && (
                <div className="border-t bg-gray-50 p-4 space-y-6">
                  {/* User ID */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-2">User ID</p>
                    <code className="text-sm bg-gray-900 text-white p-2 rounded block break-all font-mono">
                      {user.profile.user_id}
                    </code>
                  </div>

                  {/* Documents Section */}
                  {user.documents.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-3">
                        Documents ({user.documents.length})
                      </p>
                      <div className="space-y-3">
                        {user.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="bg-white p-3 rounded border border-gray-200 flex justify-between items-start"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-gray-900">
                                {doc.document_type}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                Service: <span className="font-medium">{doc.service_type}</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(doc.created_at).toLocaleString()}
                              </div>
                              {doc.rejection_reason && (
                                <div className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded">
                                  Reason: {doc.rejection_reason}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                              <Badge variant={statusVariant(doc.status)}>
                                {doc.status}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(getFileUrl(doc), "_blank")}
                                className="whitespace-nowrap"
                              >
                                View
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Service Requests Section */}
                  {user.serviceRequests.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-3">
                        Service Requests ({user.serviceRequests.length})
                      </p>
                      <div className="space-y-3">
                        {user.serviceRequests.map((request) => (
                          <div
                            key={request.id}
                            className="bg-white p-3 rounded border border-gray-200"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="font-medium text-sm text-gray-900">
                                  {request.service_type}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  ID: <span className="font-mono">{request.id}</span>
                                </div>
                                {request.amount && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    Amount: ₹ {request.amount.toLocaleString()}
                                  </div>
                                )}
                                <div className="text-xs text-gray-500 mt-1">
                                  {new Date(request.created_at).toLocaleString()}
                                </div>
                              </div>
                              <Badge variant={statusVariant(request.status)} className="ml-4">
                                {request.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {user.documents.length === 0 && user.serviceRequests.length === 0 && (
                    <div className="text-center py-6 text-gray-500 text-sm">
                      No documents or service requests found for this user.
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}