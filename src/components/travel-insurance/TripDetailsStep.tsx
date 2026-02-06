import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Plane, Users, MapPin, Globe } from "lucide-react";
import { format, addDays, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { getCategories, type AsegoCategory } from "@/services/asegoInsuranceService";
import { toast } from "sonner";

const schema = z.object({
  destinationCountry: z.string().min(1, "Please select destination country"),
  destinationCategoryId: z.string().min(1, "Please select destination region"),
  travelStartDate: z.date({ required_error: "Please select start date" }),
  travelEndDate: z.date({ required_error: "Please select end date" }),
  numberOfTravellers: z.number().min(1).max(10),
});

export type TripDetailsData = z.infer<typeof schema> & {
  travellerAges: number[];
};

interface TripDetailsStepProps {
  initialData?: Partial<TripDetailsData>;
  onNext: (data: TripDetailsData) => void;
}

const popularDestinations = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Singapore", "UAE", "Thailand", "Malaysia",
  "Japan", "South Korea", "Italy", "Spain", "Netherlands",
  "Switzerland", "New Zealand", "Ireland",
];

export const TripDetailsStep = ({ initialData, onNext }: TripDetailsStepProps) => {
  const [categories, setCategories] = useState<AsegoCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories", error);
        toast.error("Failed to load destination categories");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TripDetailsData>({
    resolver: zodResolver(schema),
    defaultValues: {
      destinationCountry: initialData?.destinationCountry || "",
      destinationCategoryId: initialData?.destinationCategoryId || "",
      travelStartDate: initialData?.travelStartDate,
      travelEndDate: initialData?.travelEndDate,
      numberOfTravellers: initialData?.numberOfTravellers || 1,
      travellerAges: initialData?.travellerAges || [30],
    },
  });

  const numberOfTravellers = watch("numberOfTravellers") || 1;
  const travellerAges = watch("travellerAges") || [];
  const startDate = watch("travelStartDate");
  const endDate = watch("travelEndDate");

  const tripDuration = startDate && endDate ? differenceInDays(endDate, startDate) + 1 : 0;

  const handleAgeChange = (index: number, age: number) => {
    const newAges = [...travellerAges];
    newAges[index] = age;
    setValue("travellerAges", newAges);
  };

  const onSubmit = (data: TripDetailsData) => {
    const ages = travellerAges.slice(0, data.numberOfTravellers);
    if (ages.length < data.numberOfTravellers) {
      for (let i = ages.length; i < data.numberOfTravellers; i++) {
        ages.push(30);
      }
    }
    onNext({ ...data, travellerAges: ages });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent/10">
              <Plane className="h-6 w-6 text-accent" />
            </div>
            <div>
              <CardTitle>Trip Details</CardTitle>
              <CardDescription>Tell us about your travel plans</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            <div className="grid md:grid-cols-2 gap-4">
              {/* Destination Region (Category) */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Region / Category
                </Label>
                <Select
                  value={watch("destinationCategoryId")}
                  onValueChange={(value) => setValue("destinationCategoryId", value)}
                  disabled={loadingCategories}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingCategories ? "Loading..." : "Select region"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                    {categories.length === 0 && !loadingCategories && (
                      <SelectItem value="manual_domestic">Domestic (Manual)</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.destinationCategoryId && (
                  <p className="text-sm text-destructive">{errors.destinationCategoryId.message}</p>
                )}
              </div>

              {/* Destination Country */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Destination Country
                </Label>
                <Select
                  value={watch("destinationCountry")}
                  onValueChange={(value) => setValue("destinationCountry", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {popularDestinations.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.destinationCountry && (
                  <p className="text-sm text-destructive">{errors.destinationCountry.message}</p>
                )}
              </div>
            </div>

            {/* Travel Dates */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Travel Start Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setValue("travelStartDate", date as Date);
                        if (date && (!endDate || endDate < date)) {
                          setValue("travelEndDate", addDays(date, 7));
                        }
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.travelStartDate && (
                  <p className="text-sm text-destructive">{errors.travelStartDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Travel End Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => setValue("travelEndDate", date as Date)}
                      disabled={(date) => date < (startDate || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.travelEndDate && (
                  <p className="text-sm text-destructive">{errors.travelEndDate.message}</p>
                )}
              </div>
            </div>

            {tripDuration > 0 && (
              <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Trip Duration</span>
                  <span className="font-semibold text-accent">{tripDuration} days</span>
                </div>
              </div>
            )}

            {/* Number of Travellers */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Number of Travellers
              </Label>
              <Select
                value={String(numberOfTravellers)}
                onValueChange={(value) => setValue("numberOfTravellers", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select number" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <SelectItem key={num} value={String(num)}>
                      {num} {num === 1 ? "Traveller" : "Travellers"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Traveller Ages */}
            <div className="space-y-4">
              <Label>Age of Travellers</Label>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: numberOfTravellers }).map((_, index) => (
                  <div key={index} className="space-y-1">
                    <Label className="text-sm text-muted-foreground">
                      Traveller {index + 1}
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={99}
                      value={travellerAges[index] || 30}
                      onChange={(e) => handleAgeChange(index, parseInt(e.target.value) || 30)}
                      placeholder="Age"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Continue to Plan Selection
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
