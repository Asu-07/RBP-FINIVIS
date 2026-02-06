import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { countries } from "@/data/mockData";
import { sanitizeError, logError, maskSensitiveData, maskIBAN, maskSWIFT } from "@/lib/errorHandler";
import {
  Plus,
  Edit2,
  Trash2,
  User,
  Building2,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";

interface Beneficiary {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  country: string;
  currency: string;
  beneficiary_type: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_swift_code: string | null;
  bank_iban: string | null;
  bank_routing_number: string | null;
  is_active: boolean | null;
}

interface BeneficiaryFormData {
  name: string;
  email: string;
  phone: string;
  country: string;
  currency: string;
  beneficiary_type: string;
  bank_name: string;
  bank_account_number: string;
  bank_swift_code: string;
  bank_iban: string;
}

const emptyFormData: BeneficiaryFormData = {
  name: "",
  email: "",
  phone: "",
  country: "US",
  currency: "USD",
  beneficiary_type: "individual",
  bank_name: "",
  bank_account_number: "",
  bank_swift_code: "",
  bank_iban: "",
};

export function BeneficiaryManagement() {
  const { user } = useAuth();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BeneficiaryFormData>(emptyFormData);
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({});

  const toggleShowSensitive = (id: string) => {
    setShowSensitive(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    if (user) {
      fetchBeneficiaries();
    }
  }, [user]);

  const fetchBeneficiaries = async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("beneficiaries")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (error) {
      logError("BeneficiaryManagement.fetch", error);
      toast.error(sanitizeError(error));
    } else {
      setBeneficiaries(data || []);
    }
    setLoading(false);
  };

  const openAddDialog = () => {
    setFormData(emptyFormData);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEditDialog = (beneficiary: Beneficiary) => {
    setFormData({
      name: beneficiary.name,
      email: beneficiary.email || "",
      phone: beneficiary.phone || "",
      country: beneficiary.country,
      currency: beneficiary.currency,
      beneficiary_type: beneficiary.beneficiary_type || "individual",
      bank_name: beneficiary.bank_name || "",
      bank_account_number: beneficiary.bank_account_number || "",
      bank_swift_code: beneficiary.bank_swift_code || "",
      bank_iban: beneficiary.bank_iban || "",
    });
    setEditingId(beneficiary.id);
    setDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!formData.name.trim()) {
      toast.error("Beneficiary name is required");
      return;
    }

    setSaving(true);

    const beneficiaryData = {
      user_id: user.id,
      name: formData.name.trim(),
      email: formData.email.trim() || null,
      phone: formData.phone.trim() || null,
      country: formData.country,
      currency: formData.currency,
      beneficiary_type: formData.beneficiary_type,
      bank_name: formData.bank_name.trim() || null,
      bank_account_number: formData.bank_account_number.trim() || null,
      bank_swift_code: formData.bank_swift_code.trim() || null,
      bank_iban: formData.bank_iban.trim() || null,
    };

    let error;
    if (editingId) {
      const result = await supabase
        .from("beneficiaries")
        .update(beneficiaryData)
        .eq("id", editingId);
      error = result.error;
    } else {
      const result = await supabase.from("beneficiaries").insert(beneficiaryData);
      error = result.error;
    }

    if (error) {
      logError("BeneficiaryManagement.save", error);
      toast.error(sanitizeError(error));
    } else {
      toast.success(editingId ? "Beneficiary updated" : "Beneficiary added");
      setDialogOpen(false);
      fetchBeneficiaries();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    const { error } = await supabase
      .from("beneficiaries")
      .delete()
      .eq("id", deletingId);

    if (error) {
      logError("BeneficiaryManagement.delete", error);
      toast.error(sanitizeError(error));
    } else {
      toast.success("Beneficiary deleted");
      setDeleteDialogOpen(false);
      setDeletingId(null);
      fetchBeneficiaries();
    }
  };

  const getCountryFlag = (countryCode: string) => {
    const country = countries.find((c) => c.code === countryCode);
    return country?.flag || "🌍";
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Saved Beneficiaries</h3>
          <p className="text-sm text-muted-foreground">
            Manage recipients for quick transfers
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchBeneficiaries}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={openAddDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Beneficiary
          </Button>
        </div>
      </div>

      {beneficiaries.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No beneficiaries yet</p>
          <p className="text-sm">Add recipients to make transfers faster</p>
          <Button className="mt-4" onClick={openAddDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Beneficiary
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Bank Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {beneficiaries.map((b) => {
                const isRevealed = showSensitive[b.id] || false;
                return (
                  <TableRow key={b.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{b.name}</p>
                        {b.email && (
                          <p className="text-xs text-muted-foreground">{b.email}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {b.beneficiary_type === "business" ? (
                          <Building2 className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                        <span className="capitalize text-sm">
                          {b.beneficiary_type || "Individual"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="mr-1">{getCountryFlag(b.country)}</span>
                      {b.country}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <p className="font-medium">{b.bank_name || "-"}</p>
                        {b.bank_account_number && (
                          <p className="text-muted-foreground">
                            Acc: {isRevealed ? b.bank_account_number : maskSensitiveData(b.bank_account_number)}
                          </p>
                        )}
                        {b.bank_iban && (
                          <p className="text-muted-foreground">
                            IBAN: {isRevealed ? b.bank_iban : maskIBAN(b.bank_iban)}
                          </p>
                        )}
                        {b.bank_swift_code && (
                          <p className="text-muted-foreground">
                            SWIFT: {isRevealed ? b.bank_swift_code : maskSWIFT(b.bank_swift_code)}
                          </p>
                        )}
                        {b.bank_routing_number && (
                          <p className="text-muted-foreground">
                            Routing: {isRevealed ? b.bank_routing_number : maskSensitiveData(b.bank_routing_number)}
                          </p>
                        )}
                        {(b.bank_account_number || b.bank_iban || b.bank_swift_code || b.bank_routing_number) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => toggleShowSensitive(b.id)}
                          >
                            {isRevealed ? (
                              <>
                                <EyeOff className="h-3 w-3 mr-1" />
                                Hide
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3 mr-1" />
                                Show
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={b.is_active ? "default" : "secondary"}
                        className={b.is_active ? "bg-success" : ""}
                      >
                        {b.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(b)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(b.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Beneficiary" : "Add Beneficiary"}
            </DialogTitle>
            <DialogDescription>
              Enter the recipient's details for future transfers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Full Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="John Doe"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="john@example.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+1 234 567 8900"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Country</Label>
                <Select
                  value={formData.country}
                  onValueChange={(v) => {
                    const country = countries.find((c) => c.code === v);
                    setFormData({
                      ...formData,
                      country: v,
                      currency: country?.currency || formData.currency,
                    });
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type</Label>
                <Select
                  value={formData.beneficiary_type}
                  onValueChange={(v) =>
                    setFormData({ ...formData, beneficiary_type: v })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Bank Name</Label>
                <Input
                  value={formData.bank_name}
                  onChange={(e) =>
                    setFormData({ ...formData, bank_name: e.target.value })
                  }
                  placeholder="Bank of America"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Account Number</Label>
                <Input
                  value={formData.bank_account_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bank_account_number: e.target.value,
                    })
                  }
                  placeholder="1234567890"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>SWIFT/BIC Code</Label>
                <Input
                  value={formData.bank_swift_code}
                  onChange={(e) =>
                    setFormData({ ...formData, bank_swift_code: e.target.value })
                  }
                  placeholder="BOFAUS3N"
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label>IBAN (if applicable)</Label>
                <Input
                  value={formData.bank_iban}
                  onChange={(e) =>
                    setFormData({ ...formData, bank_iban: e.target.value })
                  }
                  placeholder="DE89370400440532013000"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingId ? "Update" : "Add"} Beneficiary
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Beneficiary</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this beneficiary? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
