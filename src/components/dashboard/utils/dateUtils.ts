import { format, startOfMonth, subMonths } from "date-fns";

export type TimeRange = "1M" | "6M" | "1Y";

export function getMonthsForRange(range: TimeRange): string[] {
  try {
    const monthCount = range === "1M" ? 1 : range === "6M" ? 6 : 12;
    const today = new Date();
    
    if (isNaN(today.getTime())) {
      console.error('Invalid base date');
      return [];
    }

    return Array.from({ length: monthCount }, (_, i) => {
      try {
        const date = startOfMonth(subMonths(today, monthCount - 1 - i));
        if (isNaN(date.getTime())) {
          console.error('Invalid date generated for index:', i);
          return null;
        }
        return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
      } catch (error) {
        console.error('Error generating date for index:', i, error);
        return null;
      }
    }).filter(Boolean) as string[]; // Remove any null values
  } catch (error) {
    console.error('Error in getMonthsForRange:', error);
    return [];
  }
}

export function formatMonthDisplay(dateString: string): string {
  try {
    if (!dateString) {
      console.error('Empty date string provided');
      return 'Invalid Date';
    }

    // Ensure we're working with a valid date string
    const date = new Date(dateString + 'T00:00:00Z');
    if (isNaN(date.getTime())) {
      console.error('Invalid date string:', dateString);
      return 'Invalid Date';
    }
    return format(date, 'MMM yyyy');
  } catch (error) {
    console.error('Error formatting month display:', error);
    return 'Invalid Date';
  }
}

export function formatDateForDB(date: Date | null | undefined): string {
  try {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      console.error('Invalid date object:', date);
      const today = new Date();
      if (isNaN(today.getTime())) {
        console.error('Failed to create fallback date');
        return '';
      }
      return today.toISOString().split('T')[0];
    }
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date for DB:', error);
    return '';
  }
}