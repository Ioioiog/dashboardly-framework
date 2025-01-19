import { format, startOfMonth, subMonths } from "date-fns";

export type TimeRange = "1M" | "6M" | "1Y";

export function getMonthsForRange(range: TimeRange): string[] {
  const monthCount = range === "1M" ? 1 : range === "6M" ? 6 : 12;
  
  return Array.from({ length: monthCount }, (_, i) => {
    const date = subMonths(startOfMonth(new Date()), i);
    // Ensure consistent date formatting across browsers
    return date.toISOString().split('T')[0];
  }).reverse();
}

export function formatMonthDisplay(date: string): string {
  // Ensure we're parsing the date string consistently
  const parsedDate = new Date(date + 'T00:00:00Z');
  return format(parsedDate, "MMM yyyy");
}

export function formatDateForDB(date: Date): string {
  return date.toISOString().split('T')[0];
}