import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface ScheduleVisitFieldProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  disabled?: boolean;
}

export function ScheduleVisitField({ value, onChange, disabled }: ScheduleVisitFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState(value ? format(value, "HH:mm") : "");

  const handleSelect = (date: Date | undefined) => {
    console.log("Date selection initiated:", date);
    if (!date) return;

    // Combine the selected date with the time if it exists
    if (selectedTime) {
      const [hours, minutes] = selectedTime.split(':');
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    }

    // Update the form with the selected date and time
    onChange(date);
    console.log("Date and time set successfully:", date);
    setIsOpen(false);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setSelectedTime(newTime);
    
    if (value) {
      const updatedDate = new Date(value);
      const [hours, minutes] = newTime.split(':');
      updatedDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      onChange(updatedDate);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Schedule Visit</Label>
      <div className="flex gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              type="button"
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !value && "text-muted-foreground",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? format(value, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleSelect}
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <Input
            type="time"
            value={selectedTime}
            onChange={handleTimeChange}
            className="w-[120px]"
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}