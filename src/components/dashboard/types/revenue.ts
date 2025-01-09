export interface MonthlyRevenue {
  month: string;
  revenue: number;
  count: number;
  average: number;
  isPrediction?: boolean;
}

export type TimeRange = "1M" | "6M" | "1Y";