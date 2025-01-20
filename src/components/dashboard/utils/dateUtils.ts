import { format, startOfMonth, subMonths } from "date-fns";

export type TimeRange = "1M" | "6M" | "1Y";

export function getMonthsForRange(range: TimeRange): string[] {
  const monthCount = range === "1M" ? 1 : range === "6M" ? 6 : 12;
  const today = new Date();
  
  return Array.from({ length: monthCount }, (_, i) => {
    const date = startOfMonth(subMonths(today, monthCount - 1 - i));
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  });
}

export function formatMonthDisplay(dateString: string): string {
  // Ensure we're working with a valid date string
  const date = new Date(dateString + 'T00:00:00Z');
  if (isNaN(date.getTime())) {
    console.error('Invalid date string:', dateString);
    return 'Invalid Date';
  }
  return format(date, 'MMM yyyy');
}

export function formatDateForDB(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    console.error('Invalid date object:', date);
    return new Date().toISOString().split('T')[0];
  }
  return date.toISOString().split('T')[0];
}