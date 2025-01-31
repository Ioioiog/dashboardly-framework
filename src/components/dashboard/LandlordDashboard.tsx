import { DashboardHeader } from "./sections/DashboardHeader";
import { DashboardMetrics } from "./DashboardMetrics";
import { RevenueSection } from "./sections/RevenueSection";
import { UpcomingIncomeSection } from "./sections/UpcomingIncomeSection";

interface LandlordDashboardProps {
  userId: string;
  userName: string;
}

export function LandlordDashboard({ userId, userName }: LandlordDashboardProps) {
  return (
    <div className="p-4 space-y-4">
      <DashboardHeader userName={userName} />
      <section className="bg-white rounded-lg shadow-sm p-4">
        <DashboardMetrics userId={userId} userRole="landlord" />
      </section>
      <RevenueSection userId={userId} />
      <UpcomingIncomeSection userId={userId} />
    </div>
  );
}