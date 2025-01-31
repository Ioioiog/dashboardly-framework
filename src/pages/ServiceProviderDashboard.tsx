import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { useAuthState } from "@/hooks/useAuthState";

const ServiceProviderDashboard = () => {
  const { currentUserId } = useAuthState();

  if (!currentUserId) return null;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Service Provider Dashboard</h1>
      <div className="grid gap-6">
        <DashboardMetrics userId={currentUserId} userRole="service_provider" />
      </div>
    </div>
  );
};

export default ServiceProviderDashboard;