import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, Check } from "lucide-react";
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
  
  useEffect(() => {
    if (value) {
      setLocalDate(value);
      setSelectedTime(format(value, "HH:mm"));
    }
  }, [value]);

  const handleSelect = useCallback((date: Date | undefined) => {
    console.log("Date selection initiated:", date);
    if (!date) return;
    
    // If there's already a time selected, preserve it when setting the new date
    if (selectedTime) {
      const [hours, minutes] = selectedTime.split(':');
      const newDate = new Date(date);
      newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      setLocalDate(newDate);
    } else {
      setLocalDate(date);
    }
    setIsOpen(false);
  }, [selectedTime]);

  const handleTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setSelectedTime(newTime);
    
    // If we have a localDate, update it with the new time
    if (localDate && newTime) {
      const [hours, minutes] = newTime.split(':');
      const updatedDate = new Date(localDate);
      updatedDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      setLocalDate(updatedDate);
    }
  }, [localDate]);

  const handleScheduleClick = () => {
    if (!localDate || !selectedTime) {
      console.log("Cannot schedule: missing date or time");
      return;
    }

    const [hours, minutes] = selectedTime.split(':');
    const updatedDate = new Date(localDate);
    updatedDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));

    if (!isNaN(updatedDate.getTime())) {
      console.log("Scheduling visit for:", updatedDate);
      onChange(updatedDate);
    }
  };

  return (
    <div className="space-y-4">
      <Label>Schedule Visit</Label>
      <div className="flex flex-col gap-4">
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
                required
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

        <Button 
          onClick={handleScheduleClick}
          disabled={!localDate || !selectedTime || disabled}
          className="w-full"
          variant="secondary"
        >
          <Check className="mr-2 h-4 w-4" />
          Schedule Visit
        </Button>
      </div>
    </div>
  );
}