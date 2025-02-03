import React, { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import MaintenanceDialog from "@/components/maintenance/MaintenanceDialog";
import MaintenanceFilters from "@/components/maintenance/MaintenanceFilters";
import { ServiceProviderList } from "@/components/maintenance/ServiceProviderList";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useUserRole } from "@/hooks/use-user-role";
import { useAuthState } from "@/hooks/useAuthState";
import { MaintenanceHeader } from "@/components/maintenance/sections/MaintenanceHeader";
import { MaintenanceNavigation } from "@/components/maintenance/sections/MaintenanceNavigation";
import { RequestsSection } from "@/components/maintenance/sections/RequestsSection";

type MaintenanceStatus = "pending" | "in_progress" | "completed" | "cancelled";
type MaintenanceSection = "requests" | "providers";

interface Filters {
  status: MaintenanceStatus | "all";
  priority: string;
  propertyId: string;
}

export default function Maintenance() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { userRole } = useUserRole();
  const { currentUserId } = useAuthState();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedRequestId, setSelectedRequestId] = React.useState<string | undefined>();
  const [activeSection, setActiveSection] = React.useState<MaintenanceSection>("requests");
  const [filters, setFilters] = React.useState<Filters>({
    status: "all",
    priority: "all",
    propertyId: "all",
  });

  useEffect(() => {
    const channel = supabase
      .channel('maintenance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'maintenance_requests'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: maintenanceRequests, isLoading } = useQuery({
    queryKey: ["maintenance-requests", filters, currentUserId],
    queryFn: async () => {
      console.log("Fetching maintenance requests with filters:", filters);
      console.log("Current user role:", userRole);
      console.log("Current user ID:", currentUserId);
      
      let query = supabase
        .from("maintenance_requests")
        .select(`
          *,
          property:properties(name),
          tenant:profiles!maintenance_requests_tenant_id_fkey(
            first_name,
            last_name
          )
        `);

      // Filter based on user role and ID
      if (userRole === "tenant") {
        console.log("Adding tenant filter for ID:", currentUserId);
        query = query.eq("tenant_id", currentUserId);
      } else if (userRole === "service_provider") {
        query = query.eq("assigned_to", currentUserId);
      }

      if (filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      if (filters.priority !== "all") {
        query = query.eq("priority", filters.priority);
      }
      if (filters.propertyId !== "all") {
        query = query.eq("property_id", filters.propertyId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching maintenance requests:", error);
        throw error;
      }
      
      console.log("Raw maintenance requests data:", data);
      return data;
    },
  });

  const handleRequestClick = (requestId: string) => {
    setSelectedRequestId(requestId);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setSelectedRequestId(undefined);
    setIsDialogOpen(false);
  };

  const activeRequests = maintenanceRequests?.filter(
    (request) => request.status !== "completed"
  ) || [];

  const completedRequests = maintenanceRequests?.filter(
    (request) => request.status === "completed"
  ) || [];

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-8 space-y-8">
          <MaintenanceHeader onNewRequest={() => setIsDialogOpen(true)} />

          {userRole !== "tenant" && (
            <MaintenanceNavigation 
              activeSection={activeSection}
              onSectionChange={setActiveSection}
              showProviders={userRole !== "service_provider"}
            />
          )}

          {activeSection === "requests" ? (
            <>
              {userRole !== "tenant" && (
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <MaintenanceFilters filters={filters} onFiltersChange={setFilters} />
                </div>
              )}

              <RequestsSection
                title={t("maintenance.activeRequests")}
                requests={activeRequests}
                emptyTitle={t("maintenance.noActiveRequests")}
                emptyMessage={t("maintenance.noActiveRequestsMessage")}
                isLoading={isLoading}
                onRequestClick={handleRequestClick}
              />

              <RequestsSection
                title={t("maintenance.completedRequests")}
                requests={completedRequests}
                emptyTitle={t("maintenance.noCompletedRequests")}
                emptyMessage={t("maintenance.noCompletedRequestsMessage")}
                isLoading={isLoading}
                onRequestClick={handleRequestClick}
              />
            </>
          ) : userRole !== "tenant" && userRole !== "service_provider" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {t("maintenance.serviceProviders")}
                </h2>
              </div>
              <ServiceProviderList />
            </div>
          )}

          <MaintenanceDialog
            open={isDialogOpen}
            onOpenChange={handleDialogClose}
            requestId={selectedRequestId}
          />
        </div>
      </div>
    </div>
  );
}
