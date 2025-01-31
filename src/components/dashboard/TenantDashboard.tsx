import { DashboardHeader } from "./sections/DashboardHeader";
import { DashboardMetrics } from "./DashboardMetrics";
import { TenantDashboard as TenantInfo } from "@/components/tenants/TenantDashboard";

interface TenantDashboardProps {
  userId: string;
  userName: string;
  tenantInfo: any;
}

export function TenantDashboard({ userId, userName, tenantInfo }: TenantDashboardProps) {
  // Add safety check for tenantInfo
  const formattedTenantInfo = tenantInfo ? {
    property: {
      name: tenantInfo.property_name,
      address: tenantInfo.property_address,
      monthly_rent: 0, // You'll need to add this to your tenant_details view
      type: "Apartment" // You'll need to add this to your tenant_details view
    },
    start_date: tenantInfo.start_date,
    end_date: tenantInfo.end_date
  } : null;

  if (!formattedTenantInfo) {
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
        <TenantInfo tenantInfo={formattedTenantInfo} />
      </section>

      {/* Metrics Section */}
      <section className="bg-white rounded-xl shadow-sm p-6">
        <DashboardMetrics userId={userId} userRole="tenant" />
      </section>
    </div>
  );
}