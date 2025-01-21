import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { MonthlyRevenue } from "./types/revenue";
import { useState } from "react";

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
        status
      )
    `)
    .eq("landlord_id", userId);

  if (propertiesError) {
    console.error("Error fetching properties data:", propertiesError);
    throw propertiesError;
  }

  if (!properties) {
    console.log("No properties found for user");
    return [];
  }

  console.log("Raw properties data:", properties);

  const monthlyRevenue = months.map(monthStart => {
    const monthDate = new Date(monthStart);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

    let totalRevenue = 0;
    const propertyBreakdown: Record<string, { name: string; total: number; count: number }> = {};

    // Calculate revenue for each property based on active tenancies
    properties.forEach(property => {
      if (!property) return; // Skip if property is undefined
      
      const activeTenantsInMonth = property.tenancies?.filter(tenancy => {
        if (!tenancy) return false; // Skip if tenancy is undefined
        
        const startDate = new Date(tenancy.start_date);
        const endDate = tenancy.end_date ? new Date(tenancy.end_date) : null;
        
        return (
          tenancy.status === 'active' &&
          startDate <= monthEnd &&
          (!endDate || endDate >= monthDate)
        );
      });

      if (activeTenantsInMonth && activeTenantsInMonth.length > 0) {
        const propertyRevenue = property.monthly_rent || 0;
        totalRevenue += propertyRevenue;

        propertyBreakdown[property.id] = {
          name: property.name || 'Unnamed Property',
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
  
  const { data: revenueData, isLoading } = useQuery({
    queryKey: ["revenue-chart", userId, timeRange],
    queryFn: () => fetchRevenueData(userId, timeRange),
  });

  if (isLoading) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <div className="space-y-3">
            <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
          </div>
        </CardHeader>
        <CardContent className="h-[300px] animate-pulse bg-muted/10" />
      </Card>
    );
  }

  if (!revenueData || revenueData.length === 0) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Revenue Data</h3>
            <p className="text-sm text-muted-foreground">No revenue data available</p>
          </div>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Start adding properties and tenants to see revenue data</p>
        </CardContent>
      </Card>
    );
  }

  const gradientId = "revenueGradient";
  const totalRevenue = revenueData.reduce((sum, month) => sum + (month?.revenue || 0), 0);
  const averageRevenue = totalRevenue / revenueData.length;
  const currentMonthRevenue = revenueData[revenueData.length - 1]?.revenue || 0;
  const previousMonthRevenue = revenueData[revenueData.length - 2]?.revenue || 0;
  const revenueChange = previousMonthRevenue === 0 ? 0 : 
    ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;

  return (
    <Card className="col-span-4 overflow-hidden bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <CardHeader className="pb-4">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="space-y-1">
            <RevenueStats 
              totalRevenue={totalRevenue}
              averageRevenue={averageRevenue}
              revenueChange={revenueChange}
            />
          </div>
          <Select 
            value={timeRange} 
            onValueChange={(value: TimeRange) => setTimeRange(value)}
          >
            <SelectTrigger className="h-8 w-[140px] bg-background border-muted-foreground/20">
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
      <CardContent className="h-[300px] pt-4">
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
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                className="stroke-muted/20"
                horizontal={true}
                vertical={false}
              />
              <XAxis
                dataKey="month"
                className="text-xs font-medium"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis
                className="text-xs font-medium"
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
                      <div className="rounded-lg border bg-background/95 p-4 shadow-xl ring-1 ring-black/5 backdrop-blur-sm">
                        <div className="grid gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground font-medium">
                              {data.month}
                            </span>
                            <span className="font-bold text-xl">
                              ${data.revenue.toLocaleString()}
                            </span>
                            <div className="mt-1.5 text-xs text-muted-foreground">
                              <div className="font-medium">Total Payments: {data.count}</div>
                              {data.count > 0 && (
                                <div className="font-medium">Average: ${data.average.toLocaleString()}</div>
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
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                dot={false}
                activeDot={{
                  r: 6,
                  style: { fill: "hsl(var(--primary))", opacity: 1 }
                }}
                fill={`url(#${gradientId})`}
                isAnimationActive={true}
                animationDuration={1500}
                animationBegin={0}
                animationEasing="ease-out"
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
  );
}
