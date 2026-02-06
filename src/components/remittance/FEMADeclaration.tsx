import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Shield, FileCheck, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FEMADeclarationProps {
  onAccept: (accepted: boolean) => void;
  accepted: boolean;
  purpose?: string;
  amount?: number;
  currency?: string;
  showFullDeclaration?: boolean;
}

export function FEMADeclaration({
  onAccept,
  accepted,
  purpose,
  amount,
  currency = "USD",
  showFullDeclaration = true,
}: FEMADeclarationProps) {
  const declarations = [
    {
      id: "lrs_compliance",
      text: "I declare that the remittance is within the Liberalised Remittance Scheme (LRS) limit of USD 2,50,000 per financial year and is for a permitted purpose under FEMA, 1999.",
      required: true,
    },
    {
      id: "source_of_funds",
      text: "I confirm that the funds are from legitimate sources and are not proceeds of any illegal or unlawful activity.",
      required: true,
    },
    {
      id: "not_prohibited",
      text: "I confirm that this remittance is not for any prohibited purpose including margin trading, speculation, lottery, or purchase of crypto/virtual assets.",
      required: true,
    },
    {
      id: "form_a2",
      text: "I authorize RBP FINIVIS Private Limited to submit Form A2 on my behalf to the Authorized Dealer for this remittance.",
      required: true,
    },
    {
      id: "accurate_info",
      text: "I confirm that all information provided is true, complete, and accurate to the best of my knowledge.",
      required: true,
    },
  ];

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const handleCheck = (id: string, checked: boolean) => {
    const newChecked = { ...checkedItems, [id]: checked };
    setCheckedItems(newChecked);
    
    // Check if all required items are checked
    const allChecked = declarations.every((d) => 
      !d.required || newChecked[d.id] === true
    );
    onAccept(allChecked);
  };

  if (!showFullDeclaration) {
    return (
      <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border">
        <Checkbox
          id="fema-quick"
          checked={accepted}
          onCheckedChange={(checked) => onAccept(checked === true)}
          className="mt-0.5"
        />
        <Label htmlFor="fema-quick" className="text-sm leading-relaxed cursor-pointer">
          I declare that this remittance is for a permitted purpose under LRS and complies with FEMA, 1999 and RBI guidelines. 
          I confirm that all information provided is accurate and funds are from legitimate sources.
        </Label>
      </div>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="h-5 w-5 text-primary" />
          FEMA & RBI Compliance Declaration
          <Badge variant="destructive" className="text-xs">Mandatory</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {purpose && amount && (
          <div className="p-3 bg-muted rounded-lg text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Purpose:</span>
              <span className="font-medium capitalize">{purpose.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">{currency} {amount.toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {declarations.map((declaration) => (
            <div key={declaration.id} className="flex items-start gap-3">
              <Checkbox
                id={declaration.id}
                checked={checkedItems[declaration.id] || false}
                onCheckedChange={(checked) => handleCheck(declaration.id, checked === true)}
                className="mt-0.5"
              />
              <Label 
                htmlFor={declaration.id} 
                className="text-sm leading-relaxed cursor-pointer text-muted-foreground"
              >
                {declaration.text}
                {declaration.required && <span className="text-destructive ml-1">*</span>}
              </Label>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
          <div className="text-xs text-yellow-700 dark:text-yellow-400">
            <p className="font-medium mb-1">Important Notice</p>
            <p>
              Making a false declaration is an offence under FEMA, 1999 and may result in penalties 
              up to three times the amount involved. RBI and ED may investigate non-compliant transactions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileCheck className="h-4 w-4" />
          <span>
            By proceeding, you agree to the terms above and authorize Form A2 submission.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
