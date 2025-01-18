import { useQuery } from "@tanstack/react-query";
import { Home, Settings, Users, Wallet } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

interface Metrics {
  totalProperties?: number;
  monthlyRevenue?: number;
  activeTenants?: number;
  pendingMaintenance: number;
  paymentStatus?: string;
}

async function fetchLandlordMetrics(userId: string): Promise<Metrics> {
  console.log("Fetching landlord metrics for user:", userId);
  
  // First get the properties for this landlord
  const { data: properties } = await supabase
    .from("properties")
    .select("id, monthly_rent")
    .eq("landlord_id", userId);

  if (!properties) {
    console.log("No properties found for landlord");
    return {
      totalProperties: 0,
      monthlyRevenue: 0,
      activeTenants: 0,
      pendingMaintenance: 0,
    };
  }

  const propertyIds = properties.map(p => p.id);
  console.log("Found properties:", propertyIds);

  const [tenantsCount, maintenanceCount] = await Promise.all([
    supabase
      .from("tenancies")
      .select("id", { count: "exact" })
      .eq("status", "active")
      .in("property_id", propertyIds),
    supabase
      .from("maintenance_requests")
      .select("id", { count: "exact" })
      .eq("status", "pending")
      .in("property_id", propertyIds),
  ]);

  const totalRevenue = properties.reduce(
    (sum, property) => sum + Number(property.monthly_rent),
    0
  );

  console.log("Landlord metrics calculated:", {
    properties: properties.length,
    revenue: totalRevenue,
    tenants: tenantsCount.count,
    maintenance: maintenanceCount.count,
  });

  return {
    totalProperties: properties.length,
    monthlyRevenue: totalRevenue,
    activeTenants: tenantsCount.count || 0,
    pendingMaintenance: maintenanceCount.count || 0,
  };
}

async function fetchTenantMetrics(userId: string): Promise<Metrics> {
  console.log("Fetching tenant metrics for user:", userId);
  
  // Get count of active tenancies for this tenant
  const { count: propertiesCount, error: tenancyError } = await supabase
    .from("tenancies")
    .select("id", { count: "exact" })
    .eq("tenant_id", userId)
    .eq("status", "active");

  console.log("Active tenancies count:", propertiesCount);

  if (tenancyError) {
    console.error("Error fetching tenancies:", tenancyError);
    throw tenancyError;
  }

  // Get the latest payment by joining through tenancies
  const { data: tenancies } = await supabase
    .from("tenancies")
    .select("id")
    .eq("tenant_id", userId)
    .eq("status", "active");

  const tenancyIds = tenancies?.map(t => t.id) || [];

  const [maintenanceCount, latestPayment] = await Promise.all([
    supabase
      .from("maintenance_requests")
      .select("id", { count: "exact" })
      .eq("tenant_id", userId)
      .eq("status", "pending"),
    supabase
      .from("payments")
      .select("status")
      .in("tenancy_id", tenancyIds)
      .order("due_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  console.log("Tenant metrics calculated:", {
    properties: propertiesCount,
    maintenance: maintenanceCount.count,
    payment: latestPayment.data?.status,
  });

  return {
    totalProperties: propertiesCount || 0,
    pendingMaintenance: maintenanceCount.count || 0,
    paymentStatus: latestPayment.data?.status || "No payments",
  };
}

export function DashboardMetrics({ userId, userRole }: { userId: string; userRole: "landlord" | "tenant" }) {
  const { t } = useTranslation();
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["dashboard-metrics", userId, userRole],
    queryFn: () =>
      userRole === "landlord"
        ? fetchLandlordMetrics(userId)
        : fetchTenantMetrics(userId),
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <MetricCard
            key={i}
            title="Loading..."
            value="..."
            icon={Home}
            className="animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  if (userRole === "landlord") {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t('dashboard.metrics.totalProperties')}
          value={metrics.totalProperties}
          icon={Home}
        />
        <MetricCard
          title={t('dashboard.metrics.monthlyRevenue')}
          value={`$${metrics.monthlyRevenue?.toLocaleString()}`}
          icon={Wallet}
        />
        <MetricCard
          title={t('dashboard.metrics.activeTenants')}
          value={metrics.activeTenants}
          icon={Users}
        />
        <MetricCard
          title={t('dashboard.metrics.pendingMaintenance')}
          value={metrics.pendingMaintenance}
          icon={Settings}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <MetricCard
        title={t('dashboard.metrics.totalProperties')}
        value={metrics.totalProperties}
        icon={Home}
      />
      <MetricCard
        title={t('dashboard.metrics.pendingMaintenance')}
        value={metrics.pendingMaintenance}
        icon={Settings}
      />
      <MetricCard
        title={t('dashboard.metrics.paymentStatus')}
        value={metrics.paymentStatus}
        icon={Wallet}
      />
    </div>
  );
}