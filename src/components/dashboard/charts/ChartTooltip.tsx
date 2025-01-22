import { MonthlyRevenue } from "../types/revenue";

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  isPrediction?: boolean;
}

export function ChartTooltip({ active, payload, isPrediction = false }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload as MonthlyRevenue;
  const percentChange = data.average ? 
    ((data.revenue - data.average) / data.average) * 100 : 0;

  return (
    <div className="rounded-lg border bg-background/95 p-4 shadow-xl ring-1 ring-black/5 backdrop-blur-sm">
      <div className="grid gap-2">
        <div className="flex flex-col">
          <span className="text-[0.70rem] uppercase text-muted-foreground font-medium">
            {data.month} {isPrediction ? '(Predicted)' : ''}
          </span>
          <span className="font-bold text-xl">
            ${data.revenue.toLocaleString()}
          </span>
          <div className="mt-1.5 text-xs text-muted-foreground">
            <div className="font-medium">Total Payments: {data.count}</div>
            {data.count > 0 && (
              <div className="font-medium">Average: ${data.average.toLocaleString()}</div>
            )}
            {percentChange !== 0 && (
              <div className={`flex items-center gap-1 ${
                percentChange >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {percentChange >= 0 ? '↑' : '↓'} {Math.abs(percentChange).toFixed(1)}% vs average
              </div>
            )}
          </div>
          {data.propertyBreakdown && data.propertyBreakdown.length > 0 && (
            <div className="mt-3 border-t pt-2">
              <span className="text-xs font-semibold">Property Breakdown:</span>
              {data.propertyBreakdown.map((prop, idx) => (
                <div key={idx} className="text-xs text-muted-foreground mt-1.5 flex justify-between">
                  <span>{prop.name}:</span>
                  <span className="font-medium">${prop.total.toLocaleString()} ({prop.count} payments)</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}