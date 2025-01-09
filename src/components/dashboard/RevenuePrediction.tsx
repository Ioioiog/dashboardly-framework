import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthlyRevenue } from "./types/revenue";
import { useTranslation } from "react-i18next";

interface RevenuePredictionProps {
  predictions: MonthlyRevenue[];
}

export function RevenuePrediction({ predictions }: RevenuePredictionProps) {
  const { t } = useTranslation();

  if (!predictions.length) return null;

  const totalPredicted = predictions.reduce((sum, month) => sum + month.revenue, 0);
  const averageMonthly = totalPredicted / predictions.length;

  return (
    <Card className="col-span-4 mt-4">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {t('dashboard.revenue.prediction.title', 'Revenue Prediction')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {predictions.map((prediction, index) => (
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