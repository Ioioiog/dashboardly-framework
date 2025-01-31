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
      <div className="p-4">
        <p>Loading tenant information...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <DashboardHeader userName={userName} />
      <TenantInfo tenantInfo={tenantInfo} />
      <section className="bg-white rounded-lg shadow-sm p-4">
        <DashboardMetrics userId={userId} userRole="tenant" />
      </section>
    </div>
  );
}