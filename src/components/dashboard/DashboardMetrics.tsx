import { useQuery } from "@tanstack/react-query";
import { Home, Settings, Wallet } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { supabase } from "@/integrations/supabase/client";

interface Metrics {
  currentProperty?: string;
  pendingMaintenance: number;
  paymentStatus?: string;
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
  };
}

export function DashboardMetrics({ userId, userRole }: { userId: string; userRole: "landlord" | "tenant" }) {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["dashboard-metrics", userId, userRole],
    queryFn: () => fetchTenantMetrics(userId),
    enabled: userRole === "tenant",
  });

  if (userRole !== "tenant") {
    return null;
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
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