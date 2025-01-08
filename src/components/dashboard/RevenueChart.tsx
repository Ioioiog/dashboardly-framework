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
  
  // Get last 6 months
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(startOfMonth(new Date()), i);
    return format(date, "yyyy-MM-dd");
  }).reverse();

  console.log("Fetching data for months:", months);

  // Get all payments for properties owned by this landlord
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

  // Group payments by month
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

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>{t('dashboard.revenue.title')}</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        {revenueData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={revenueData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="month"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Month
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {payload[0].payload.month}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Revenue
                          </span>
                          <span className="font-bold">
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
            />
          </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {t('dashboard.revenue.noData')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
