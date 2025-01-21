export interface MonthlyRevenue {
  month: string;
  revenue: number;
  count: number;
  average: number;
  isPrediction?: boolean;
  propertyBreakdown?: Array<{
    name: string;
    total: number;
    count: number;
  }>;
}

export type TimeRange = "1M" | "6M" | "1Y";