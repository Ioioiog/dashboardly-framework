import { format, startOfMonth, subMonths } from "date-fns";

export type TimeRange = "1M" | "6M" | "1Y";

export function getMonthsForRange(range: TimeRange): string[] {
  const monthCount = range === "1M" ? 1 : range === "6M" ? 6 : 12;
  return Array.from({ length: monthCount }, (_, i) => {
    const date = subMonths(startOfMonth(new Date()), i);
    // Use UTC date string to avoid timezone issues
    return date.toISOString().slice(0, 10);
  }).reverse();
}

export function formatMonthDisplay(date: string): string {
  // Parse date string and ensure UTC
  const parsedDate = new Date(date + 'T00:00:00.000Z');
  return format(parsedDate, "MMM yyyy");
}

export function formatDateForDB(date: Date): string {
  // Ensure consistent UTC date string format
  return date.toISOString().slice(0, 10);
}