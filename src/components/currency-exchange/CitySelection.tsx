import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, ArrowRight, Building2 } from "lucide-react";

const cities = [
  { code: "mumbai", name: "Mumbai", state: "Maharashtra" },
  { code: "delhi", name: "Delhi NCR", state: "Delhi" },
  { code: "bangalore", name: "Bangalore", state: "Karnataka" },
  { code: "hyderabad", name: "Hyderabad", state: "Telangana" },
  { code: "chennai", name: "Chennai", state: "Tamil Nadu" },
  { code: "kolkata", name: "Kolkata", state: "West Bengal" },
  { code: "pune", name: "Pune", state: "Maharashtra" },
  { code: "ahmedabad", name: "Ahmedabad", state: "Gujarat" },
  { code: "jaipur", name: "Jaipur", state: "Rajasthan" },
  { code: "cochin", name: "Kochi", state: "Kerala" },
  { code: "lucknow", name: "Lucknow", state: "Uttar Pradesh" },
  { code: "chandigarh", name: "Chandigarh", state: "Chandigarh" },
];

interface CitySelectionProps {
  selectedCity: string;
  onCitySelect: (city: string) => void;
  onContinue: () => void;
}

export const CitySelection = ({ selectedCity, onCitySelect, onContinue }: CitySelectionProps) => {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Select Your City</CardTitle>
            <CardDescription>
              Choose your city for currency exchange and home delivery
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>City</Label>
          <Select value={selectedCity} onValueChange={onCitySelect}>
            <SelectTrigger className="w-full h-12">
              <SelectValue placeholder="Select your city" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {cities.map((city) => (
                <SelectItem key={city.code} value={city.code}>
                  <span className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{city.name}</span>
                    <span className="text-muted-foreground text-sm">({city.state})</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Service Availability
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Home delivery available in all listed cities</li>
            <li>• Same-day delivery available in metro cities</li>
            <li>• Competitive rates for bulk orders</li>
          </ul>
        </div>

        <Button
          className="w-full"
          size="lg"
          disabled={!selectedCity}
          onClick={onContinue}
        >
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};
