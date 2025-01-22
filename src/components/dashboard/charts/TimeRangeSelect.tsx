import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimeRange } from "../types/revenue";

interface TimeRangeSelectProps {
  value: TimeRange;
  onValueChange: (value: TimeRange) => void;
}

export function TimeRangeSelect({ value, onValueChange }: TimeRangeSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-8 w-[140px] bg-background border-muted-foreground/20">
        <SelectValue placeholder="Select range" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="1M">Last Month</SelectItem>
        <SelectItem value="6M">Last 6 Months</SelectItem>
        <SelectItem value="1Y">Last Year</SelectItem>
      </SelectContent>
    </Select>
  );
}