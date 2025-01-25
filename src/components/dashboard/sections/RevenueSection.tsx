import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp } from "lucide-react";
import { RevenueChart } from "../RevenueChart";
import { RevenuePrediction } from "../RevenuePrediction";

interface RevenueSectionProps {
  userId: string;
}

export function RevenueSection({ userId }: RevenueSectionProps) {
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [showPredictionsModal, setShowPredictionsModal] = useState(false);

  return (
    <section className="bg-white rounded-xl shadow-md p-6 transition-all duration-200 hover:shadow-lg">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Revenue Overview
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Track and analyze your revenue data
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowRevenueModal(true)}
              className="flex items-center gap-2 transition-all duration-200 hover:bg-gray-50"
              size="sm"
            >
              <BarChart3 className="w-4 h-4" />
              Revenue History
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPredictionsModal(true)}
              className="flex items-center gap-2 transition-all duration-200 hover:bg-gray-50"
              size="sm"
            >
              <TrendingUp className="w-4 h-4" />
              Revenue Predictions
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showRevenueModal} onOpenChange={setShowRevenueModal}>
        <DialogContent className="sm:max-w-[900px]">
          <div className="py-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Revenue History
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
              Revenue Predictions
            </h3>
            <div className="bg-white rounded-lg">
              <RevenuePrediction userId={userId} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}