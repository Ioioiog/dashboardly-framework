import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthlyRevenue } from "./types/revenue";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { calculatePredictedRevenue } from "./utils/predictionUtils";
import { getMonthsForRange } from "./utils/dateUtils";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

interface RevenuePredictionProps {
  userId: string;
}

export function RevenuePrediction({ userId }: RevenuePredictionProps) {
  const { t } = useTranslation();
  const [predictions, setPredictions] = useState<MonthlyRevenue[]>([]);
  const [totalPredicted, setTotalPredicted] = useState(0);
  const [averageMonthly, setAverageMonthly] = useState(0);

  const { data: revenueData, isLoading } = useQuery({
    queryKey: ["revenue-prediction", userId],
    queryFn: async () => {
      console.log("Fetching revenue data for predictions, landlord:", userId);
      const months = getMonthsForRange("6M");
      
      // Fetch payment data
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
        console.error("Error fetching prediction data:", error);
        throw error;
      }

      // Transform payments into monthly revenue data
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
        const total = predictedData.reduce((sum, month) => sum + month.revenue, 0);
        setTotalPredicted(total);
        setAverageMonthly(total / predictedData.length);
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

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Future Revenue Forecast
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Based on your historical revenue patterns
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          {predictions.map((prediction) => (
            <div 
              key={prediction.month}
              className="flex flex-col p-6 rounded-lg bg-card hover:shadow-md transition-shadow duration-200 border"
            >
              <span className="text-sm font-medium text-muted-foreground">
                {prediction.month}
              </span>
              <span className="text-2xl font-bold mt-2">
                ${prediction.revenue.toLocaleString()}
              </span>
              <div className="mt-4 space-y-2">
                <Badge variant="secondary" className="w-fit">
                  {prediction.count} payments expected
                </Badge>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 grid grid-cols-2 gap-6 p-6 rounded-lg bg-muted/5 border">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Total Predicted Revenue
            </h3>
            <p className="text-2xl font-bold mt-1">
              ${totalPredicted.toLocaleString()}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Monthly Average
            </h3>
            <p className="text-2xl font-bold mt-1">
              ${Math.round(averageMonthly).toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
