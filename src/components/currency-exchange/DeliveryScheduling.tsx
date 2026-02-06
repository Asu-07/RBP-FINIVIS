import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, isWeekend, isBefore, startOfToday } from "date-fns";
import { 
  ArrowLeft, 
  ArrowRight, 
  Truck,
  Loader2,
  MapPin,
  Clock,
} from "lucide-react";
import type { ExchangeOrderData } from "@/pages/CurrencyExchange";

const timeSlots = [
  { value: "09:00-12:00", label: "9:00 AM - 12:00 PM" },
  { value: "12:00-15:00", label: "12:00 PM - 3:00 PM" },
  { value: "15:00-18:00", label: "3:00 PM - 6:00 PM" },
  { value: "18:00-21:00", label: "6:00 PM - 9:00 PM" },
];

const cityNames: Record<string, string> = {
  mumbai: "Mumbai",
  delhi: "Delhi NCR",
  bangalore: "Bangalore",
  hyderabad: "Hyderabad",
  chennai: "Chennai",
  kolkata: "Kolkata",
  pune: "Pune",
  ahmedabad: "Ahmedabad",
  jaipur: "Jaipur",
  cochin: "Kochi",
  lucknow: "Lucknow",
  chandigarh: "Chandigarh",
};

interface DeliverySchedulingProps {
  orderData: ExchangeOrderData;
  onUpdateData: (data: Partial<ExchangeOrderData>) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const DeliveryScheduling = ({ 
  orderData, 
  onUpdateData, 
  onBack, 
  onContinue 
}: DeliverySchedulingProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");

  const today = startOfToday();
  const minDate = addDays(today, 1); // At least next day
  const maxDate = addDays(today, 30); // Within 30 days

  const isDateDisabled = (date: Date) => {
    return isBefore(date, minDate) || isWeekend(date) || isBefore(maxDate, date);
  };

  const isValid = selectedDate && selectedTimeSlot;

  const handleSchedule = async () => {
    if (!isValid || !orderData.orderId) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("currency_exchange_orders")
        .update({
          delivery_date: format(selectedDate, "yyyy-MM-dd"),
          delivery_time_slot: selectedTimeSlot,
          status: "scheduled",
        })
        .eq("id", orderData.orderId);

      if (error) throw error;

      onUpdateData({
        deliveryDate: format(selectedDate, "yyyy-MM-dd"),
        deliveryTimeSlot: selectedTimeSlot,
      });

      toast({
        title: "Delivery Scheduled",
        description: `Your currency will be delivered on ${format(selectedDate, "MMMM d, yyyy")}`,
      });

      onContinue();
    } catch (error: any) {
      console.error("Scheduling error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to schedule delivery",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Truck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Schedule Home Delivery</CardTitle>
            <CardDescription>
              Choose your preferred delivery date and time slot
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Delivery Address */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="font-medium">Delivery Address</span>
          </div>
          <p className="text-sm text-muted-foreground">{orderData.deliveryAddress}</p>
          <p className="text-sm text-muted-foreground mt-1">City: {cityNames[orderData.city] || orderData.city}</p>
        </div>

        {/* Calendar */}
        <div className="space-y-2">
          <Label>Select Delivery Date</Label>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={isDateDisabled}
              className="rounded-md border"
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Delivery available Monday to Friday only
          </p>
        </div>

        {/* Time Slot */}
        <div className="space-y-2">
          <Label>Select Time Slot</Label>
          <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a time slot" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((slot) => (
                <SelectItem key={slot.value} value={slot.value}>
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {slot.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Summary */}
        {isValid && (
          <div className="bg-green-500/10 rounded-lg p-4">
            <p className="text-sm text-green-700 dark:text-green-300">
              <strong>Scheduled for:</strong> {format(selectedDate, "EEEE, MMMM d, yyyy")} at {timeSlots.find(s => s.value === selectedTimeSlot)?.label}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} disabled={isProcessing} className="flex-1">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleSchedule} disabled={!isValid || isProcessing} className="flex-1">
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                Confirm Delivery
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
