import { useState } from "react";
import { RevenueChart } from "../RevenueChart";
import { RevenuePrediction } from "../RevenuePrediction";
import { Button } from "@/components/ui/button";
import { BarChart2, TrendingUp } from "lucide-react";

interface RevenueSectionProps {
  userId: string;
}

export function RevenueSection({ userId }: RevenueSectionProps) {
  const [activeView, setActiveView] = useState<"history" | "predictions">("history");

  return (
    <section className="bg-white rounded-lg shadow-sm p-4">
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Track your money
          </h2>
          <div className="mt-4 flex gap-2">
            <Button
              variant={activeView === "history" ? "default" : "outline"}
              onClick={() => setActiveView("history")}
              className="flex items-center gap-2"
              size="sm"
            >
              <BarChart2 className="w-4 h-4" />
              Revenue History
            </Button>
            <Button
              variant={activeView === "predictions" ? "default" : "outline"}
              onClick={() => setActiveView("predictions")}
              className="flex items-center gap-2"
              size="sm"
            >
              <TrendingUp className="w-4 h-4" />
              Revenue Predictions
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          {activeView === "history" ? (
            <div>
              <div className="mb-3">
                <h3 className="text-xl font-semibold text-gray-800">
                  Revenue History
                </h3>
                <p className="text-sm text-dashboard-text-muted">
                  Historical view of your monthly revenue performance
                </p>
              </div>
              <div className="bg-dashboard-accent rounded-lg">
                <RevenueChart userId={userId} />
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-3">
                <h3 className="text-xl font-semibold text-gray-800">
                  Revenue Predictions
                </h3>
              </div>
              <div className="bg-dashboard-accent rounded-lg">
                <RevenuePrediction userId={userId} />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}