import { useTranslation } from "react-i18next";

interface RevenueStatsProps {
  totalRevenue: number;
  averageRevenue: number;
  revenueChange: number;
}

export function RevenueStats({ totalRevenue, averageRevenue, revenueChange }: RevenueStatsProps) {
  const { t } = useTranslation();
  
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-3">
        <span>Performance</span>
        <div className="text-sm font-normal text-muted-foreground">
          Total: ${totalRevenue.toLocaleString()}
        </div>
      </div>
      <div className="text-right flex flex-col items-end">
        <div className="text-sm font-normal text-center">
          Monthly Average: ${averageRevenue.toLocaleString()}
        </div>
        {!isNaN(revenueChange) && (
          <div className={`text-sm text-center ${revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {revenueChange >= 0 ? '↑' : '↓'} {Math.abs(revenueChange).toFixed(1)}% vs last month
          </div>
        )}
      </div>
    </div>
  );
}