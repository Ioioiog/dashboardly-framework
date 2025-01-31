import { useState } from "react";
import { Home, Wrench, Users, Wallet } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { useMetrics } from "@/hooks/useMetrics";
import { useTranslation } from "react-i18next";
import { RevenueDetailsModal } from "./RevenueDetailsModal";
import { useCurrency } from "@/hooks/useCurrency";

export function DashboardMetrics({ userId, userRole }: { userId: string; userRole: "landlord" | "tenant" | "service_provider" }) {
  const { t } = useTranslation();
  const [showRevenueDetails, setShowRevenueDetails] = useState(false);
  const { formatAmount } = useCurrency();
  
  const { data: metrics, isLoading } = useMetrics(userId, userRole);

  console.log("DashboardMetrics - userRole:", userRole);
  console.log("DashboardMetrics - metrics:", metrics);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-fade-in">
        {[...Array(4)].map((_, i) => (
          <MetricCard
            key={i}
            title={t('dashboard.metrics.loading')}
            value="..."
            icon={Home}
            className="bg-white shadow-md hover:shadow-lg transition-all duration-300"
          />
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  const handleRevenueClick = () => {
    setShowRevenueDetails(true);
  };

  if (userRole === "service_provider") {
    return (
      <div className="grid gap-6 md:grid-cols-3 animate-fade-in">
        <MetricCard
          title={t('dashboard.metrics.activeJobs')}
          value={metrics.activeJobs || 0}
          icon={Wrench}
          route="/maintenance"
          className="bg-white shadow-md hover:shadow-lg transition-all duration-300"
          description={t('dashboard.metrics.activeJobsDesc')}
        />
        <MetricCard
          title={t('dashboard.metrics.completedJobs')}
          value={metrics.completedJobs || 0}
          icon={Home}
          route="/maintenance"
          className="bg-white shadow-md hover:shadow-lg transition-all duration-300"
          description={t('dashboard.metrics.completedJobsDesc')}
        />
        <MetricCard
          title={t('dashboard.metrics.monthlyEarnings')}
          value={formatAmount(metrics.monthlyEarnings || 0)}
          icon={Wallet}
          onClick={handleRevenueClick}
          className="bg-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
          description={t('dashboard.metrics.monthlyEarningsDesc')}
        />
      </div>
    );
  }

  if (userRole === "landlord") {
    return (
      <>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-fade-in">
          <MetricCard
            title={t('dashboard.metrics.totalProperties')}
            value={metrics.totalProperties}
            icon={Home}
            route="/properties"
            className="bg-white shadow-md hover:shadow-lg transition-all duration-300"
            description={t('dashboard.metrics.totalPropertiesDesc')}
          />
          <MetricCard
            title={t('dashboard.metrics.monthlyRevenue')}
            value={formatAmount(metrics.monthlyRevenue || 0)}
            icon={Wallet}
            onClick={handleRevenueClick}
            description={t('dashboard.metrics.monthlyRevenueDesc')}
            className="bg-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
          />
          <MetricCard
            title={t('dashboard.metrics.activeTenants')}
            value={metrics.activeTenants}
            icon={Users}
            route="/tenants"
            className="bg-white shadow-md hover:shadow-lg transition-all duration-300"
            description={t('dashboard.metrics.activeTenantsDesc')}
          />
          <MetricCard
            title={t('dashboard.metrics.pendingMaintenance')}
            value={metrics.pendingMaintenance}
            icon={Wrench}
            route="/maintenance"
            className="bg-white shadow-md hover:shadow-lg transition-all duration-300"
            description={t('dashboard.metrics.pendingMaintenanceDesc')}
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
          className="bg-white shadow-md hover:shadow-lg transition-all duration-300"
          description={t('dashboard.metrics.rentedPropertiesDesc')}
        />
        <MetricCard
          title={t('dashboard.metrics.pendingMaintenance')}
          value={metrics.pendingMaintenance}
          icon={Wrench}
          route="/maintenance"
          className="bg-white shadow-md hover:shadow-lg transition-all duration-300"
          description={t('dashboard.metrics.openMaintenanceDesc')}
        />
        <MetricCard
          title={t('dashboard.metrics.paymentStatus')}
          value={metrics.paymentStatus}
          icon={Wallet}
          onClick={handleRevenueClick}
          className="bg-white shadow-md hover:shadow-lg transition-all duration-300"
          description={t('dashboard.metrics.paymentStatusDesc')}
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