import { useQuery } from "@tanstack/react-query";
import { Home, Settings, Users, Wallet } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Metrics {
  totalProperties?: number;
  monthlyRevenue?: number;
  activeTenants?: number;
  pendingMaintenance: number;
  paymentStatus?: string;
  revenueDetails?: Array<{
    property_name: string;
    amount: number;
    due_date: string;
    status: string;
  }>;
}

async function fetchLandlordMetrics(userId: string): Promise<Metrics> {
  console.log("Fetching landlord metrics for user:", userId);
  
  // Get properties with active tenancies and their monthly rents
  const { data: properties, error } = await supabase
    .from("properties")
    .select(`
      id,
      monthly_rent,
      tenancies (
        id,
        status,
        start_date,
        end_date
      )
    `)
    .eq("landlord_id", userId);

  if (error) {
    console.error("Error fetching properties:", error);
    throw error;
  }

  if (!properties) {
    console.log("No properties found for landlord");
    return {
      totalProperties: 0,
      monthlyRevenue: 0,
      activeTenants: 0,
      pendingMaintenance: 0,
    };
  }

  // Calculate monthly revenue only from properties with active tenancies
  const currentDate = new Date().toISOString();
  const monthlyRevenue = properties.reduce((sum, property) => {
    const hasActiveTenancy = property.tenancies?.some(tenancy => 
      tenancy.status === 'active' && 
      tenancy.start_date <= currentDate &&
      (!tenancy.end_date || tenancy.end_date > currentDate)
    );
    
    return hasActiveTenancy ? sum + Number(property.monthly_rent) : sum;
  }, 0);

  console.log("Monthly revenue from active tenancies:", monthlyRevenue);

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

  console.log("Landlord metrics calculated:", {
    properties: properties.length,
    revenue: monthlyRevenue,
    tenants: tenantsCount.count,
    maintenance: maintenanceCount.count,
  });

  return {
    totalProperties: properties.length,
    monthlyRevenue: monthlyRevenue,
    activeTenants: tenantsCount.count || 0,
    pendingMaintenance: maintenanceCount.count || 0,
  };
}

async function fetchTenantMetrics(userId: string): Promise<Metrics> {
  console.log("Fetching tenant metrics for user:", userId);
  
  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

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

  // Get the latest payment and revenue details
  const { data: tenancies } = await supabase
    .from("tenancies")
    .select("id, property:properties(id, name, monthly_rent)")
    .eq("tenant_id", userId)
    .eq("status", "active");

  const tenancyIds = tenancies?.map(t => t.id) || [];

  const [maintenanceCount, latestPayment, revenueDetails] = await Promise.all([
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
    supabase
      .from("payments")
      .select(`
        amount,
        due_date,
        status,
        tenancy:tenancies(
          property:properties(name)
        )
      `)
      .in("tenancy_id", tenancyIds)
      .gte("due_date", firstDayOfMonth.toISOString())
      .lte("due_date", lastDayOfMonth.toISOString())
  ]);

  const formattedRevenueDetails = revenueDetails.data?.map(payment => ({
    property_name: payment.tenancy.property.name,
    amount: payment.amount,
    due_date: payment.due_date,
    status: payment.status
  })) || [];

  console.log("Tenant metrics calculated:", {
    properties: propertiesCount,
    maintenance: maintenanceCount.count,
    payment: latestPayment.data?.status,
    revenueDetails: formattedRevenueDetails
  });

  return {
    totalProperties: propertiesCount || 0,
    pendingMaintenance: maintenanceCount.count || 0,
    paymentStatus: latestPayment.data?.status || "No payments",
    revenueDetails: formattedRevenueDetails
  };
}

export function DashboardMetrics({ userId, userRole }: { userId: string; userRole: "landlord" | "tenant" }) {
  const { t } = useTranslation();
  const [showRevenueDetails, setShowRevenueDetails] = useState(false);
  
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["dashboard-metrics", userId, userRole],
    queryFn: () =>
      userRole === "landlord"
        ? fetchLandlordMetrics(userId)
        : fetchTenantMetrics(userId),
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-fade-in">
        {[...Array(4)].map((_, i) => (
          <MetricCard
            key={i}
            title="Loading..."
            value="..."
            icon={Home}
            className="bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-lg transition-all duration-300"
          />
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  const handleRevenueClick = () => {
    if (userRole === "tenant" && metrics.revenueDetails?.length) {
      setShowRevenueDetails(true);
    }
  };

  if (userRole === "landlord") {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-fade-in">
        <MetricCard
          title={t('dashboard.metrics.totalProperties')}
          value={metrics.totalProperties}
          icon={Home}
          route="/properties"
          className="bg-gradient-to-br from-white to-blue-50 shadow-md hover:shadow-lg transition-all duration-300"
          description="Total managed properties"
        />
        <MetricCard
          title={t('dashboard.metrics.monthlyRevenue')}
          value={`$${metrics.monthlyRevenue?.toLocaleString()}`}
          icon={Wallet}
          description={t('dashboard.revenue.title')}
          className="bg-gradient-to-br from-white to-green-50 shadow-md hover:shadow-lg transition-all duration-300"
        />
        <MetricCard
          title={t('dashboard.metrics.activeTenants')}
          value={metrics.activeTenants}
          icon={Users}
          route="/tenants"
          className="bg-gradient-to-br from-white to-purple-50 shadow-md hover:shadow-lg transition-all duration-300"
          description="Currently active tenants"
        />
        <MetricCard
          title={t('dashboard.metrics.pendingMaintenance')}
          value={metrics.pendingMaintenance}
          icon={Settings}
          route="/maintenance"
          className="bg-gradient-to-br from-white to-orange-50 shadow-md hover:shadow-lg transition-all duration-300"
          description="Pending maintenance requests"
        />
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-3 animate-fade-in">
        <MetricCard
          title={t('dashboard.metrics.totalProperties')}
          value={metrics.totalProperties}
          icon={Home}
          route="/properties"
          className="bg-gradient-to-br from-white to-blue-50 shadow-md hover:shadow-lg transition-all duration-300"
          description="Your rented properties"
        />
        <MetricCard
          title={t('dashboard.metrics.pendingMaintenance')}
          value={metrics.pendingMaintenance}
          icon={Settings}
          route="/maintenance"
          className="bg-gradient-to-br from-white to-orange-50 shadow-md hover:shadow-lg transition-all duration-300"
          description="Open maintenance requests"
        />
        <MetricCard
          title={t('dashboard.metrics.paymentStatus')}
          value={metrics.paymentStatus}
          icon={Wallet}
          onClick={handleRevenueClick}
          className="bg-gradient-to-br from-white to-green-50 shadow-md hover:shadow-lg transition-all duration-300"
          description="Click to view monthly payments"
        />
      </div>

      <Dialog open={showRevenueDetails} onOpenChange={setShowRevenueDetails}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Monthly Revenue Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {metrics.revenueDetails?.map((detail, index) => (
              <div 
                key={index}
                className="p-4 rounded-lg bg-gradient-to-br from-white to-gray-50 shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{detail.property_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Due: {new Date(detail.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${detail.amount.toLocaleString()}</p>
                    <span className={`text-sm ${
                      detail.status === 'paid' 
                        ? 'text-green-600' 
                        : detail.status === 'pending' 
                          ? 'text-orange-600' 
                          : 'text-red-600'
                    }`}>
                      {detail.status.charAt(0).toUpperCase() + detail.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {(!metrics.revenueDetails || metrics.revenueDetails.length === 0) && (
              <p className="text-center text-muted-foreground py-4">
                No revenue details available for this month
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}