import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, User, Users, AlertCircle, Mail, Phone, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import type { TripDetailsData } from "./TripDetailsStep";
import { format } from "date-fns";
import { toast } from "sonner";

interface TravellerDetailsStepProps {
  tripDetails: TripDetailsData;
  initialData?: TravellersFormData;
  onNext: (data: TravellersFormData) => void;
  onBack: () => void;
}

export interface Traveller {
  id: number;
  fullName: string;
  dateOfBirth: string;
  passportNumber: string;
  email: string;
  mobile: string;
  gender: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  nominee: string;
  relation: string;
  emergencyContact: {
    name: string;
    number: string;
    email: string;
  };
}

export interface TravellersFormData {
  travellers: Traveller[];
}

export const TravellerDetailsStep = ({
  tripDetails,
  initialData,
  onNext,
  onBack,
}: TravellerDetailsStepProps) => {
  const [travellers, setTravellers] = useState<Traveller[]>([]);

  useEffect(() => {
    if (initialData) {
      setTravellers(initialData.travellers);
    } else {
      // Initialize empty travellers based on count
      const initialTravellers = Array.from({ length: tripDetails.numberOfTravellers }).map(
        (_, index) => ({
          id: index + 1,
          fullName: "",
          dateOfBirth: "",
          passportNumber: "",
          email: "",
          mobile: "",
          gender: "",
          address: "",
          city: "",
          district: "",
          state: "",
          pincode: "",
          nominee: "",
          relation: "",
          emergencyContact: {
            name: "",
            number: "",
            email: "",
          }
        })
      );
      setTravellers(initialTravellers);
    }
  }, [tripDetails.numberOfTravellers, initialData]);

  const handleTravellerChange = (index: number, field: keyof Traveller, value: string) => {
    const updatedTravellers = [...travellers];
    updatedTravellers[index] = { ...updatedTravellers[index], [field]: value };
    setTravellers(updatedTravellers);
  };

  const handleEmergencyContactChange = (index: number, field: keyof Traveller["emergencyContact"], value: string) => {
    const updatedTravellers = [...travellers];
    updatedTravellers[index] = {
      ...updatedTravellers[index],
      emergencyContact: {
        ...updatedTravellers[index].emergencyContact,
        [field]: value
      }
    };
    setTravellers(updatedTravellers);
  };

  const validateForm = () => {
    for (let i = 0; i < travellers.length; i++) {
      const t = travellers[i];
      if (!t.fullName || !t.dateOfBirth || !t.passportNumber || !t.email || !t.mobile || !t.gender || !t.address || !t.city || !t.district || !t.state || !t.pincode || !t.nominee || !t.relation) {
        toast.error(`Please fill all details for Traveller ${i + 1}`);
        return false;
      }
      if (!t.emergencyContact.name || !t.emergencyContact.number || !t.emergencyContact.email) {
        toast.error(`Please fill emergency contact details for Traveller ${i + 1}`);
        return false;
      }

      // Basic validation
      if (t.passportNumber.length < 5) {
        toast.error(`Invalid passport number for Traveller ${i + 1}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext({ travellers });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2.5 rounded-xl bg-accent/10">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1a365d]">Traveller Details</h2>
              <p className="text-sm text-muted-foreground">Enter details for all {tripDetails.numberOfTravellers} traveller(s)</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {travellers.map((traveller, index) => (
              <div key={traveller.id} className="space-y-6">
                {index > 0 && <Separator className="my-6" />}

                <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-800">Traveller {index + 1}</h3>
                    {index === 0 && <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">Primary</span>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor={`name-${index}`}>Full Name (as per Passport)</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                      <Input
                        id={`name-${index}`}
                        placeholder="e.g. John Doe"
                        value={traveller.fullName}
                        onChange={(e) => handleTravellerChange(index, "fullName", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`gender-${index}`}>Gender</Label>
                    <Select
                      value={traveller.gender}
                      onValueChange={(value) => handleTravellerChange(index, "gender", value)}
                    >
                      <SelectTrigger id={`gender-${index}`}>
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`dob-${index}`}>Date of Birth</Label>
                    <Input
                      id={`dob-${index}`}
                      type="date"
                      value={traveller.dateOfBirth}
                      max={format(new Date(), "yyyy-MM-dd")}
                      onChange={(e) => handleTravellerChange(index, "dateOfBirth", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`passport-${index}`}>Passport Number</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                      <Input
                        id={`passport-${index}`}
                        placeholder="e.g. A1234567"
                        value={traveller.passportNumber}
                        onChange={(e) => handleTravellerChange(index, "passportNumber", e.target.value.toUpperCase())}
                        maxLength={15}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`email-${index}`}>Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                      <Input
                        id={`email-${index}`}
                        type="email"
                        placeholder="john@example.com"
                        value={traveller.email}
                        onChange={(e) => handleTravellerChange(index, "email", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`mobile-${index}`}>Mobile Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                      <Input
                        id={`mobile-${index}`}
                        type="tel"
                        placeholder="9876543210"
                        value={traveller.mobile}
                        onChange={(e) => handleTravellerChange(index, "mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <Separator />
                <div className="font-semibold text-sm text-slate-700">Address Details</div>

                <div className="space-y-2">
                  <Label htmlFor={`address-${index}`}>Full Address</Label>
                  <Input
                    id={`address-${index}`}
                    placeholder="Enter full address"
                    value={traveller.address}
                    onChange={(e) => handleTravellerChange(index, "address", e.target.value)}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`city-${index}`}>City</Label>
                    <Input
                      id={`city-${index}`}
                      placeholder="City"
                      value={traveller.city}
                      onChange={(e) => handleTravellerChange(index, "city", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`district-${index}`}>District</Label>
                    <Input
                      id={`district-${index}`}
                      placeholder="District"
                      value={traveller.district}
                      onChange={(e) => handleTravellerChange(index, "district", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`state-${index}`}>State</Label>
                    <Input
                      id={`state-${index}`}
                      placeholder="State"
                      value={traveller.state}
                      onChange={(e) => handleTravellerChange(index, "state", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`pincode-${index}`}>Pincode</Label>
                    <Input
                      id={`pincode-${index}`}
                      placeholder="123456"
                      maxLength={6}
                      value={traveller.pincode}
                      onChange={(e) => handleTravellerChange(index, "pincode", e.target.value)}
                    />
                  </div>
                </div>

                <Separator />
                <div className="font-semibold text-sm text-slate-700">Nominee & Emergency Contact</div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`nominee-${index}`}>Nominee Name</Label>
                    <Input
                      id={`nominee-${index}`}
                      placeholder="Nominee Name"
                      value={traveller.nominee}
                      onChange={(e) => handleTravellerChange(index, "nominee", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`relation-${index}`}>Nominee Relation</Label>
                    <Select
                      value={traveller.relation}
                      onValueChange={(value) => handleTravellerChange(index, "relation", value)}
                    >
                      <SelectTrigger id={`relation-${index}`}>
                        <SelectValue placeholder="Select Relation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Father">Father</SelectItem>
                        <SelectItem value="Mother">Mother</SelectItem>
                        <SelectItem value="Spouse">Spouse</SelectItem>
                        <SelectItem value="Child">Child</SelectItem>
                        <SelectItem value="Sibling">Sibling</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-slate-500">Emergency Contact Name</Label>
                    <Input
                      className="h-9 bg-white"
                      value={traveller.emergencyContact.name}
                      onChange={(e) => handleEmergencyContactChange(index, "name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-slate-500">Emergency Phone</Label>
                    <Input
                      className="h-9 bg-white"
                      value={traveller.emergencyContact.number}
                      onChange={(e) => handleEmergencyContactChange(index, "number", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-slate-500">Emergency Email</Label>
                    <Input
                      className="h-9 bg-white"
                      value={traveller.emergencyContact.email}
                      onChange={(e) => handleEmergencyContactChange(index, "email", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button type="submit" className="flex-1 bg-accent hover:bg-accent/90">
                Continue to Review
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
