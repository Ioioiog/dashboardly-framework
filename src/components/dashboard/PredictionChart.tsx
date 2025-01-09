import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthlyRevenue } from "./types/revenue";
import { useTranslation } from "react-i18next";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PredictionChartProps {
  predictions: MonthlyRevenue[];
}

export function PredictionChart({ predictions }: PredictionChartProps) {
  const { t } = useTranslation();

  if (!predictions.length) return null;

  const gradientId = "predictionGradient";

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>
          {t('dashboard.revenue.prediction.chart.title', 'Revenue Forecast')}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={predictions}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              className="stroke-muted/30"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={{ stroke: "hsl(var(--border))" }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as MonthlyRevenue;
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-lg ring-1 ring-black/5">
                      <div className="grid gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            {data.month}
                          </span>
                          <span className="font-bold text-lg">
                            ${data.revenue.toLocaleString()}
                          </span>
                          <div className="mt-1 text-xs text-muted-foreground">
                            <div>Expected payments: {data.count}</div>
                            <div>Avg. payment: ${Math.round(data.average).toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{
                r: 6,
                style: { fill: "hsl(var(--primary))", opacity: 1 }
              }}
              fill={`url(#${gradientId})`}
              isAnimationActive={true}
              animationDuration={1500}
              animationBegin={0}
              animationEasing="ease-in-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}