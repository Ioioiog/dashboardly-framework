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
import { startOfMonth, subMonths, format } from "date-fns";

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

async function fetchRevenueData(userId: string): Promise<MonthlyRevenue[]> {
  console.log("Fetching revenue data for landlord:", userId);
  
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(startOfMonth(new Date()), i);
    return format(date, "yyyy-MM-dd");
  }).reverse();

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
    .lte("paid_date", format(new Date(), "yyyy-MM-dd"))
    .eq("tenancy.property.landlord_id", userId);

  if (error) {
    console.error("Error fetching revenue data:", error);
    throw error;
  }

  console.log("Raw payment data:", payments);

  const monthlyRevenue = months.map(monthStart => {
    const monthRevenue = payments?.reduce((sum, payment) => {
      if (payment.paid_date?.startsWith(monthStart.substring(0, 7))) {
        return sum + Number(payment.amount);
      }
      return sum;
    }, 0) || 0;

    return {
      month: format(new Date(monthStart), "MMM yyyy"),
      revenue: monthRevenue,
    };
  });

  console.log("Processed monthly revenue:", monthlyRevenue);
  return monthlyRevenue;
}

export function RevenueChart({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const { data: revenueData, isLoading } = useQuery({
    queryKey: ["revenue-chart", userId],
    queryFn: () => fetchRevenueData(userId),
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

  const gradientId = "revenueGradient";

  return (
    <Card className="col-span-4 transition-all duration-200 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t('dashboard.revenue.title')}</span>
          <span className="text-sm font-normal text-muted-foreground">
            Last 6 months
          </span>
        </CardTitle>
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
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-lg ring-1 ring-black/5">
                        <div className="grid gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {payload[0].payload.month}
                            </span>
                            <span className="font-bold text-lg">
                              ${payload[0].value.toLocaleString()}
                            </span>
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
  );
}