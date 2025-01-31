import { DashboardHeader } from "./sections/DashboardHeader";
import { DashboardMetrics } from "./DashboardMetrics";
import { TenantDashboard as TenantInfo } from "@/components/tenants/TenantDashboard";

interface TenantDashboardProps {
  userId: string;
  userName: string;
  tenantInfo: any;
}

export function TenantDashboard({ userId, userName, tenantInfo }: TenantDashboardProps) {
  if (!tenantInfo) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <p className="text-muted-foreground">Loading tenant information...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <section className="bg-white rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md">
        <DashboardHeader userName={userName} />
      </section>

      {/* Tenant Info Section */}
      <section className="bg-white rounded-xl shadow-sm p-6">
        <TenantInfo tenantInfo={tenantInfo} />
      </section>

      {/* Metrics Section */}
      <section className="bg-white rounded-xl shadow-sm p-6">
        <DashboardMetrics userId={userId} userRole="tenant" />
      </section>
    </div>
  );
}