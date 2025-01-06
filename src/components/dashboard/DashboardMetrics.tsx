import { useQuery } from "@tanstack/react-query";
import { Home, Settings, Users, Wallet } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { supabase } from "@/integrations/supabase/client";

interface Metrics {
  totalProperties: number;
  monthlyRevenue: number;
  activeTenants: number;
  pendingMaintenance: number;
  currentProperty?: string;
  paymentStatus?: string;
}

async function fetchLandlordMetrics(userId: string): Promise<Metrics> {
  // First get the properties for this landlord
  const { data: properties } = await supabase
    .from("properties")
    .select("id, monthly_rent")
    .eq("landlord_id", userId);

  const propertyIds = properties?.map(p => p.id) || [];

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

  const totalRevenue = properties?.reduce(
    (sum, property) => sum + Number(property.monthly_rent),
    0
  ) || 0;

  return {
    totalProperties: properties?.length || 0,
    monthlyRevenue: totalRevenue,
    activeTenants: tenantsCount.count || 0,
    pendingMaintenance: maintenanceCount.count || 0,
  };
}

async function fetchTenantMetrics(userId: string): Promise<Metrics> {
  // First get the active tenancy
  const { data: currentTenancy } = await supabase
    .from("tenancies")
    .select("id, property:properties(name)")
    .eq("tenant_id", userId)
    .eq("status", "active")
    .maybeSingle();

  const [maintenanceCount, latestPayment] = await Promise.all([
    supabase
      .from("maintenance_requests")
      .select("id", { count: "exact" })
      .eq("tenant_id", userId)
      .eq("status", "pending"),
    currentTenancy?.id
      ? supabase
          .from("payments")
          .select("status")
          .eq("tenancy_id", currentTenancy.id)
          .order("due_date", { ascending: false })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    currentProperty: currentTenancy?.property?.name || "No active lease",
    pendingMaintenance: maintenanceCount.count || 0,
    paymentStatus: latestPayment?.data?.status || "No payments",
    totalProperties: 0,
    monthlyRevenue: 0,
    activeTenants: 0,
  };
}

export function DashboardMetrics({ userId, userRole }: { userId: string; userRole: "landlord" | "tenant" }) {
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
          title="Total Properties"
          value={metrics.totalProperties}
          icon={Home}
        />
        <MetricCard
          title="Monthly Revenue"
          value={`$${metrics.monthlyRevenue.toLocaleString()}`}
          icon={Wallet}
        />
        <MetricCard
          title="Active Tenants"
          value={metrics.activeTenants}
          icon={Users}
        />
        <MetricCard
          title="Pending Maintenance"
          value={metrics.pendingMaintenance}
          icon={Settings}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <MetricCard
        title="Current Property"
        value={metrics.currentProperty || "No active lease"}
        icon={Home}
      />
      <MetricCard
        title="Pending Maintenance"
        value={metrics.pendingMaintenance}
        icon={Settings}
      />
      <MetricCard
        title="Payment Status"
        value={metrics.paymentStatus}
        icon={Wallet}
      />
    </div>
  );
}