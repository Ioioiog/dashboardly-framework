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
import { PredictionChart } from "./PredictionChart";
import { calculatePredictedRevenue } from "./utils/predictionUtils";
import { MonthlyRevenue } from "./types/revenue";
import { useState, useEffect } from "react";

async function fetchRevenueData(userId: string, timeRange: TimeRange): Promise<MonthlyRevenue[]> {
  console.log("Fetching revenue data for landlord:", userId);
  
  const months = getMonthsForRange(timeRange);
  console.log("Fetching data for months:", months);

  // Fetch all properties owned by the landlord with their active tenancies
  const { data: properties, error: propertiesError } = await supabase
    .from("properties")
    .select(`
      id,
      name,
      monthly_rent,
      tenancies (
        id,
        start_date,
        end_date,
        status,
        tenant:profiles (
          id,
          first_name,
          last_name
        )
      )
    `)
    .eq("landlord_id", userId);

  if (propertiesError) {
    console.error("Error fetching properties data:", propertiesError);
    throw propertiesError;
  }

  console.log("Raw properties data:", properties);

  const monthlyRevenue = months.map(monthStart => {
    const monthDate = new Date(monthStart);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

    let totalRevenue = 0;
    const propertyBreakdown: Record<string, { name: string; total: number; count: number }> = {};

    // Calculate revenue for each property based on active tenancies
    properties?.forEach(property => {
      const activeTenantsInMonth = property.tenancies?.filter(tenancy => {
        const startDate = new Date(tenancy.start_date);
        const endDate = tenancy.end_date ? new Date(tenancy.end_date) : null;
        
        return (
          tenancy.status === 'active' &&
          startDate <= monthEnd &&
          (!endDate || endDate >= monthDate)
        );
      });

      if (activeTenantsInMonth && activeTenantsInMonth.length > 0) {
        const propertyRevenue = property.monthly_rent;
        totalRevenue += propertyRevenue;

        propertyBreakdown[property.id] = {
          name: property.name,
          total: propertyRevenue,
          count: activeTenantsInMonth.length
        };
      }
    });

    const totalCount = Object.values(propertyBreakdown).reduce((sum, p) => sum + p.count, 0);
    const averageRevenue = totalCount > 0 ? totalRevenue / totalCount : 0;

    return {
      month: formatMonthDisplay(monthStart),
      revenue: totalRevenue,
      count: totalCount,
      average: averageRevenue,
      propertyBreakdown: Object.values(propertyBreakdown)
    };
  });

  console.log("Processed monthly revenue:", monthlyRevenue);
  return monthlyRevenue;
}

export function RevenueChart({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState<TimeRange>("6M");
  const [predictions, setPredictions] = useState<MonthlyRevenue[]>([]);
  
  const { data: revenueData, isLoading } = useQuery({
    queryKey: ["revenue-chart", userId, timeRange],
    queryFn: () => fetchRevenueData(userId, timeRange),
  });

  useEffect(() => {
    async function loadPredictions() {
      if (revenueData) {
        const predictedData = await calculatePredictedRevenue(revenueData, userId);
        setPredictions(predictedData);
      }
    }
    loadPredictions();
  }, [revenueData, userId]);

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
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenueData}
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
                      const data = payload[0].payload as MonthlyRevenue & {
                        propertyBreakdown?: Array<{ name: string; total: number; count: number }>;
                      };
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
                                <div>Total Payments: {data.count}</div>
                                {data.count > 0 && (
                                  <div>Average: ${data.average.toLocaleString()}</div>
                                )}
                              </div>
                              {data.propertyBreakdown && data.propertyBreakdown.length > 0 && (
                                <div className="mt-2 border-t pt-2">
                                  <span className="text-xs font-medium">Property Breakdown:</span>
                                  {data.propertyBreakdown.map((prop, idx) => (
                                    <div key={idx} className="text-xs text-muted-foreground mt-1">
                                      {prop.name}: ${prop.total.toLocaleString()} ({prop.count} payments)
                                    </div>
                                  ))}
                                </div>
                              )}
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
      <PredictionChart predictions={predictions} />
    </>
  );
}
