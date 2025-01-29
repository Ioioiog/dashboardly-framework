import React from "react";
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

type MaintenanceStatus = "pending" | "in_progress" | "completed" | "cancelled";

interface Filters {
  status: MaintenanceStatus | "all";
  priority: string;
  propertyId: string;
}

export default function Maintenance() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<Filters>({
    status: "all",
    priority: "all",
    propertyId: "all",
  });

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

  return (
    <div className="flex h-screen bg-dashboard-background">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{t("maintenance.title")}</h1>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("maintenance.newRequest")}
            </Button>
          </div>

          <MaintenanceFilters filters={filters} onFiltersChange={setFilters} />

          {maintenanceRequests?.length === 0 && !isLoading ? (
            <div className="text-center py-12">
              <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
              <h3 className="mt-4 text-lg font-semibold">
                {t("maintenance.noRequests")}
              </h3>
              <p className="mt-2 text-gray-500">
                {t("maintenance.createRequestPrompt")}
              </p>
            </div>
          ) : (
            <MaintenanceList
              requests={maintenanceRequests || []}
              isLoading={isLoading}
            />
          )}

          <MaintenanceDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          />
        </div>
      </div>
    </div>
  );
}