import { useQuery } from "@tanstack/react-query";
import { Home, Tool, Users, Wallet } from "lucide-react";
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
  const [propertiesCount, tenantsCount, maintenanceCount, revenueData] = await Promise.all([
    supabase
      .from("properties")
      .select("id", { count: "exact" })
      .eq("landlord_id", userId),
    supabase
      .from("tenancies")
      .select("id", { count: "exact" })
      .eq("status", "active")
      .in(
        "property_id",
        supabase
          .from("properties")
          .select("id")
          .eq("landlord_id", userId)
      ),
    supabase
      .from("maintenance_requests")
      .select("id", { count: "exact" })
      .eq("status", "pending")
      .in(
        "property_id",
        supabase
          .from("properties")
          .select("id")
          .eq("landlord_id", userId)
      ),
    supabase
      .from("properties")
      .select("monthly_rent")
      .eq("landlord_id", userId),
  ]);

  const totalRevenue = revenueData.data?.reduce(
    (sum, property) => sum + Number(property.monthly_rent),
    0
  ) || 0;

  return {
    totalProperties: propertiesCount.count || 0,
    monthlyRevenue: totalRevenue,
    activeTenants: tenantsCount.count || 0,
    pendingMaintenance: maintenanceCount.count || 0,
  };
}

async function fetchTenantMetrics(userId: string): Promise<Metrics> {
  const [currentTenancy, maintenanceCount, latestPayment] = await Promise.all([
    supabase
      .from("tenancies")
      .select("property:properties(name)")
      .eq("tenant_id", userId)
      .eq("status", "active")
      .single(),
    supabase
      .from("maintenance_requests")
      .select("id", { count: "exact" })
      .eq("tenant_id", userId)
      .eq("status", "pending"),
    supabase
      .from("payments")
      .select("status")
      .eq(
        "tenancy_id",
        supabase
          .from("tenancies")
          .select("id")
          .eq("tenant_id", userId)
          .eq("status", "active")
          .single()
      )
      .order("due_date", { ascending: false })
      .limit(1)
      .single(),
  ]);

  return {
    currentProperty: currentTenancy.data?.property?.name || "No active lease",
    pendingMaintenance: maintenanceCount.count || 0,
    paymentStatus: latestPayment.data?.status || "No payments",
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
          icon={Tool}
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
        icon={Tool}
      />
      <MetricCard
        title="Payment Status"
        value={metrics.paymentStatus}
        icon={Wallet}
      />
    </div>
  );
}