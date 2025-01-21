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
      <div>
        <span>Performance</span>
        <div className="text-sm font-normal text-muted-foreground mt-1">
          Total: ${totalRevenue.toLocaleString()}
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-normal">
          Monthly Average: ${averageRevenue.toLocaleString()}
        </div>
        {!isNaN(revenueChange) && (
          <div className={`text-sm ${revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {revenueChange >= 0 ? '↑' : '↓'} {Math.abs(revenueChange).toFixed(1)}% vs last month
          </div>
        )}
      </div>
    </div>
  );
}