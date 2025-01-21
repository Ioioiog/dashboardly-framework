import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthlyRevenue } from "./types/revenue";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { calculatePredictedRevenue } from "./utils/predictionUtils";
import { getMonthsForRange } from "./utils/dateUtils";

interface RevenuePredictionProps {
  userId: string;
}

export function RevenuePrediction({ userId }: RevenuePredictionProps) {
  const { t } = useTranslation();

  const { data: revenueData, isLoading } = useQuery({
    queryKey: ["revenue-prediction", userId],
    queryFn: async () => {
      console.log("Fetching revenue data for predictions, landlord:", userId);
      const months = getMonthsForRange("6M"); // Use last 6 months for prediction base
      
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

      return payments || [];
    }
  });

  if (isLoading) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>{t('dashboard.revenue.prediction.title')}</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] animate-pulse bg-muted" />
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

  const predictions = calculatePredictedRevenue(revenueData);
  const totalPredicted = predictions.reduce((sum, month) => sum + month.revenue, 0);
  const averageMonthly = totalPredicted / predictions.length;

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {t('dashboard.revenue.prediction.title', 'Revenue Prediction')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {predictions.map((prediction) => (
            <div 
              key={prediction.month}
              className="flex flex-col p-4 bg-muted/5 rounded-lg border border-border/50"
            >
              <span className="text-sm text-muted-foreground">{prediction.month}</span>
              <span className="text-2xl font-semibold mt-1">
                ${prediction.revenue.toLocaleString()}
              </span>
              <div className="text-sm text-muted-foreground mt-2">
                <div>Expected payments: {prediction.count}</div>
                <div>Avg. payment: ${Math.round(prediction.average).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-muted-foreground">
              {t('dashboard.revenue.prediction.totalPredicted', 'Total Predicted Revenue')}
            </span>
            <p className="text-xl font-semibold mt-1">
              ${totalPredicted.toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">
              {t('dashboard.revenue.prediction.monthlyAverage', 'Predicted Monthly Average')}
            </span>
            <p className="text-xl font-semibold mt-1">
              ${Math.round(averageMonthly).toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}