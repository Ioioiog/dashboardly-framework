import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthlyRevenue } from "./types/revenue";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { calculatePredictedRevenue } from "./utils/predictionUtils";
import { getMonthsForRange } from "./utils/dateUtils";
import { useState, useEffect } from "react";
import { ChartSkeleton } from "./charts/ChartSkeleton";
import { NoDataCard } from "./charts/NoDataCard";
import { RevenueLineChart } from "./charts/RevenueLineChart";

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
    return <ChartSkeleton title={t('dashboard.revenue.prediction.title')} />;
  }

  if (!revenueData?.length) {
    return (
      <NoDataCard 
        title={t('dashboard.revenue.prediction.title')}
        message={t('dashboard.revenue.noData', 'No revenue data available for predictions')}
      />
    );
  }

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Revenue Predictions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <RevenueLineChart 
            data={predictions} 
            gradientId="predictionGradient"
            isPrediction={true}
          />
        </div>
      </CardContent>
    </Card>
  );
}