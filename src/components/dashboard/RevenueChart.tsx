import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimeRange, getMonthsForRange, formatMonthDisplay } from "./utils/dateUtils";
import { RevenueStats } from "./RevenueStats";
import { RevenuePrediction } from "./RevenuePrediction";
import { calculatePredictedRevenue } from "./utils/predictionUtils";
import { MonthlyRevenue } from "./types/revenue";
import { useState } from "react";

async function fetchRevenueData(userId: string, timeRange: TimeRange): Promise<MonthlyRevenue[]> {
  console.log("Fetching revenue data for landlord:", userId);
  
  const months = getMonthsForRange(timeRange);
  console.log("Fetching data for months:", months);

  const { data: payments, error } = await supabase
    .from("payments")
    .select(`
      amount,
      paid_date,
      tenancy:tenancies(
        property:properties(
          landlord_id
        )
      )
    `)
    .in("status", ["paid"])
    .gte("paid_date", months[0])
    .lte("paid_date", new Date().toISOString().split('T')[0])
    .eq("tenancy.property.landlord_id", userId);

  if (error) {
    console.error("Error fetching revenue data:", error);
    throw error;
  }

  console.log("Raw payment data:", payments);

  const monthlyRevenue = months.map(monthStart => {
    const monthPayments = payments?.filter(payment => 
      payment.paid_date?.startsWith(monthStart.substring(0, 7))
    ) || [];

    const totalRevenue = monthPayments.reduce((sum, payment) => 
      sum + Number(payment.amount), 0);

    const paymentCount = monthPayments.length;
    const averagePayment = paymentCount > 0 
      ? totalRevenue / paymentCount 
      : 0;

    return {
      month: formatMonthDisplay(monthStart),
      revenue: totalRevenue,
      count: paymentCount,
      average: averagePayment
    };
  });

  console.log("Processed monthly revenue:", monthlyRevenue);
  return monthlyRevenue;
}

export function RevenueChart({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState<TimeRange>("6M");
  
  const { data: revenueData, isLoading } = useQuery({
    queryKey: ["revenue-chart", userId, timeRange],
    queryFn: () => fetchRevenueData(userId, timeRange),
  });

  if (isLoading) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>{t('dashboard.revenue.title')}</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] animate-pulse bg-muted" />
      </Card>
    );
  }

  if (!revenueData) return null;

  const predictions = calculatePredictedRevenue(revenueData);
  const combinedData = [...revenueData, ...predictions];
  
  const gradientId = "revenueGradient";
  const totalRevenue = revenueData.reduce((sum, month) => sum + month.revenue, 0);
  const averageRevenue = totalRevenue / revenueData.length;
  const currentMonthRevenue = revenueData[revenueData.length - 1].revenue;
  const previousMonthRevenue = revenueData[revenueData.length - 2]?.revenue || 0;
  const revenueChange = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;

  return (
    <>
      <Card className="col-span-4 transition-all duration-200 hover:shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              <RevenueStats 
                totalRevenue={totalRevenue}
                averageRevenue={averageRevenue}
                revenueChange={revenueChange}
              />
            </CardTitle>
            <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1M">Last Month</SelectItem>
                <SelectItem value="6M">Last 6 Months</SelectItem>
                <SelectItem value="1Y">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="h-[400px]">
          {combinedData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={combinedData}
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
                                {data.month} {data.isPrediction && '(Predicted)'}
                              </span>
                              <span className="font-bold text-lg">
                                ${data.revenue.toLocaleString()}
                              </span>
                              <div className="mt-1 text-xs text-muted-foreground">
                                <div>Payments: {data.count}</div>
                                {data.count > 0 && (
                                  <div>Average: ${data.average.toLocaleString()}</div>
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
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
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
                  {t('dashboard.revenue.noData')}
                </p>
                <p className="text-sm text-muted-foreground">
                  Payments will appear here once processed
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <RevenuePrediction predictions={predictions} />
    </>
  );
}