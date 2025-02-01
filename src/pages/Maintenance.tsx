import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Wrench, Users, List } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import MaintenanceList from "@/components/maintenance/MaintenanceList";
import MaintenanceDialog from "@/components/maintenance/MaintenanceDialog";
import MaintenanceFilters from "@/components/maintenance/MaintenanceFilters";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/use-user-role";
import { Card } from "@/components/ui/card";
import { NoDataCard } from "@/components/dashboard/charts/NoDataCard";

type MaintenanceStatus = "pending" | "in_progress" | "completed" | "cancelled";

interface Filters {
  status: MaintenanceStatus | "all";
  priority: string;
  propertyId: string;
}

type MaintenanceSection = "requests" | "providers";

export default function Maintenance() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userRole } = useUserRole();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedRequestId, setSelectedRequestId] = React.useState<string | undefined>();
  const [activeSection, setActiveSection] = React.useState<MaintenanceSection>("requests");
  const [filters, setFilters] = React.useState<Filters>({
    status: "all",
    priority: "all",
    propertyId: "all",
  });

  // Set up real-time subscription
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
    queryKey: ["maintenance-requests", filters],
    queryFn: async () => {
      console.log("Fetching maintenance requests with filters:", filters);
      console.log("Current user role:", userRole);
      
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
      
      console.log("Fetched maintenance requests:", data);
      return data;
    },
  });

  const { data: serviceProviders } = useQuery({
    queryKey: ["service-providers"],
    enabled: activeSection === "providers",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .eq("role", "service_provider");

      if (error) throw error;
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

  const navigationItems = [
    {
      id: 'requests' as MaintenanceSection,
      label: t("maintenance.requests"),
      icon: List,
    },
    {
      id: 'providers' as MaintenanceSection,
      label: t("maintenance.serviceProviders"),
      icon: Users,
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-8 space-y-8">
          {/* Header Section */}
          <div className="flex justify-between items-center bg-white rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-xl">
                  <Wrench className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {t("maintenance.title")}
                </h1>
              </div>
              <p className="text-gray-500 max-w-2xl">
                {t("maintenance.description")}
              </p>
            </div>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {t("maintenance.newRequest")}
            </Button>
          </div>

          {/* Navigation Menu */}
          <div className="w-full flex gap-4 bg-card p-4 rounded-lg shadow-sm overflow-x-auto">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? 'default' : 'ghost'}
                className={cn(
                  "flex-shrink-0 gap-2",
                  activeSection === item.id && "bg-primary text-primary-foreground"
                )}
                onClick={() => setActiveSection(item.id)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </div>

          {activeSection === "requests" ? (
            <>
              {/* Filters Section */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <MaintenanceFilters filters={filters} onFiltersChange={setFilters} />
              </div>

              {/* Active Requests Section */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">
                  {t("maintenance.activeRequests")}
                </h2>
                {isLoading ? (
                  <Card className="p-8">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </Card>
                ) : activeRequests.length > 0 ? (
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <MaintenanceList
                      requests={activeRequests}
                      isLoading={false}
                      onRequestClick={handleRequestClick}
                    />
                  </div>
                ) : (
                  <NoDataCard 
                    title={t("maintenance.noActiveRequests")}
                    message={t("maintenance.noActiveRequestsMessage")}
                  />
                )}
              </div>

              {/* Completed Requests Section */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">
                  {t("maintenance.completedRequests")}
                </h2>
                {isLoading ? (
                  <Card className="p-8">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </Card>
                ) : completedRequests.length > 0 ? (
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <MaintenanceList
                      requests={completedRequests}
                      isLoading={false}
                      onRequestClick={handleRequestClick}
                    />
                  </div>
                ) : (
                  <NoDataCard 
                    title={t("maintenance.noCompletedRequests")}
                    message={t("maintenance.noCompletedRequestsMessage")}
                  />
                )}
              </div>
            </>
          ) : (
            /* Service Providers List Section */
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="space-y-4">
                {serviceProviders?.map((provider) => (
                  <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{provider.first_name} {provider.last_name}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Maintenance Request Dialog */}
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