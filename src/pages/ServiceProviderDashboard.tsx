import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { useAuthState } from "@/hooks/useAuthState";

const ServiceProviderDashboard = () => {
  const { currentUserId } = useAuthState();

  if (!currentUserId) return null;

  return (
    <DashboardLayout>
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold mb-6">Service Provider Dashboard</h1>
        <section className="bg-white rounded-lg shadow-sm p-4">
          <DashboardMetrics userId={currentUserId} userRole="service_provider" />
        </section>
      </div>
    </DashboardLayout>
  );
};

export default ServiceProviderDashboard;