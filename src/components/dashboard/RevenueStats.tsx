import { useTranslation } from "react-i18next";
import { useCurrency } from "@/hooks/useCurrency";

interface RevenueStatsProps {
  totalRevenue: number;
  averageRevenue: number;
  revenueChange: number;
}

export function RevenueStats({ totalRevenue, averageRevenue, revenueChange }: RevenueStatsProps) {
  const { t } = useTranslation();
  const { formatAmount } = useCurrency();
  
  return (
    <div className="space-y-3">
      <div className="flex flex-col space-y-2">
        <span className="text-lg font-semibold">Performance</span>
        <div className="text-sm font-normal text-muted-foreground">
          Total: {formatAmount(totalRevenue || 0)}
        </div>
        <div className="text-sm font-normal text-center">
          Monthly Average: {formatAmount(averageRevenue || 0)}
        </div>
        {!isNaN(revenueChange) && revenueChange !== 0 && (
          <div className={`text-sm text-center ${revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {revenueChange >= 0 ? '↑' : '↓'} {Math.abs(revenueChange).toFixed(1)}% vs last month
          </div>
        )}
      </div>
    </div>
  );
}