import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";

interface ScheduleVisitFieldProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  disabled?: boolean;
}

export function ScheduleVisitField({ value, onChange, disabled }: ScheduleVisitFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState(value ? format(value, "HH:mm") : "");
  const [localDate, setLocalDate] = useState<Date | undefined>(value);
  
  // Update local state when prop changes
  useEffect(() => {
    if (value) {
      setLocalDate(value);
      setSelectedTime(format(value, "HH:mm"));
    }
  }, [value]);

  const handleSelect = (date: Date | undefined) => {
    console.log("Date selection initiated:", date);
    if (!date) return;

    setLocalDate(date);
    
    // Combine the selected date with the existing time if it exists
    if (selectedTime) {
      const [hours, minutes] = selectedTime.split(':');
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    }

    // Update the form with the selected date and time
    onChange(date);
    console.log("Date and time set successfully:", date);
    setIsOpen(false);
  };

  const handleTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setSelectedTime(newTime);
    
    if (localDate) {
      const updatedDate = new Date(localDate);
      const [hours, minutes] = newTime.split(':');
      updatedDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      
      // Only update if we have valid hours and minutes
      if (!isNaN(updatedDate.getTime())) {
        setLocalDate(updatedDate);
        onChange(updatedDate);
      }
    }
  }, [localDate, onChange]);

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
                !localDate && "text-muted-foreground",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {localDate ? format(localDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={localDate}
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