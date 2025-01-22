import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface NoDataCardProps {
  title?: string;
  message?: string;
}

export function NoDataCard({ title = "Revenue Data", message }: NoDataCardProps) {
  const { t } = useTranslation();
  
  return (
    <Card className="col-span-4">
      <CardHeader>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">No data available</p>
        </div>
      </CardHeader>
      <CardContent className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">
          {message || t('dashboard.revenue.noData')}
        </p>
      </CardContent>
    </Card>
  );
}