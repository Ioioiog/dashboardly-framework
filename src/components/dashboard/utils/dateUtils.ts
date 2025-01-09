import { startOfMonth, subMonths, format } from "date-fns";

export type TimeRange = "1M" | "6M" | "1Y";

export function getMonthsForRange(range: TimeRange): string[] {
  const monthCount = range === "1M" ? 1 : range === "6M" ? 6 : 12;
  
  return Array.from({ length: monthCount }, (_, i) => {
    const date = subMonths(startOfMonth(new Date()), i);
    return format(date, "yyyy-MM-dd");
  }).reverse();
}

export function formatMonthDisplay(date: string): string {
  return format(new Date(date), "MMM yyyy");
}