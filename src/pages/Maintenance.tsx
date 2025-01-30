import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import MaintenanceList from "@/components/maintenance/MaintenanceList";
import MaintenanceDialog from "@/components/maintenance/MaintenanceDialog";
import MaintenanceFilters from "@/components/maintenance/MaintenanceFilters";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useQueryClient } from "@tanstack/react-query";

type MaintenanceStatus = "pending" | "in_progress" | "completed" | "cancelled";

interface Filters {
  status: MaintenanceStatus | "all";
  priority: string;
  propertyId: string;
}

export default function Maintenance() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedRequestId, setSelectedRequestId] = React.useState<string | undefined>();
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

  return (
    <div className="flex h-screen bg-dashboard-background">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-8 space-y-8">
          <div className="flex justify-between items-center bg-white rounded-lg p-6 shadow-sm">
            <h1 className="text-2xl font-semibold text-gray-900">{t("maintenance.title")}</h1>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("maintenance.newRequest")}
            </Button>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <MaintenanceFilters filters={filters} onFiltersChange={setFilters} />
          </div>

          {maintenanceRequests?.length === 0 && !isLoading ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {t("maintenance.noRequests")}
              </h3>
              <p className="mt-2 text-gray-500">
                {t("maintenance.createRequestPrompt")}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <MaintenanceList
                requests={maintenanceRequests || []}
                isLoading={isLoading}
                onRequestClick={handleRequestClick}
              />
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