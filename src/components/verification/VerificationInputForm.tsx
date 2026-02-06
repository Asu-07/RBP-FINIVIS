import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface VerificationInputFormProps {
  documentType: "pan" | "passport" | "aadhaar";
  documentId: string;
  userId: string;
  onVerified?: () => void;
}

export const VerificationInputForm = ({
  documentType,
  documentId,
  userId,
  onVerified,
}: VerificationInputFormProps) => {
  const [loading, setLoading] = useState(false);

  // Inputs
  const [panNumber, setPanNumber] = useState("");
  const [panName, setPanName] = useState("");

  const [passportNumber, setPassportNumber] = useState("");
  const [dob, setDob] = useState("");
  const [fileNumber, setFileNumber] = useState("");

  const [aadhaarNumber, setAadhaarNumber] = useState("");

  const handleVerify = async () => {
    setLoading(true);

    try {
      const payload: any = {
        type: documentType,
        documentId,
        userId,
      };

      if (documentType === "pan") {
        payload.panNumber = panNumber;
        payload.name = panName;
      }

      if (documentType === "passport") {
        payload.passportNumber = passportNumber;
        payload.dob = dob;
        payload.fileNumber = fileNumber || undefined;
      }

      if (documentType === "aadhaar") {
        payload.aadhaarNumber = aadhaarNumber;
      }

      const res = await fetch("/api/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Verification failed");
      }

      toast.success("Verification successful");
      onVerified?.();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4 mt-4 space-y-3 border">
      {/* PAN */}
      {documentType === "pan" && (
        <>
          <Input
            placeholder="PAN Number"
            value={panNumber}
            onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
          />
          <Input
            placeholder="Name as per PAN"
            value={panName}
            onChange={(e) => setPanName(e.target.value)}
          />
        </>
      )}

      {/* Passport */}
      {documentType === "passport" && (
        <>
          <Input
            placeholder="Passport Number"
            value={passportNumber}
            onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
          />
          <Input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
          <Input
            placeholder="File Number (optional)"
            value={fileNumber}
            onChange={(e) => setFileNumber(e.target.value)}
          />
        </>
      )}

      {/* Aadhaar */}
      {documentType === "aadhaar" && (
        <Input
          placeholder="Aadhaar Number"
          value={aadhaarNumber}
          onChange={(e) => setAadhaarNumber(e.target.value)}
        />
      )}

      <Button
        onClick={handleVerify}
        disabled={loading}
        className="w-full"
      >
        {loading ? "Verifying..." : "Verify Now"}
      </Button>
    </Card>
  );
};