import { useState } from "react";
import { RevenuePrediction } from "../RevenuePrediction";
import { Button } from "@/components/ui/button";
import { BarChart2, TrendingUp } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { RevenueChart } from "../RevenueChart";

interface RevenueSectionProps {
  userId: string;
}

export function RevenueSection({ userId }: RevenueSectionProps) {
  const [activeView, setActiveView] = useState<"history" | "predictions">("history");
  const [showRevenueModal, setShowRevenueModal] = useState(false);

  return (
    <section className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 transition-all duration-200 hover:shadow-xl">
      <div className="space-y-6">
        <div className="border-b border-gray-100 pb-5">
          <h2 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            Track your money
          </h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => setShowRevenueModal(true)}
              className="flex items-center gap-2 transition-all duration-200 hover:bg-gray-50"
              size="sm"
            >
              <BarChart2 className="w-4 h-4" />
              Revenue History
            </Button>
            <Button
              variant={activeView === "predictions" ? "default" : "outline"}
              onClick={() => setActiveView("predictions")}
              className={`flex items-center gap-2 transition-all duration-200 ${
                activeView === "predictions" 
                  ? "shadow-md hover:shadow-lg" 
                  : "hover:bg-gray-50"
              }`}
              size="sm"
            >
              <TrendingUp className="w-4 h-4" />
              Revenue Predictions
            </Button>
          </div>
        </div>
        
        <div className="space-y-6">
          {activeView === "predictions" && (
            <div className="animate-fade-in">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Revenue Predictions
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Projected revenue based on historical data
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                <RevenuePrediction userId={userId} />
              </div>
            </div>
          )}
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
    </section>
  );
}