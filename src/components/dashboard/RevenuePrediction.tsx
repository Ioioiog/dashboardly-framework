import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthlyRevenue } from "./types/revenue";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { calculatePredictedRevenue } from "./utils/predictionUtils";
import { getMonthsForRange } from "./utils/dateUtils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect } from "react";

interface RevenuePredictionProps {
  userId: string;
}

export function RevenuePrediction({ userId }: RevenuePredictionProps) {
  const { t } = useTranslation();
  const [predictions, setPredictions] = useState<MonthlyRevenue[]>([]);

  const { data: revenueData, isLoading } = useQuery({
    queryKey: ["revenue-prediction", userId],
    queryFn: async () => {
      console.log("Fetching revenue data for predictions, landlord:", userId);
      const months = getMonthsForRange("6M");
      
      const { data: payments, error } = await supabase
        .from("payments")
        .select(`
          amount,
          paid_date,
          tenancy:tenancies(
            property:properties(
              landlord_id,
              monthly_rent
            )
          )
        `)
        .in("status", ["paid"])
        .gte("paid_date", months[0])
        .lte("paid_date", new Date().toISOString().split('T')[0])
        .eq("tenancy.property.landlord_id", userId);

      if (error) {
        console.error("Error fetching prediction data:", error);
        throw error;
      }

      const monthlyData = months.map(monthStart => {
        const monthPayments = payments?.filter(payment => 
          payment.paid_date?.startsWith(monthStart.substring(0, 7))
        ) || [];

        return {
          month: monthStart,
          revenue: monthPayments.reduce((sum, payment) => sum + Number(payment.amount), 0),
          count: monthPayments.length,
          average: monthPayments.length > 0 
            ? monthPayments.reduce((sum, payment) => sum + Number(payment.amount), 0) / monthPayments.length 
            : 0
        };
      });

      return monthlyData;
    }
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
          <CardTitle>{t('dashboard.revenue.prediction.title')}</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] animate-pulse bg-muted/10" />
      </Card>
    );
  }

  if (!revenueData?.length) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>{t('dashboard.revenue.prediction.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t('dashboard.revenue.noData', 'No revenue data available for predictions')}
          </p>
        </CardContent>
      </Card>
    );
  }

  const gradientId = "predictionGradient";

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Revenue Predictions
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Based on historical data and trends
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
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
                              <div>Predicted Payments: {data.count}</div>
                              <div>Average: ${data.average.toLocaleString()}</div>
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
        </div>
      </CardContent>
    </Card>
  );
}