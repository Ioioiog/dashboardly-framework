import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MonthlyRevenue, TimeRange } from "./types/revenue";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface PredictionChartProps {
  predictions: MonthlyRevenue[];
}

export function PredictionChart({ predictions }: PredictionChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("6M");
  
  const filteredPredictions = predictions.slice(0, 
    timeRange === "1M" ? 1 : timeRange === "6M" ? 6 : 12
  );

  const averagePrediction = filteredPredictions.reduce((sum, month) => 
    sum + month.revenue, 0) / filteredPredictions.length;

  const maxPrediction = Math.max(...filteredPredictions.map(p => p.revenue));
  const minPrediction = Math.min(...filteredPredictions.map(p => p.revenue));
  const growthRate = ((maxPrediction - minPrediction) / minPrediction) * 100;

  const gradientId = "predictionGradient";

  return (
    <Card className="col-span-4 transition-all duration-200 hover:shadow-lg">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Revenue Predictions</CardTitle>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">About Predictions</h4>
                  <p className="text-sm text-muted-foreground">
                    Predictions are calculated based on historical revenue data and growth patterns.
                    These are estimates and actual results may vary.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
          <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1M">Next Month</SelectItem>
              <SelectItem value="6M">Next 6 Months</SelectItem>
              <SelectItem value="1Y">Next Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline" className="bg-primary/5">
            Avg: ${averagePrediction.toLocaleString()}
          </Badge>
          <Badge variant="outline" className="bg-primary/5">
            Growth: {growthRate.toFixed(1)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="h-[300px] p-4">
        {filteredPredictions.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredPredictions}
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
                    const percentChange = data.revenue > averagePrediction
                      ? ((data.revenue - averagePrediction) / averagePrediction) * 100
                      : ((averagePrediction - data.revenue) / averagePrediction) * -100;

                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-lg ring-1 ring-black/5">
                        <div className="grid gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {data.month} (Predicted)
                            </span>
                            <span className="font-bold text-lg">
                              ${data.revenue.toLocaleString()}
                            </span>
                            <div className="mt-1 text-xs space-y-1">
                              <div className={`flex items-center gap-1 ${
                                percentChange >= 0 ? 'text-green-500' : 'text-red-500'
                              }`}>
                                {percentChange >= 0 ? '↑' : '↓'} {Math.abs(percentChange).toFixed(1)}% vs average
                              </div>
                              <div className="text-muted-foreground">
                                Expected payments: {data.count}
                              </div>
                              {data.count > 0 && (
                                <div className="text-muted-foreground">
                                  Avg payment: ${data.average.toLocaleString()}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={averagePrediction}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="3 3"
                label={{
                  value: "Average",
                  position: "right",
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 12,
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
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">
                No prediction data available
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
