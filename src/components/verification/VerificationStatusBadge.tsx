import { Badge } from "@/components/ui/badge";

interface Props {
  status: string;
}

export const VerificationStatusBadge = ({ status }: Props) => {
  if (status === "verified") {
    return <Badge className="bg-green-600">Verified</Badge>;
  }

  if (status === "rejected") {
    return <Badge variant="destructive">Rejected</Badge>;
  }

  if (status === "pending" || status === "input_submitted") {
    return <Badge variant="secondary">Pending</Badge>;
  }

  return <Badge variant="outline">Unknown</Badge>;
};