import { useState } from "react";
import { RevenuePrediction } from "../RevenuePrediction";
import { Button } from "@/components/ui/button";
import { BarChart2, TrendingUp } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { RevenueChart } from "../RevenueChart";
import { useTranslation } from "react-i18next";

interface RevenueSectionProps {
  userId: string;
}

export function RevenueSection({ userId }: RevenueSectionProps) {
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [showPredictionsModal, setShowPredictionsModal] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowRevenueModal(true)}
        className="flex items-center gap-2 transition-all duration-200 hover:bg-gray-50"
        size="sm"
      >
        <BarChart2 className="w-4 h-4" />
        {t('dashboard.revenue.history')}
      </Button>
      <Button
        variant="outline"
        onClick={() => setShowPredictionsModal(true)}
        className="flex items-center gap-2 transition-all duration-200 hover:bg-gray-50"
        size="sm"
      >
        <TrendingUp className="w-4 h-4" />
        {t('dashboard.revenue.predictions')}
      </Button>

      <Dialog open={showRevenueModal} onOpenChange={setShowRevenueModal}>
        <DialogContent className="sm:max-w-[900px]">
          <div className="py-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {t('dashboard.revenue.history')}
            </h3>
            <div className="bg-white rounded-lg">
              <RevenueChart userId={userId} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPredictionsModal} onOpenChange={setShowPredictionsModal}>
        <DialogContent className="sm:max-w-[900px]">
          <div className="py-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {t('dashboard.revenue.predictions')}
            </h3>
            <div className="bg-white rounded-lg">
              <RevenuePrediction userId={userId} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}