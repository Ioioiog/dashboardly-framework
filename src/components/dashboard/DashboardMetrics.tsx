import { useState } from "react";
import { Home, Settings, Users, Wallet } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { useMetrics } from "@/hooks/useMetrics";
import { useTranslation } from "react-i18next";
import { RevenueDetailsModal } from "./RevenueDetailsModal";

export function DashboardMetrics({ userId, userRole }: { userId: string; userRole: "landlord" | "tenant" }) {
  const { t } = useTranslation();
  const [showRevenueDetails, setShowRevenueDetails] = useState(false);
  
  const { data: metrics, isLoading } = useMetrics(userId, userRole);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-fade-in">
        {[...Array(4)].map((_, i) => (
          <MetricCard
            key={i}
            title="Loading..."
            value="..."
            icon={Home}
            className="bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-lg transition-all duration-300"
          />
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  const handleRevenueClick = () => {
    setShowRevenueDetails(true);
  };

  if (userRole === "landlord") {
    return (
      <>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-fade-in">
          <MetricCard
            title={t('dashboard.metrics.totalProperties')}
            value={metrics.totalProperties}
            icon={Home}
            route="/properties"
            className="bg-gradient-to-br from-white to-blue-50 shadow-md hover:shadow-lg transition-all duration-300"
            description="Total managed properties"
          />
          <MetricCard
            title={t('dashboard.metrics.monthlyRevenue')}
            value={`$${metrics.monthlyRevenue?.toLocaleString()}`}
            icon={Wallet}
            onClick={handleRevenueClick}
            description={t('dashboard.revenue.title')}
            className="bg-gradient-to-br from-white to-green-50 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
          />
          <MetricCard
            title={t('dashboard.metrics.activeTenants')}
            value={metrics.activeTenants}
            icon={Users}
            route="/tenants"
            className="bg-gradient-to-br from-white to-purple-50 shadow-md hover:shadow-lg transition-all duration-300"
            description="Currently active tenants"
          />
          <MetricCard
            title={t('dashboard.metrics.pendingMaintenance')}
            value={metrics.pendingMaintenance}
            icon={Settings}
            route="/maintenance"
            className="bg-gradient-to-br from-white to-orange-50 shadow-md hover:shadow-lg transition-all duration-300"
            description="Pending maintenance requests"
          />
        </div>

        <RevenueDetailsModal
          open={showRevenueDetails}
          onOpenChange={setShowRevenueDetails}
          revenueDetails={metrics.revenueDetails}
        />
      </>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-3 animate-fade-in">
        <MetricCard
          title={t('dashboard.metrics.totalProperties')}
          value={metrics.totalProperties}
          icon={Home}
          route="/properties"
          className="bg-gradient-to-br from-white to-blue-50 shadow-md hover:shadow-lg transition-all duration-300"
          description="Your rented properties"
        />
        <MetricCard
          title={t('dashboard.metrics.pendingMaintenance')}
          value={metrics.pendingMaintenance}
          icon={Settings}
          route="/maintenance"
          className="bg-gradient-to-br from-white to-orange-50 shadow-md hover:shadow-lg transition-all duration-300"
          description="Open maintenance requests"
        />
        <MetricCard
          title={t('dashboard.metrics.paymentStatus')}
          value={metrics.paymentStatus}
          icon={Wallet}
          onClick={handleRevenueClick}
          className="bg-gradient-to-br from-white to-green-50 shadow-md hover:shadow-lg transition-all duration-300"
          description="Click to view monthly payments"
        />
      </div>

      <RevenueDetailsModal
        open={showRevenueDetails}
        onOpenChange={setShowRevenueDetails}
        revenueDetails={metrics.revenueDetails}
      />
    </>
  );
}