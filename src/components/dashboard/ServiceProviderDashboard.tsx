import { DashboardMetrics } from "./DashboardMetrics";

interface ServiceProviderDashboardProps {
  userId: string;
}

export function ServiceProviderDashboard({ userId }: ServiceProviderDashboardProps) {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-6">Service Provider Dashboard</h1>
      <section className="bg-white rounded-lg shadow-sm p-4">
        <DashboardMetrics userId={userId} userRole="service_provider" />
      </section>
    </div>
  );
}